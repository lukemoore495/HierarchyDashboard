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

    tree = db.relationship(
        "Node",
        cascade="all, delete",
        backref=db.backref("hierarchy"),
        )

    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f'Hierarchy: {self.id}, Name: {self.name}, Tree: {self.tree}'


# Use this to model the tree structure
# https://docs.sqlalchemy.org/en/14/orm/self_referential.html
# https://docs.sqlalchemy.org/en/14/orm/examples.html#examples-adjacencylist
class Node(db.Model):
    __tablename__ = 'node'
    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey("node.id"))
    hierarchy_id = db.Column(db.Integer, db.ForeignKey("hierarchy.id"), nullable=False)

    name = db.Column(db.String())

    children = db.relationship(
        "Node",
        cascade="all, delete-orphan",
        backref=db.backref("parent",remote_side=id),
        )

    def __init__(self, name, parent=None):
        self.name=name
        self.parent=parent

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
    hierarchy.tree.append(root)
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