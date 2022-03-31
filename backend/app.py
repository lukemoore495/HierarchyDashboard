from distutils.command.config import config
from flask import Flask, abort, jsonify, request
from pathlib import Path
import os
import sys

from models.hierarchy import Hierarchy, Node
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


if __name__ == "__main__":
    # Create the database if it doesn't exist
    config_path = os.path.join(get_config_path(), "app.db")
    path = Path(config_path)
    if not path.is_file():
        with app.app_context():
            db.create_all()

    app.run(debug=True)
