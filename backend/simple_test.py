from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///simple_test.db'
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = 0

db = SQLAlchemy(app)

# Use this to model the tree structure
# https://docs.sqlalchemy.org/en/14/orm/self_referential.html
# https://docs.sqlalchemy.org/en/14/orm/examples.html#examples-adjacencylist
class Node(db.Model):
    __tablename__ = 'node'
    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey("node.id"))

    name=db.Column(db.String())

    children = db.relationship(
        "Node",
        cascade="all, delete-orphan",
        backref=db.backref("parent",remote_side=id),
        )

    def __init__(self, name, parent=None):
        self.name=name
        self.parent=parent

    def __repr__(self):
        return f'<Node {self.id}>'

if __name__ == "__main__":
    db.create_all()

    # app.run(debug=True)

    root = Node("root")
    child1 = Node("child1", root)
    Node("child2", child1)
    Node("child3", root)

    db.session.add(root)
    db.session.commit()

    db.session.delete(child1)
    db.session.commit()