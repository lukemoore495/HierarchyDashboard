from .shared import db
from .node import Node, Measurement

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
