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

        return new_hierarchy
    
    @classmethod
    def get(cls, hierarchy_id):
        return Hierarchy.query.filter_by(id=hierarchy_id).first()
    
    @classmethod
    def get_dict(cls, hierarchy_id):
        hierarchy = Hierarchy.get(hierarchy_id)
        hier_dict = {
            "id": str(hierarchy.id),
            "name": hierarchy.name,
            "description": hierarchy.description,
        }

        # Parse nodes and add list of dicts to hier_dict
        hier_dict["nodes"] = Node.get_list(hierarchy_id, None)

        return hier_dict
    
    @classmethod
    def get_list(cls):
        hierarchies = Hierarchy.query.all()
        all_hierarchies = []

        for hierarchy in hierarchies:
            all_hierarchies.append(Hierarchy.get_dict(hierarchy.id))
        
        return all_hierarchies


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

        return new_node

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
    def get(cls, node_id):
        return Node.query.filter_by(id=node_id).first()

    @classmethod
    def get_all(cls, hierarchy_id, parent_id):
        return Node.query.filter_by(hierarchy_id=hierarchy_id, parent_id=parent_id)

    def to_dict(self):
        node_dict = {
            "id": str(self.id),

            "name": self.name,
            "weight": self.weight,
            "icon": self.icon,
        }

        measurements_list = Measurement.get_list(self.hierarchy_id, self.id)
        nodes_list = Node.get_list(self.hierarchy_id, self.id)

        # Ensures the empty list is first on returned .json
        if measurements_list == []:
            node_dict["measurements"] = measurements_list
            node_dict["children"] = nodes_list
        else:
            node_dict["children"] = nodes_list
            node_dict["measurements"] = measurements_list

        return node_dict

    @classmethod
    def get_list(cls, hierarchy_id, parent_id):
        nodes = Node.get_all(hierarchy_id, parent_id)
        node_list = []

        for node in nodes:
            node_list.append(node.to_dict())
            
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
            hierarchy_id=hierarchy_id,
            node_id=node_id,

            name=measurement_data["measurementName"],
            type=measurement_data["measurementType"],
        )

        db.session.add(new_measurement)
        db.session.commit() # measurement now has a unique id

        return new_measurement

    @classmethod
    def create_measurements(cls, measurements_lst, hierarchy_id, node_id):
        for measurement_data in measurements_lst:
            Measurement.create(measurement_data, hierarchy_id, node_id)

    @classmethod
    def get(cls, measurement_id):
        return Measurement.query.filter_by(id=measurement_id).first()    

    @classmethod
    def get_all(cls, hierarchy_id, node_id):
        return Measurement.query.filter_by(hierarchy_id=hierarchy_id, node_id=node_id)

    def to_dict(self):
        measurement_dict = {
                "id": str(self.id),

                "name": self.name,
                "type": self.type,
                "valueFunction": self.value_function,
            }
        
        return measurement_dict

    @classmethod
    def get_list(cls, hierarchy_id, node_id):
        measurements = Measurement.get_all(hierarchy_id, node_id)
        measurement_list = []

        for measurement in measurements:
            measurement_list.append(measurement.to_dict())
        
        return measurement_list


# routes
@app.route("/", methods=['GET'])
def hello_world():
    return "<p>Hello World!</p>"


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

    # Create a hierarchy dict with all needed data
    hierarchy_dict = Hierarchy.get_dict(new_hierarchy.id)

    return jsonify(201, hierarchy_dict)


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

    return jsonify(201, new_node.to_dict())


@app.route("/hierarchy/<hierarchy_id>/node/<node_id>/measurement", methods=['POST'])
def create_measurement(hierarchy_id, node_id):
    data = request.get_json()

    new_measurement = Measurement.create(
        data,
        hierarchy_id=hierarchy_id,
        node_id=node_id,
    )

    return jsonify(201, new_measurement.to_dict())


@app.route("/hierarchy/ascending_id", methods=['GET'])
def get_all_hierarchies_ascending():
    all_hierarchies = Hierarchy.get_list()

    return jsonify(200, all_hierarchies)


@app.route("/hierarchy/descending_id", methods=['GET'])
def get_all_hierarchies_descending():
    all_hierarchies = Hierarchy.get_list()
    all_hierarchies.reverse()

    return jsonify(200, all_hierarchies)


@app.route("/hierarchy/<hierarchy_id>", methods=['GET'])
def get_one_hierarchy(hierarchy_id):
    hier_dict = Hierarchy.get_dict(hierarchy_id)

    return jsonify(200, hier_dict)


# TODO Reduce the code duplication in the DELETE Routes
@app.route("/hierarchy/<hierarchy_id>", methods=['DELETE'])
def delete_hierarchy(hierarchy_id):
    hierarchy = Hierarchy.get(hierarchy_id)

    # hierarchy does not exist, return 404
    if not hierarchy:
        message = f"Hierarchy {hierarchy_id} Does not Exist"
        return jsonify(404, {"message": message})

    db.session.delete(hierarchy)
    db.session.commit()

    message = f"Hierarchy {hierarchy_id} Deleted"
    return jsonify(200, {"message": message})


@app.route("/node/<node_id>", methods=['DELETE'])
def delete_node(node_id):
    node = Node.get(node_id)

    # node does not exist, return 404
    if not node:
        message = f"Node {node_id} Does not Exist"
        return jsonify(404, {"message": message})

    db.session.delete(node)
    db.session.commit()

    message = f"Node {node_id} Deleted"
    return jsonify(200, {"message": message})


@app.route("/measurement/<measurement_id>", methods=['DELETE'])
def delete_measurement(measurement_id):
    measurement = Measurement.get(measurement_id)

    # measurement does not exist, return 404
    if not measurement:
        message = f"Measurement {measurement_id} Does not Exist"
        return jsonify(404, {"message": message})

    db.session.delete(measurement)
    db.session.commit()

    message = f"Measurement {measurement_id} Deleted"
    return jsonify(200, {"message": message})


if __name__ == "__main__":
    # Create the database if it doesn't exist
    path = Path("./sqlitedb.file")
    if not path.is_file():
        db.create_all()

    app.run(debug=True)
