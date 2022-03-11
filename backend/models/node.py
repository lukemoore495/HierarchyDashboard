from .shared import db
from .measurement import Measurement


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

            node = Node.create(node_data, hierarchy_id, parent_id, icon)

            if node_data["children"] == []:
                Measurement.create_measurements(node_data["measurements"], hierarchy_id, node.id)
            else:
                Node.create_nodes(node_data["children"], hierarchy_id, node.id)

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
