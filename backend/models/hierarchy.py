from .shared import db
from .node import Node, Measurement

class Hierarchy(db.Model):
    __tablename__ = 'hierarchy'
    id = db.Column(db.Integer, primary_key=True)
    
    name = db.Column(db.String())
    description = db.Column(db.String())

    # Currently contains all nodes in the tree
    nodes = db.relationship(
        "Node",
        cascade="all, delete",
        backref=db.backref("hierarchy"), # Allows the population of the hiearchy_id field below
        )

    def __init__(self, name, description):
        self.name = name
        self.description=description

    def __repr__(self):
        return f'Hierarchy: {self.id}, Name: {self.name}, Nodes: {self.nodes}'

    # Assumes the root node is the first node in the list
    def dump(self):
        return repr(self) + "\n\nTree:\n" + self.nodes[0].dump()

    def to_dict(self, get_nodes=True):
        hier_dict = {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
        }

        # Get tree as dict
        if get_nodes:
            root = Node.query.filter_by(parent_id=None, hierarchy_id=self.id).first()
            hier_dict["nodes"] = root.to_dict()['children'] # Don't return root node

        return hier_dict

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
    def get_list(cls, get_nodes):
        hierarchies = Hierarchy.query.all()
        all_hierarchies = []

        for hierarchy in hierarchies:
            all_hierarchies.append(hierarchy.to_dict(get_nodes))
        
        return all_hierarchies
