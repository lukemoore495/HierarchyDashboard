from flask import Flask, abort, jsonify, request
from pathlib import Path

from models.hierarchy import Hierarchy, Node, Measurement
from models.shared import db


# app
app = Flask(__name__)

# app configurations
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = 0
app.config["JSON_SORT_KEYS"] = False

db.init_app(app)


# routes
# TODO Add checks that hierarchies/nodes exist before adding subordinate resources
@app.route("/hierarchy", methods=['POST'])
def create_hierarchy():
    # Get data from .json sent with request
    data = request.get_json()

    # Create Hierarchy
    new_hierarchy = Hierarchy.create(data)

    # Parse and create Nodes
    nodes_lst = data["nodes"]
    Node.create_nodes(nodes_lst, new_hierarchy.id)

    return jsonify(new_hierarchy.to_dict()), 201


# To add a node to the root of the hierarchy, send 0 for parent_id
@app.route("/hierarchy/<hierarchy_id>/node/<parent_id>", methods=['POST'])
def create_node(hierarchy_id, parent_id):
    data = request.get_json()

    if parent_id == 0:
        parent_id = None

    if "icon" in data:
        icon = data["icon"]
    else:
        icon = None

    new_node = Node.create(
        data,
        hierarchy_id=hierarchy_id,
        parent_id=parent_id,
        icon=icon
    )

    return jsonify(new_node.to_dict()), 201


@app.route("/hierarchy/<hierarchy_id>/node/<node_id>/measurement", methods=['POST'])
def create_measurement(hierarchy_id, node_id):
    data = request.get_json()

    new_measurement = Measurement.create(
        data,
        hierarchy_id=hierarchy_id,
        node_id=node_id,
    )

    return jsonify(new_measurement.to_dict()), 201


@app.route("/hierarchy/ascending_id", methods=['GET'])
def get_all_hierarchies_ascending():
    all_hierarchies = Hierarchy.get_list(False)

    if not all_hierarchies:
        abort(404, description="Resource not found")

    return jsonify(all_hierarchies), 200


@app.route("/hierarchy/descending_id", methods=['GET'])
def get_all_hierarchies_descending():
    all_hierarchies = Hierarchy.get_list(False)
    all_hierarchies.reverse()

    if not all_hierarchies:
        abort(404, description="Resource not found")

    return jsonify(all_hierarchies), 200


@app.route("/hierarchy/<hierarchy_id>", methods=['GET'])
def get_one_hierarchy(hierarchy_id):
    hierarchy = Hierarchy.get(hierarchy_id)
    
    if not hierarchy:
        abort(404, description="Resource not found")

    return jsonify(hierarchy.to_dict()), 200


# TODO Reduce the code duplication in the DELETE Routes
@app.route("/hierarchy/<hierarchy_id>", methods=['DELETE'])
def delete_hierarchy(hierarchy_id):
    hierarchy = Hierarchy.get(hierarchy_id)

    # hierarchy does not exist, return 404
    if not hierarchy:
        abort(404, description="Resource not found")

    db.session.delete(hierarchy)
    db.session.commit()

    message = f"Hierarchy {hierarchy_id} Deleted"
    return jsonify({"message": message}), 200


@app.route("/node/<node_id>", methods=['DELETE'])
def delete_node(node_id):
    node = Node.get(node_id)

    # node does not exist, return 404
    if not node:
        abort(404, description="Resource not found")

    db.session.delete(node)
    db.session.commit()

    message = f"Node {node_id} Deleted"
    return jsonify({"message": message}), 200


@app.route("/measurement/<measurement_id>", methods=['DELETE'])
def delete_measurement(measurement_id):
    measurement = Measurement.get(measurement_id)

    # measurement does not exist, return 404
    if not measurement:
        abort(404, description="Resource not found")

    db.session.delete(measurement)
    db.session.commit()

    message = f"Measurement {measurement_id} Deleted"
    return jsonify({"message": message}), 200

if __name__ == "__main__":
    # Create the database if it doesn't exist
    path = Path("./app.db")
    if not path.is_file():
        with app.app_context():
            db.create_all()

    app.run(debug=True)
