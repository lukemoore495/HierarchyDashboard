from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///simple_test.db'
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = 0

db = SQLAlchemy(app)

class Hierarchy(db.Model):
    __tablename__ = 'hierarchy'
    id = db.Column(db.Integer, primary_key=True)
    
    name = db.Column(db.String())

    # Currently contains all nodes in the tree
    nodes = db.relationship(
        "Node",
        cascade="all, delete",
        backref=db.backref("hierarchy"), # Allows the population of the hiearchy_id field below
        )

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f'Hierarchy: {self.id}, Name: {self.name}, Nodes: {self.nodes}'

    # Assumes the root node is the first node in the list
    def dump(self):
        return repr(self) + "\n\nTree:\n" + self.nodes[0].dump()


# Use this to model the tree structure
# https://docs.sqlalchemy.org/en/14/orm/self_referential.html
# https://docs.sqlalchemy.org/en/14/orm/examples.html#examples-adjacencylist
class Node(db.Model):
    __tablename__ = 'node'

    # Identifiers
    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey("node.id"))
    hierarchy_id = db.Column(db.Integer, db.ForeignKey("hierarchy.id"), nullable=False)

    # Data Fields
    name = db.Column(db.String())
    icon = db.Column(db.String())
    weight = db.Column(db.Float)

    # For Measurements
    type = db.Column(db.String())
    value_function = db.Column(db.String)

    # Child Nodes, can be measurements or sub-objectives
    children = db.relationship(
        "Node",
        cascade="all, delete-orphan",
        backref=db.backref("parent",remote_side=id),
        )

    def __init__(self, name, parent=None):
        self.name=name
        self.parent=parent

        # IMPORTANT: Populates the hiearchy_id field of all nodes
        # Leads to all of them showing up in the Hierarchy tree list
        if parent:
            self.hierarchy=parent.hierarchy

    def __repr__(self):
        return f'Node: {self.id}, Name: {self.name}, Hierarchy: {self.hierarchy_id}'

    def dump(self, _indent=0):
        return (
            "    " * _indent
            + repr(self)
            + "\n"
            + "".join(c.dump(_indent + 1) for c in self.children)
        )


if __name__ == "__main__":
    db.create_all()

    # app.run(debug=True)

    hierarchy = Hierarchy("test")
    root = Node("root")
    hierarchy.nodes.append(root)
    # db.session.add(hierarchy)
    # db.session.commit()

    child1 = Node("child1", root)
    Node("child2", child1)
    Node("child3", root)

    db.session.add(hierarchy)
    db.session.commit()



    print(hierarchy)
    root_id = root.id
    new_root = Node.query.filter_by(id=root_id).first()
    children = new_root.children

    print(root.dump())
    print(hierarchy.dump())

    # print(root_id)
    # for child in children:
    #     print(child.children)
    #     print(child.parent)

    # print(root)
    # print(root.dump())

    # print(new_root.dump())

    # db.session.delete(child1)
    # db.session.commit()
    # print(new_root.dump())