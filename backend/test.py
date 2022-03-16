from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
db = SQLAlchemy(app)


# Set up the Hierarchy to point to the head node?
class Hierarchy(db.Model):
    __tablename__ = 'hierarchy'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)

    nodes = db.relationship("Node", backref='Hierarchy', cascade='all, delete')

    def __repr__(self):
        return '<Hiearchy %r>' % self.name


# https://docs.sqlalchemy.org/en/14/orm/self_referential.html
# https://docs.sqlalchemy.org/en/14/orm/examples.html#examples-adjacencylist
# Use this to model the tree structure
# Should measurements just be nodes with a measurement flag?
class Node(db.Model):
    __tablename__ = 'node'
    id = db.Column(db.Integer, primary_key=True)

    hierarachy_id = db.Column(db.Integer, db.ForeignKey("hierarchy.id"), nullable=False)

    children = db.relationship("Node", cascade="all, delete")

    def __repr__(self):
        return '<Category %r>' % self.id
