from distutils.command.config import config
from threading import local
from flask import Flask, abort, jsonify, request
from pathlib import Path
import os
import sys

from models.hierarchy import Hierarchy, Node
from models.alternative import Alternative, Value
from models.reference import Reference
from models.shared import db # Allows the models to be split out into separate files.


def get_config_path():
    if hasattr(sys, "_MEIPASS"):
        abs_home = os.path.abspath(os.path.expanduser("~"))
        abs_dir_app = os.path.join(abs_home, f"hierarchyDashboard")
        if not os.path.exists(abs_dir_app):
            os.mkdir(abs_dir_app)
        return abs_dir_app
    else:
       return ""

# app
app = Flask(__name__)

# app configurations
home_path = os.path.join(get_config_path(), "app.db")
database_path = 'sqlite:///' + Path(home_path).as_posix()
app.config["SQLALCHEMY_DATABASE_URI"] = database_path
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = 0
app.config["JSON_SORT_KEYS"] = False

# initialize the app using the same db that's in shared.py
db.init_app(app)


### ROUTES ###
# HIERARCHiES
@app.route("/hierarchy", methods=['POST'])
def create_hierarchy():
    # Get data from .json sent with request
    data = request.get_json()

    # Create hierarchy
    hierarchy = Hierarchy(
        name=data["name"],
        description=data["description"]
    )

    # Create root of tree and associate it with hierarchy. 
    if "root" in data:
        root_name = data["root"]["name"]
        root = Node(root_name)
    else:
        root = Node(hierarchy.name)
    
    hierarchy.nodes.append(root)
   
    # Parse nodes and create tree
    nodes_lst = data["root"]["children"]
    if nodes_lst:
        root.create_tree(nodes_lst)

    # Commit changes to DB
    db.session.add(hierarchy)
    db.session.commit()

    # Parse and create alternatives
    alternatives = data["alternatives"]
    new_alts = []
    for alternative in alternatives:
        new_alts.append(Alternative.create(hierarchy, alternative))

    if None in alternatives:
        abort(204, description="Problem with Alternatives")

    root.refresh_weights()
    hierarchy.refresh_alternatives()
    db.session.add(hierarchy)
    db.session.commit()

    return hierarchy.to_dict(), 201


@app.route("/hierarchy/ascending_id", methods=['GET'])
def get_all_hierarchies_ascending():
    all_hierarchies = Hierarchy.get_list(get_nodes=False, get_alts=False)

    if not all_hierarchies:
        abort(404, description="Resource not found")

    return jsonify(all_hierarchies), 200


@app.route("/hierarchy/descending_id", methods=['GET'])
def get_all_hierarchies_descending():
    all_hierarchies = Hierarchy.get_list(get_nodes=False, get_alts=False)
    all_hierarchies.reverse()

    if not all_hierarchies:
        abort(404, description="Resource not found")

    return jsonify(all_hierarchies), 200


@app.route("/hierarchy/<hierarchy_id>", methods=['GET'])
def get_one_hierarchy(hierarchy_id):
    hierarchy = Hierarchy.query.filter_by(id=hierarchy_id).first()
    
    if not hierarchy:
        abort(404, description="Resource not found")

    return jsonify(hierarchy.to_dict()), 200


@app.route("/hierarchy/<hierarchy_id>/export", methods=['GET'])
def export_hierarchy(hierarchy_id):
    hierarchy = Hierarchy.query.filter_by(id=hierarchy_id).first()
    
    if not hierarchy:
        abort(404, description="Resource not found")

    return jsonify(hierarchy.to_dict(export=True)), 200


# TODO Reduce the code duplication in the DELETE Routes
@app.route("/hierarchy/<hierarchy_id>", methods=['DELETE'])
def delete_hierarchy(hierarchy_id):
    hierarchy = Hierarchy.query.filter_by(id=hierarchy_id).first()

    # hierarchy does not exist, return 404
    if not hierarchy:
        abort(404, description="Resource not found")

    db.session.delete(hierarchy)
    db.session.commit()

    message = f"Hierarchy {hierarchy_id} Deleted"
    return jsonify({"message": message}), 200

# NODES
# Will never not have a root node. If you do, things are messed
# TODO: Clean up the check between old and new measures. It works but it's sloppy.
@app.route("/hierarchy/<hierarchy_id>/node/<parent_id>", methods=['POST'])
def create_node(hierarchy_id, parent_id):
    data = request.get_json()

    hierarchy = Hierarchy.query.filter_by(id=hierarchy_id).first()
    parent = Node.query.filter_by(id=parent_id, hierarchy_id=hierarchy_id).first()
    old_measurements = hierarchy.get_measurements()
    old_measurements = [r for r in old_measurements]

    if not parent:
        abort(404, description="Resource not found")
    
    new_node = parent.create(data)

    # Commit changes to DB
    db.session.add(new_node)
    db.session.commit()

    # Create new null values for new measurement nodes
    updated_measurements = hierarchy.get_measurements()
    updated_measurements = [r for r in updated_measurements]
    alternatives = Alternative.query.filter_by(hierarchy_id=hierarchy_id)

    for measure in updated_measurements:
        if measure not in old_measurements:
            for alt in alternatives:
                new_value = Value(alt, measure)

                db.session.add(new_value)

    # Should automatically balance weights as nodes are created.
    parent.refresh_weights()
    # global_value will redo calculations with balanced weights.
    for alt in alternatives:
        alt.refresh_values()
    db.session.commit()

    return jsonify(parent.to_dict()), 201
    

#TODO: Improve Patch. Talk to Luke about how this route will be used.
@app.route("/hierarchy/<hierarchy_id>/node/<node_id>", methods=['PATCH'])
def patch_node(hierarchy_id, node_id):
    data = request.get_json()

    node = Node.query.filter_by(id=node_id, hierarchy_id=hierarchy_id).first()
    references = Reference.query.filter_by(node_id=node.id)

    if not node:
        abort(404, description="Resource not found")

    hierarchy = node.hierarchy
    parent = node.parent

    # All Nodes
    if 'name' in data:
        node.name = data['name']
    if 'icon' in data:
        node.icon = data['icon']
    
    # Measurement Node
    if 'measurementDefinition' in data:
        m_data = data['measurementDefinition']
        if 'measurementType' in m_data:
            node.measurement_type = m_data['measurementType']
        if 'VFType' in m_data:
            node.vf_type = m_data['VFType']
        # An issue for a dreamlike future.
        if node.vf_type == "Linear":
            if 'referencePoints' in m_data:
                ref_data = m_data['referencePoints']

                if node.references and len(node.references) == 2:
                    i = 0
                    for ref in node.references:
                        ref.x = ref_data[i]['x']
                        ref.y = ref_data[i]['y']
                        i += 1
                else:
                    for i in range(2):
                        print(ref_data)
                        if not ref_data[i]['x'] == None and not ref_data[i]['y'] == None:
                            print(ref_data)
                            Reference(node, ref_data[i]['x'], ref_data[i]['y'])
                        else:
                            Reference(node, 0, 0)

    # Root node has no parent, but it should still refresh weights.
    if parent:
        parent.refresh_weights()
    else:
        node.refresh_weights()

    hierarchy.refresh_alternatives()
    db.session.commit()

    return jsonify(node.to_dict()), 201
    

@app.route("/hierarchy/<hierarchy_id>/node/<node_id>", methods=['DELETE'])
def delete_node(hierarchy_id, node_id):
    hierarchy = Hierarchy.query.filter_by(id=hierarchy_id).first()
    node = Node.query.filter_by(id=node_id).first()

    # node does not exist, return 404
    if not hierarchy or not node:
        abort(404, description="Resource not found")

    root_node = hierarchy.nodes[0]
    if root_node == node:
        abort(405, description="Protected Resource")

    parent = node.parent
    db.session.delete(node)
    
    parent.refresh_weights()
    hierarchy.refresh_alternatives()
    db.session.commit()

    return jsonify(parent.to_dict()), 200


# ALTERNATIVES
@app.route("/hierarchy/<hierarchy_id>/alternative", methods=['POST'])
def create_alternative(hierarchy_id):
    data = request.get_json()
    
    hierarchy = Hierarchy.query.filter_by(id=hierarchy_id).first()
    
    if not hierarchy:
        abort(404, description="Resource not found")

    alternative = Alternative.create(hierarchy, data)

    if not alternative:
        abort(404, description="Resource not found")

    db.session.add(alternative)
    db.session.commit()

    return alternative.to_dict(), 201


@app.route("/hierarchy/<hierarchy_id>/alternative/<alternative_id>", methods=['GET'])
def get_alternative(hierarchy_id, alternative_id):
    alternative = Alternative.query.filter_by(id=alternative_id, hierarchy_id=hierarchy_id).first()
    if not alternative:
        abort(404, description="Resource not found")

    return alternative.to_dict(), 200


@app.route("/hierarchy/<hierarchy_id>/alternative/<alternative_id>", methods=['DELETE'])
def delete_alternative(hierarchy_id, alternative_id):
    alternative = Alternative.query.filter_by(id=alternative_id, hierarchy_id=hierarchy_id).first()
    if not alternative:
        abort(404, description="Resource not found")

    db.session.delete(alternative)
    db.session.commit()

    message = f"Alternative {alternative_id} Deleted"
    return jsonify({"message": message}), 200


@app.route("/hierarchy/<hierarchy_id>/alternative/<alternative_id>/node/<node_id>", methods=['PATCH'])
def patch_value(hierarchy_id, alternative_id, node_id):
    data = request.get_json()
    value = Value.query.filter_by(node_id=node_id, alternative_id=alternative_id).first()
    if not value:
        abort(404, description="Resource not found")

    # Change individual measure in the value table
    if "measure" in data:
        value.measure=data["measure"]
        value.refresh_value()

    db.session.commit()

    return value.to_dict(), 201


# WEIGHTING
# Weight changes are done using the weighting models. You aren't able to directly
# change the weight of a node.
@app.route("/hierarchy/<hierarchy_id>/node/<node_id>", methods=['PATCH'])
def change_weight(hierarchy_id, node_id):
    pass


# TODO: Direct Assessment
@app.route("/hierarchy/<hierarchy_id>/node/<parent_id>/weights/directAssessment", methods=['PATCH'])
def direct_assessment(hierarchy_id, parent_id):
    # Get data (new weights)
    data = request.get_json()
    print(data)
    print(data[0])

    parent = Node.query.filter_by(id=parent_id, hierarchy_id=hierarchy_id).first()
    children = [child for child in parent.children]
    child_ids = [child.id for child in children]

    node_ids = [obj['nodeId'] for obj in data]
    # Check that the children to change are a subset of the children of the parent
    if not all(int(node_id) in child_ids for node_id in node_ids):
        abort(404, description="Resource not found")

    for obj in data:
        node_id = obj["nodeId"]
        for child in children:
            if child.id == int(node_id):
                child.local_weight = obj['weight']

    # Refresh all local and global weights for the subtree
    parent.refresh_weights()
    parent.hierarchy.refresh_alternatives()
    db.session.commit()

    return jsonify(parent.to_dict()), 201


# TODO: Pair Wise
@app.route("/hierarchy/<hierarchy_id>/node/<parent_id>/weights/pairWise", methods=['PATCH'])
def pairwise(hierarchy_id, parent_id):
    # TODO: Ask Sharjeel if the matrix uses negative values?
    # Get data (new weight)
    # [
    #     {
    #         "nodeId":1,
    #         "pairComparison":{
    #                             nodeId:3,
    #                             nodeId:6, nodeId is the id of the node that 1 is being compared to.
    #                             nodeId:1,
    #                         }
    #     },
    #     ...
    # ]

    # Get the number of nodes
    # Get the children of parent
    # Compare, if they aren't equal, abort
    # Create node_number x node_number matrix
    # Populate the diagonal with 1
    # Populate the other cells with sent data and it's inverse
    # 0,0 = 1 0,1 = data 1,0 = 1/data

    pass


# TODO: Swing Weights
@app.route("/hierarchy/<hierarchy_id>/node/<parent_id>/weights/directAssessment", methods=['PATCH'])
def swing_weight(hierarchy_id, parent_id):
    # MVP: Direct Assessment using swing weight values
    # [{"nodeId":1},"swingWeight":.2},...]
    pass


# RANKING
@app.route("/hierarchy/<hierarchy_id>/alternative/ranking", methods=['GET'])
def rank_alternatives(hierarchy_id):
    hierarchy = Hierarchy.query.filter_by(id=hierarchy_id).first()
    measurements = hierarchy.get_measurements()

    # Generate a dictionary whose keys are alternative_ids
    rankings = {}
    for alt in hierarchy.alternatives:
        rankings[alt.id] = {
            "name": alt.name,
            "total": 0,
        }

    # For each measurement, normalize and weight all values
    for measurement in measurements:
        for value in measurement.values:
            weighted_value = measurement.normalize(value.measure) * measurement.global_weight

            # Add the corrected value to the rankings dict under the correct alternative.
            rankings[value.alternative_id][measurement.name] = weighted_value
            rankings[value.alternative_id]["total"] += weighted_value
    
    return jsonify(rankings), 200


if __name__ == "__main__":
    # Create the database if it doesn't exist
    config_path = os.path.join(get_config_path(), "app.db")
    path = Path(config_path)
    if not path.is_file():
        with app.app_context():
            db.create_all()

    app.run(debug=True)
