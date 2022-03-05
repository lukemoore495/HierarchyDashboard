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
    name = db.Column(db.String(50))
    weight = db.Column(db.Float)
    hierarchy_id = db.Column(db.Integer, db.ForeignKey("hierarchy.id"), nullable=False)
    measurements = db.relationship("Measurement", cascade="all, delete")


class Measurement(db.Model):
    __tablename__ = "measurement"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    type = db.Column(db.String(50))
    node_id = db.Column(db.Integer, db.ForeignKey("node.id"), nullable=False)


# routes
@app.route("/", methods=['GET'])
def hello_world():
    return "<p>Hello World!</p>"


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
    for node in nodes:
        new_node = Node(
            name=node["name"],
            weight=node["weight"],
            hierarchy_id=new_hierarchy.id
        )
        db.session.add(new_node)
        db.session.commit() # node now has a unique id

        # Parse and create Measurements
        measurements = node["measurements"]
        for measurement in measurements:
            new_measurement=Measurement(
                name=measurement["measurementName"],
                type=measurement["measurementType"],
                node_id=new_node.id
            )
            db.session.add(new_measurement)
            db.session.commit() # measurement now has a unique id

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


@app.route("/hierarchy/<hierarchy_id>", methods=['GET'])
def get_one_hierarchy(hierarchy_id):
    hierarchy = Hierarchy.query.filter_by(id=hierarchy_id).first()
    hier_dict = {
        "id": hierarchy.id,
        "name": hierarchy.name,
        "description": hierarchy.description,
    }

    # Parse nodes and append dicts to list
    nodes = Node.query.filter_by(hierarchy_id=hierarchy.id)
    node_list = []
    for node in nodes:
        new_node = {
            "id": node.id,
            "name": node.name,
            "weight": node.weight,
        }
        node_list.append(new_node)

        # Parse and create Measurements
        measurements = Measurement.query.filter_by(node_id=node.id)
        measurement_list = []
        for measurement in measurements:
            new_measurement = {
                "id": measurement.id,
                "name": measurement.name,
                "type": measurement.type,
            }
            measurement_list.append(new_measurement)
        
        new_node["measurements"] = measurement_list
    
    hier_dict["nodes"] = node_list

    return jsonify(hier_dict), 200


@app.route("/hierarchy/<hierarchy_id>", methods=['DELETE'])
def delete_hierarchy(hierarchy_id):
    hierarchy = Hierarchy.query.filter_by(id=hierarchy_id).first()
    db.session.delete(hierarchy)
    db.session.commit()
    return jsonify({}), 200


if __name__ == "__main__":
    app.run(debug=True)
