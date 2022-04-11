from distutils.command.config import config
from threading import local
from flask import Flask, abort, jsonify, request
from pathlib import Path
import os
import sys

from models.hierarchy import Hierarchy, Node
from models.alternative import Alternative, Value
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


# routes
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

    return hierarchy.to_dict(), 201


# Will never not have a root node. If you do, things are messed
@app.route("/hierarchy/<hierarchy_id>/node/<parent_id>", methods=['POST'])
def create_node(hierarchy_id, parent_id):
    data = request.get_json()

    parent = Node.query.filter_by(id=parent_id, hierarchy_id=hierarchy_id).first()

    if not parent:
        abort(404, description="Resource not found")
    
    new_node = parent.create(data)

    # Commit changes to DB
    db.session.add(new_node)
    db.session.commit()

    return jsonify(parent.to_dict()), 201
    

#TODO: Patch Node
@app.route("/hierarchy/<hierarchy_id>/node/<node_id>", methods=['PATCH'])
def update_node(hierarchy_id, parent_id):
    pass


@app.route("/hierarchy/ascending_id", methods=['GET'])
def get_all_hierarchies_ascending():
    all_hierarchies = Hierarchy.get_list(get_nodes=False)

    if not all_hierarchies:
        abort(404, description="Resource not found")

    return jsonify(all_hierarchies), 200


@app.route("/hierarchy/descending_id", methods=['GET'])
def get_all_hierarchies_descending():
    all_hierarchies = Hierarchy.get_list(get_nodes=False)
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

    db.session.delete(node)
    db.session.commit()

    message = f"Node {node_id} Deleted"
    return jsonify({"message": message}), 200


# ALTERNATIVES

# TODO: Create Alternative
@app.route("/hierarchy/<hierarchy_id>/alternative", methods=['POST'])
def create_alternative(hierarchy_id):
    data = request.get_json()
    
    hierarchy = Hierarchy.query.filter_by(id=hierarchy_id).first()
    
    if not hierarchy:
        abort(404, description="Resource not found")

    # Create alternative
    alternative = Alternative(
        name=data["name"]
    )

    # TODO:
    # An alternative should still be created, but with all fields None
    # Even if there are no values in data
    if "values" in data:
        # Check each value's nodeId belongs to an existing node.
        measurements = Node.query.filter(Node.measurement_type != None, Node.hierarchy_id == hierarchy.id)
        measurement_ids = []
        for measurement in measurements:
            measurement_ids.append(measurement.id)
        
        value_node_ids = []
        for value in data["values"]:
            value_node_ids.append(value['nodeId'])

        # Fancy way to check if value_node_ids is a subset of measurement_ids
        if not all(value_node_id in measurement_ids for value_node_id in value_node_ids):
            abort(404, description="Resource not found")

        for measurement in measurements:
            new_value = Value(
                alternative=alternative,
                measurement=measurement,
            )
            
            if measurement.id in value_node_ids:
                for value in data['values']:
                    if value['nodeId'] == measurement.id:
                        # Substitute values
                        if "measure" in value:
                            new_value.measure = value["measure"]
                        if "localValue" in value:
                            new_value.local_value = value["localValue"]
                        if "globalValue" in value:
                            new_value.global_value = value["globalValue"]

    hierarchy.append(alternative) # alternative and values get hierarchy_id from this line
    db.session.add(alternative)
    db.session.commit()

    return alternative.to_dict(), 201


# TODO: Get Alternative
@app.route("/hierarchy/<hierarchy_id>/alternative/<alternative_id>", methods=['GET'])
def get_alternative(hierarchy_id, alternative_id):
    alternative = Alternative.query.filter_by(id=alternative_id, hierarchy_id=hierarchy_id).first()
    if not alternative:
        abort(404, description="Resource not found")

    return alternative.to_dict(), 200


# TODO: Delete Alternative
@app.route("/hierarchy/<hierarchy_id>/alternative/<alternative_id>", methods=['DELETE'])
def delete_alternative(hierarchy_id, alternative_id):
    alternative = Alternative.query.filter_by(id=alternative_id, hierarchy_id=hierarchy_id).first()
    if not alternative:
        abort(404, description="Resource not found")

    db.session.delete(alternative)
    db.session.commit()

    message = f"Alternative {alternative_id} Deleted"
    return jsonify({"message": message}), 200


@app.route("/hierarchy/<hierarchy_id>/alternative/<alternative_id>/value/<node_id>", methods=['PATCH'])
def patch_value(hierarchy_id, alternative_id, node_id):
    hierarchy = Hierarchy.query.filter_by(id=hierarchy_id).first()
    if not hierarchy:
        abort(404, description="Resource not found")

    alternative = Alternative.query.filter_by(id=alternative_id, hierarchy_id=hierarchy_id).first()
    if not alternative:
        abort(404, description="Resource not found")

    value = Value.query.filter_by(node_id=node_id, alternative_id=alternative_id).first()
    if not value:
        abort(404, description="Resource not found")

    # Change individual measure in the value table
    data = request.get_json()
    if "value" in data:
        value.measure=data["value"]

    db.session.commit()

    return value.to_dict(), 201


# TODO: Update Alternative Measure (the variable from the frontend)
@app.route("/hierarchy/<hierarchy_id>/node/<parent_id>/alternative/<alternative_id>/measure", methods=['PATCH'])
def update_measure(hierarchy_id, parent_id, alternative_id):
    pass


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
    # [{"nodeId":1},"weight":.2},...]
    # Get nodes on the same level (children of parent)

    # If there aren't enough weights for each child
        # Return error

    # Check each weight
    # Rebalance??
    pass


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

if __name__ == "__main__":
    # Create the database if it doesn't exist
    config_path = os.path.join(get_config_path(), "app.db")
    path = Path(config_path)
    if not path.is_file():
        with app.app_context():
            db.create_all()

    app.run(debug=True)
