from sqlite3 import Connection as SQLite3Connection
from sqlalchemy import event
from sqlalchemy.engine import Engine
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

from datetime import datetime
from pathlib import Path


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

    @classmethod
    def create(cls, hierarchy_data):
        new_hierarchy = Hierarchy(
            name=hierarchy_data["name"],
            description=hierarchy_data["description"],
        )

        db.session.add(new_hierarchy)
        db.session.commit() # hierarchy now has a unique id

        return new_hierarchy.id


class Node(db.Model):
    __tablename__ = "node"
    id = db.Column(db.Integer, primary_key=True)
    hierarchy_id = db.Column(db.Integer, db.ForeignKey("hierarchy.id"), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey("node.id"))

    name = db.Column(db.String(50))
    icon = db.Column(db.String(50))
    weight = db.Column(db.Float)

    children = db.relationship("Node", cascade="all, delete")
    measurements = db.relationship("Measurement", cascade="all, delete")

    @classmethod
    def create(cls, node_data, hierarchy_id, parent_id=None, icon=None):
        new_node = Node(
            hierarchy_id=hierarchy_id,
            parent_id=parent_id,
            name=node_data["name"],
            weight=node_data["weight"],
            icon=icon,
        )

        db.session.add(new_node)
        db.session.commit() # node now has a unique id

        return new_node.id

    @classmethod
    def create_nodes(cls, nodes_lst, hierarchy_id, parent_id=None):
        for node_data in nodes_lst:
            # Check if icon exists
            if "icon" in node_data:
                icon = node_data["icon"]
            else:
                icon = None

            node_id = Node.create(node_data, hierarchy_id, parent_id, icon)

            if node_data["children"] == []:
                Measurement.create_measurements(node_data["measurements"], hierarchy_id, node_id)
            else:
                Node.create_nodes(node_data["children"], hierarchy_id, node_id)

    @classmethod
    def get_all(cls, hierarchy_id, parent_id):
        return Node.query.filter_by(hierarchy_id=hierarchy_id, parent_id=parent_id)

    @classmethod
    def get_list(cls, hierarchy_id, parent_id):
        nodes = Node.get_all(hierarchy_id, parent_id)
        node_list = []

        for node in nodes:
            new_node = {
                "id": node.id,
                "hierarchy_id": node.hierarchy_id,
                "parent_id": node.parent_id,

                "name": node.name,
                "weight": node.weight,
                "icon": node.icon,
            }
            
            measurements_list = Measurement.get_list(hierarchy_id, node.id)
            nodes_list = Node.get_list(hierarchy_id, node.id)

            # Ensures the empty list is first on returned .json
            if measurements_list == []:
                new_node["measurements"] = measurements_list
                new_node["children"] = nodes_list
            else:
                new_node["children"] = nodes_list
                new_node["measurements"] = measurements_list

            node_list.append(new_node)
            
        return node_list


class Measurement(db.Model):
    __tablename__ = "measurement"
    id = db.Column(db.Integer, primary_key=True)
    hierarchy_id = db.Column(db.Integer, db.ForeignKey("hierarchy.id"), nullable=False)
    node_id = db.Column(db.Integer, db.ForeignKey("node.id"), nullable=False)
    
    name = db.Column(db.String(50))
    type = db.Column(db.String(50))
    value_function = db.Column(db.String(50))

    @classmethod
    def create(cls, measurement_data, hierarchy_id, node_id):
        new_measurement=Measurement(
            node_id=node_id,
            hierarchy_id=hierarchy_id,

            name=measurement_data["measurementName"],
            type=measurement_data["measurementType"],
        )

        db.session.add(new_measurement)
        db.session.commit() # measurement now has a unique id

        return new_measurement.id

    @classmethod
    def create_measurements(cls, measurements_lst, hierarchy_id, node_id):
        for measurement_data in measurements_lst:
            Measurement.create(measurement_data, hierarchy_id, node_id)

    @classmethod
    def get_all(cls, hierarchy_id, node_id):
        return Measurement.query.filter_by(hierarchy_id=hierarchy_id, node_id=node_id)

    @classmethod
    def get_list(cls, hierarchy_id, node_id):
        measurements = Measurement.get_all(hierarchy_id, node_id)
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


# routes
@app.route("/", methods=['GET'])
def hello_world():
    return "<p>Hello World!</p>"


@app.route("/hierarchy", methods=['POST'])
def create_hierarchy():
    # Get data from .json sent with request
    data = request.get_json()

    # Create Hierarchy
    new_hierarchy_id = Hierarchy.create(data)

    # Parse and create Nodes
    nodes_lst = data["nodes"]
    Node.create_nodes(nodes_lst, new_hierarchy_id)

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

    # Parse nodes and add list of dicts to hier_dict
    hier_dict["nodes"] = Node.get_list(hierarchy_id, None)

    return jsonify(hier_dict), 200


@app.route("/hierarchy/<hierarchy_id>", methods=['DELETE'])
def delete_hierarchy(hierarchy_id):
    hierarchy = Hierarchy.query.filter_by(id=hierarchy_id).first()

    db.session.delete(hierarchy)
    db.session.commit()

    return jsonify({}), 200


@app.route("/node/<node_id>", methods=['DELETE'])
def delete_node(node_id):
    node = Node.query.filter_by(id=node_id).first()

    db.session.delete(node)
    db.session.commit()

    return jsonify({}, 200)


@app.route("/measurement/<measurement_id>", methods=['DELETE'])
def delete_measurement(measurement_id):
    measurement = Measurement.query.filter_by(id=measurement_id).first()

    db.session.delete(measurement)
    db.session.commit()

    return jsonify({}, 200)


if __name__ == "__main__":
    # Create the database if it doesn't exist
    path = Path("./sqlitedb.file")
    if not path.is_file():
        db.create_all()

    app.run(debug=True)
