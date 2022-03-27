from .shared import db


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
        backref=db.backref("parent",remote_side=[id]),
        )

    def __init__(self, name, parent=None, icon=None, weight=None, is_measurement=False, measurement_type=None, value_function=None):
        # IMPORTANT: Populates the hiearchy_id field of all nodes
        # Leads to all of them showing up in the Hierarchy tree list
        # SUPER IMPORTANT: Accessing parent.hierarchy here
        # populates the hierarchy field, allowing create_node() to function
        # If it's accessed after self.parent=parent, it fails.
        if parent:
            self.hierarchy = parent.hierarchy
        # Identifiers
        self.parent=parent

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
            
    def create(self, data):
        # Check for optional parameters
        # TODO: Weight isn't optional.
        icon = None
        weight = None
        is_measurement = False
        measurement_type = None
        value_function = None

        if 'icon' in data:
            icon = data['icon']
        if 'weight' in data:
            weight = data['weight']
        if 'measurementType' in data:
            is_measurement = True
            measurement_type = data['measurementType']
        if 'value_function' in data:
            value_function = data['value_function']
            
        # Create child node
        new_node = Node(
            name=data['name'],
            parent=self,
            icon=icon,
            weight=weight,
            is_measurement=is_measurement,
            measurement_type=measurement_type,
            value_function=value_function,
        )

        # Check for child nodes in children and measurments
        children = []
        if 'children' in data:
            children += data['children']
        if 'measurements' in data:
            children += data['measurements']
        # If they exist, add them to the current node.
        if children:
                new_node.create_tree(children)
        
        return new_node

    # Takes a list of nodes that have separated nodes and measurements
    def create_tree(self, nodes_lst):
        for node in nodes_lst:
            self.create(node)
