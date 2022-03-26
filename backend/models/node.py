from .shared import db
from .measurement import Measurement


# https://docs.sqlalchemy.org/en/14/orm/self_referential.html
# https://docs.sqlalchemy.org/en/14/orm/examples.html#examples-adjacencylist
class Node(db.Model):
    __tablename__ = 'node'

    # Identifiers
    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey("node.id"))
    hierarchy_id = db.Column(db.Integer, db.ForeignKey("hierarchy.id"), nullable=False)

    # Data Fields
    name = db.Column(db.String(), nullable=False)
    icon = db.Column(db.String())
    weight = db.Column(db.Float)

    # For Measurements
    is_measurement = db.Column(db.Boolean)
    measurement_type = db.Column(db.String())
    value_function = db.Column(db.String)

    # Child Nodes, can be measurements or sub-objectives
    children = db.relationship(
        "Node",
        cascade="all, delete-orphan",
        backref=db.backref("parent",remote_side=id),
        )

    def __init__(self, name, parent=None, icon=None, weight=None, is_measurement=False, measurement_type=None, value_function=None):
        # Identifiers
        self.parent=parent
        # IMPORTANT: Populates the hiearchy_id field of all nodes
        # Leads to all of them showing up in the Hierarchy tree list
        if parent:
            self.hierarchy=parent.hierarchy

        # Data Fields
        self.name=name
        self.weight=weight
        self.icon=icon

        # For Measurements
        self.is_measurement=is_measurement
        self.measurement_type=measurement_type
        self.value_function=value_function

    def __repr__(self):
        return f'Node: {self.id}, Name: {self.name}, Hierarchy: {self.hierarchy_id}'

    def dump(self, _indent=0):
        return (
            "    " * _indent
            + repr(self)
            + "\n"
            + "".join(c.dump(_indent + 1) for c in self.children)
        )

    def to_dict(self):
        node_dict = {
            'id': str(self.id),

            'name': self.name,
            'weight': self.weight,
            'icon': self.icon,

            'isMeasurement': self.is_measurement,
            'measurementType': self.measurement_type,
            'value_function': self.value_function,

        }

        children_list = []
        for child in self.children:
            children_list.append(child.to_dict())
        
        node_dict['children'] = children_list

        return node_dict
            
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

    # Takes a list of nodes that have separated nodes and measurements
    def create_tree(self, nodes_lst):
        for node in nodes_lst:
            # Check for optional parameters
            # TODO: Weight isn't optional.
            icon = None
            weight = None
            is_measurement = False
            measurement_type = None
            value_function = None

            if 'icon' in node:
                icon = node['icon']
            if 'weight' in node:
                weight = node['weight']
            if 'measurementType' in node:
                is_measurement = True
                measurement_type = node['measurementType']
            if 'value_function' in node:
                value_function = node['value_function']

            # Create child node
            new_node = Node(
                name=node['name'],
                parent=self,
                icon=icon,
                weight=weight,
                is_measurement=is_measurement,
                measurement_type=measurement_type,
                value_function=value_function,
            )

            # Check for child nodes in children and measurments
            children = []
            if 'children' in node:
                children += node['children']
            if 'measurements' in node:
                children += node['measurements']
            # If they exist, add them to the current node.
            if children:
                new_node.create_tree(children)


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

    @classmethod
    def get_list(cls, hierarchy_id, parent_id):
        nodes = Node.get_all(hierarchy_id, parent_id)
        node_list = []

        for node in nodes:
            node_list.append(node.to_dict())
            
        return node_list
