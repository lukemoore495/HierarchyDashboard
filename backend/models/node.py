from .shared import db # Allows the models to be split out into separate files.


# https://docs.sqlalchemy.org/en/14/orm/self_referential.html
# https://docs.sqlalchemy.org/en/14/orm/examples.html#examples-adjacencylist
class Node(db.Model):
    """
    A class used to generate a table of Nodes.
    Nodes are used to model Hierarchy trees that consist of objectives,
    sub-objectives, and terminating in measurements.

    Based off of SQLALchemy's adjacency_list.py:
    https://docs.sqlalchemy.org/en/14/_modules/examples/adjacency_list/adjacency_list.html

    ...

    Attributes
    ----------
    id : int
        Node's unique id.
    parent_id : int
        Parent node's unique id.
    hierarchy_id : int
        Id of the hierarchy the node belongs to.
    name : str
        The name of the node.
    icon : str
        String to store the icon the frontend uses for the node.
    weight : float
        Floating point value representing weight
    measurement_type : str
        String representing the measurement's type.
    value_function : str
        String representing the measurement's value function.
    parent : Node
        Parent node. Root nodes have no parent.
    children : Iterable
        The node's children.

    Methods
    -------
    dump(_indent=0):
        Returns a string representation of the node and its children.
    to_dict():
        Returns a dictionary representation of the node and its children.
    create(data):
        Adds a child node to the node that calls it.
        Recursively creates all children of the added child node if they exist.
    create_tree(nodes_lst)
        Adds all nodes in the given list as children to the node that calls it.
        Recursively creates all children of the nodes in the list if they exist.
    """
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

    def __init__(self, name, parent=None, icon=None, weight=None, measurement_type=None, value_function=None):
        """
        Parameters
        ----------
        name : str
            Name of the node to be created.
        parent : Node, optional
            Parent of node to be created. Root nodes have no parent.
            (default is None)
        icon : str, optional
            String to store the icon the frontend uses for the node.
            (default is None)
        weight : float, optional
            Floating point value representing weight
            (default is None)
        measurement_type : str, optional
            String representing the type of measurement.
            (default is None)
        value_function : str, optional
            String representing the value function associated with the measurement.
            (default is None)
        """
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
        """Return a string representation of a node."""
        return f'Node: {self.id}, Name: {self.name}, Hierarchy: {self.hierarchy_id}'

    def dump(self, _indent=0):
        """
        Return a formatted string representation of a node and it's children.

        Parameters
        ----------
        _indent : int, optional
            Number of indents to start with.
            (default is 0)

        Returns
        -------
        str
            String representation of Node and its children
        """
        return (
            "    " * _indent
            + repr(self)
            + "\n"
            + "".join(c.dump(_indent + 1) for c in self.children)
        )

    def to_dict(self, export=False):
        """
        Returns a dictionary representation of the node and its children.
        Formats the fields according to the Frontend's requirements.

        Parameters
        ----------
        export : bool
            True will return the nodes without id's
            (default is False)
    
        Returns
        -------
        node_dict : Dictionary
            Dictionary representation of the node and its field.
        """
        # Fields renamed according to Frontend
        node_dict = {
            'name': self.name,
            'weight': self.weight,
            'icon': self.icon,
        }

        if not export:
            node_dict['id'] = str(self.id)

        # Is a measurement node
        if self.measurement_type:
            node_dict['measurementDefinition'] = {
                'measurementType': self.measurement_type,
                'valueFunction': self.value_function
            }

        # Create and append list of child nodes
        children_list = []
        for child in self.children:
            children_list.append(child.to_dict(export))
        
        node_dict['children'] = children_list

        return node_dict
            
    def create(self, data):
        """
        Adds a child node to the node that calls it.
        Recursively creates all children of the added child node if they exist.

        Parameters
        ----------
        data : Dictionary
            A dictionary containing the various fields
    
        Returns
        -------
        new_node : Node
            The Node created using data.
        """
        # Check for optional parameters
        # TODO: Weight isn't optional. Work with Frontend.
        icon = None
        weight = None
        measurement_type = None
        value_function = None

        if 'icon' in data:
            icon = data['icon']
        if 'weight' in data:
            weight = data['weight']

        if 'measurementDefinition' in data:
            if 'measurementType' in data['measurementDefinition']:
                measurement_type = data['measurementDefinition']['measurementType']
            if 'valueFunction' in data['measurementDefinition']:
                value_function = data['measurementDefinition']['valueFunction']
                
        # Create child node
        new_node = Node(
            name=data['name'],
            parent=self,
            icon=icon,
            weight=weight,
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
                # Recursive call
                new_node.create_tree(children)
        
        return new_node

    def create_tree(self, nodes_lst):
        """
        Adds all nodes in the given list as children to the node that calls it.
        Recursively creates all children of the nodes in the list if they exist.

        Parameters
        ----------
        nodes_lst : list
            List of dictionaries containing node data.
            See create(data)
        """
        for node in nodes_lst:
            self.create(node)
