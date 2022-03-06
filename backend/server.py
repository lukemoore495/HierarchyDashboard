from sqlite3 import Connection as SQLite3Connection
from sqlalchemy import event
from sqlalchemy.engine import Engine
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

from datetime import datetime


# app
app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///sqlitedb.file"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = 0
app.config["JSON_SORT_KEYS"] = False

# configure sqlite3 to enforce foreign key constraints
# Foreign key constraints prevent non-SQL manipulation of the database
# from breaking table relations. IE: You cannot leave a parent or child hanging.
# https://www.sqlite.org/foreignkeys.html
@event.listens_for(Engine, "connect")
def _set_sqlite_pragma(dbapi_connection, connection_recor):
    if isinstance(dbapi_connection, SQLite3Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.close()

db = SQLAlchemy(app)
now = datetime.now() # Could be used in the futre if we want to add time modified


# models
class Hierarchy(db.Model):
    __tablename__ = "hierarchy"
    id = db.Column(db.Integer, primary_key=True)
    
    name = db.Column(db.String(50))
    description = db.Column(db.String(200))
    nodes = db.relationship("Node", cascade="all, delete")


class Node(db.Model):
    __tablename__ = "node"
    id = db.Column(db.Integer, primary_key=True)
    hierarchy_id = db.Column(db.Integer, db.ForeignKey("hierarchy.id"), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey("node.id"))

    name = db.Column(db.String(50))
    weight = db.Column(db.Float)

    children = db.relationship("Node", cascade="all, delete")
    measurements = db.relationship("Measurement", cascade="all, delete")


class Measurement(db.Model):
    __tablename__ = "measurement"
    id = db.Column(db.Integer, primary_key=True)
    hierarchy_id = db.Column(db.Integer, db.ForeignKey("hierarchy.id"), nullable=False)
    node_id = db.Column(db.Integer, db.ForeignKey("node.id"), nullable=False)
    
    name = db.Column(db.String(50))
    type = db.Column(db.String(50))
    value_function = db.Column(db.String(50))


# routes
@app.route("/", methods=['GET'])
def hello_world():
    return "<p>Hello World!</p>"


def create_measurements(measurements, hierarchy_id, node_id):
    for measurement in measurements:
        new_measurement=Measurement(
            node_id=node_id,
            hierarchy_id=hierarchy_id,

            name=measurement["measurementName"],
            type=measurement["measurementType"],
            
        )
        db.session.add(new_measurement)
        db.session.commit() # measurement now has a unique id


def create_node(node, hierarchy_id, parent_id=None):
    new_node = Node(
            hierarchy_id=hierarchy_id,
            parent_id=parent_id,
            name=node["name"],
            weight=node["weight"],
        )
    db.session.add(new_node)
    db.session.commit() # node now has a unique id

    return new_node.id


def create_nodes(nodes, hierarchy_id, parent_id=None):
    for node in nodes:
        node_id = create_node(node, hierarchy_id, parent_id)
        if node["children"] == []:
            create_measurements(node["measurements"], hierarchy_id, node_id)
        else:
            create_nodes(node["children"], hierarchy_id, node_id)


@app.route("/hierarchy", methods=['POST'])
def create_hierarchy():
    # Get data from .json sent with request
    data = request.get_json()
    # Create Hierarchy
    new_hierarchy = Hierarchy(
        name=data["name"],
        description=data["description"],
    )
    db.session.add(new_hierarchy)
    db.session.commit() # hierarchy now has a unique id

    # Parse and create Nodes
    nodes = data["nodes"]
    create_nodes(nodes, new_hierarchy.id)

    return jsonify({"message": "Hierarchy Created"}, 200)


@app.route("/hierarchy/ascending_id", methods=['GET'])
def get_all_hierarchies_ascending():
    hierarchies = Hierarchy.query.all()
    all_hierarchies = []

    for hierarchy in hierarchies:
        all_hierarchies.append({
            "id": hierarchy.id,
            "name": hierarchy.name,
            "description": hierarchy.description,
        })

    return jsonify(all_hierarchies), 200


@app.route("/hierarchy/descending_id", methods=['GET'])
def get_all_hierarchies_descending():
    hierarchies = Hierarchy.query.all()
    all_hierarchies = []

    for hierarchy in hierarchies:
        all_hierarchies.append({
            "id": hierarchy.id,
            "name": hierarchy.name,
            "description": hierarchy.description,
        })
    
    all_hierarchies.reverse()

    return jsonify(all_hierarchies), 200


def get_measurements(hierarchy_id, node_id):
    measurements = Measurement.query.filter_by(hierarchy_id=hierarchy_id, node_id=node_id)
    measurement_list = []

    for measurement in measurements:
        new_measurement = {
            "id": measurement.id,
            "hierarchy_id": measurement.hierarchy_id,
            "node_id": measurement.node_id,

            "name": measurement.name,
            "type": measurement.type,
            "value function": measurement.value_function,
        }
        measurement_list.append(new_measurement)
    
    return measurement_list


def get_nodes(hierarchy_id, parent_id):
    nodes = Node.query.filter_by(hierarchy_id=hierarchy_id, parent_id=parent_id)
    node_list = []

    for node in nodes:
        new_node = {
            "id": node.id,
            "hierarchy_id": node.hierarchy_id,
            "parent_id": node.parent_id,

            "name": node.name,
            "weight": node.weight,
        }
        
        measurements_list = get_measurements(hierarchy_id, node.id)
        nodes_list = get_nodes(hierarchy_id, node.id)

        # Ensures the empty list is first on returned .json
        if measurements_list == []:
            new_node["measurements"] = measurements_list
            new_node["children"] = nodes_list
        else:
            new_node["children"] = nodes_list
            new_node["measurements"] = measurements_list

        node_list.append(new_node)
        
    return node_list


@app.route("/hierarchy/<hierarchy_id>", methods=['GET'])
def get_one_hierarchy(hierarchy_id):
    hierarchy = Hierarchy.query.filter_by(id=hierarchy_id).first()
    hier_dict = {
        "id": hierarchy.id,
        "name": hierarchy.name,
        "description": hierarchy.description,
    }

    # Parse nodes and add list of dicts to hier_dict
    hier_dict["nodes"] = get_nodes(hierarchy_id, None)

    return jsonify(hier_dict), 200


@app.route("/hierarchy/<hierarchy_id>", methods=['DELETE'])
def delete_hierarchy(hierarchy_id):
    hierarchy = Hierarchy.query.filter_by(id=hierarchy_id).first()
    db.session.delete(hierarchy)
    db.session.commit()
    return jsonify({}), 200


if __name__ == "__main__":
    app.run(debug=True)
