from distutils.command.config import config
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
    hierarchy = Hierarchy.query.filter_by(id=hierarchy_id).first()
    
    if not hierarchy:
        abort(404, description="Resource not found")

    # https://stackoverflow.com/questions/16093475/flask-sqlalchemy-querying-a-column-with-not-equals
    # https://docs.sqlalchemy.org/en/14/core/sqlelement.html#sqlalchemy.sql.operators.ColumnOperators.isnot
    # Get all measurement nodes of the given hierarchy
    measurements = Node.query.filter(Node.measurement_type != None, Node.hierarchy_id == hierarchy_id)
    validNodeIds = []
    for measurement in measurements:
        validNodeIds.append(measurement.id)

    data = request.get_json()

    # Create alternative
    alternative = Alternative(
        hierarchy_id,
        name=data["name"]
    )

    if "values" in data:
        for value in data["values"]:

            # Generate null values if a value is not provided for a measurement
            if "measure" in value:
                measure = value["measure"]
            else:
                measure = None

            if "local_value" in value:
                local_value = value["local_value"]
            else:
                local_value = None
                
            if "global_value" in value:
                global_value = value["global_value"]
            else:
                global_value = None

            # Generate values with alternative_id
            # Values must match up with measurement nodes
            if value["nodeId"] in validNodeIds:
                value = Value(value["nodeId"], measure, local_value, global_value)
                alternative.values.append(value)
            else:
                abort(404, description="Node ID not valid")

    db.session.add(alternative)
    db.session.commit()

    return alternative.to_dict(), 201


# TODO: Get Alternative
@app.route("/hierarchy/<hierarchy_id>/alternative/<alternative_id>")
def get_alternative(hierarchy_id, alternative_id, methods=['GET']):
    hierarchy = Hierarchy.query.filter_by(id=hierarchy_id).first()
    if not hierarchy:
        abort(404, description="Resource not found")

    alternative = Alternative.query.filter_by(id=alternative_id).first()
    if not alternative:
        abort(404, description="Resource not found")

    return alternative.to_dict(), 200


# TODO: Delete Alternative
@app.route("/hierarchy/<hierarchy_id>/alternative/<alternative_id>", methods=['DELETE'])
def delete_alternative(hierarchy_id, alternative_id):
    hierarchy = Hierarchy.query.filter_by(id=hierarchy_id).first()
    if not hierarchy:
        abort(404, description="Resource not found")

    alternative = Alternative.query.filter_by(id=alternative_id).first()
    if not alternative:
        abort(404, description="Resource not found")

    db.session.delete(alternative)
    db.session.commit()

    message = f"Alternative {alternative_id} Deleted"
    return jsonify({"message": message}), 200


# TODO: Patch Value
@app.route("/hierarchy/<hierarchy_id>/alternative/<alternative_id>/value/<value_id>")
def patch_value(hierarchy_id, alternative_id, value_id):
    # Check the hierarchy, alternative, and value exist
        # Abort if they don't

    # Change individual measure in the value table
    # Local and global values are regenerated according to weighting functions
    # that don't exist yet
    pass


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
