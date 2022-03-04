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

# models
class Hierarchy(db.Model):
    __tablename__ = "hierarchy"
    id = db.Column(db.Integer, primary_key=True)

# routes
@app.route("/", methods=['GET'])
def hello_world():
    return "<p>Hello World!</p>"

@app.route("/hierarchy", methods=['POST'])
def create_hierarchy():
    pass

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