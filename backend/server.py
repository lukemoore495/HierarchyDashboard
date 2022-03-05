from sqlite3 import Connection as SQLite3Connection
from datetime import datetime
from sqlalchemy import event
from sqlalchemy.engine import Engine
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy

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
now = datetime.now()

# Must be run everytime the database's structure is changed.
# from server import db
# db.create_all()
# exit()

# models
class Hierarchy(db.Model):
    __tablename__ = "hierarchy"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    description = db.Column(db.String(200))

class Node(db.Model):
    __tablename__ = "node"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    weight = db.Column(db.Float)
    hierarchy_id = db.Column(db.Integer, db.ForeignKey("hierarchy.id"), nullable=False)

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
    pass

@app.route("/hierarchy/descending_id", methods=['GET'])
def get_all_hierarchies_descending():
    pass

@app.route("/hierarchy/<hierarchy_id>", methods=['GET'])
def get_one_hierarchy(hierarchy_id):
    pass

@app.route("/hierarchy/<hierarchy_id>", methods=['DELETE'])
def delete_hierarchy(hierarchy_id):
    pass

if __name__ == "__main__":
    app.run(debug=True)
