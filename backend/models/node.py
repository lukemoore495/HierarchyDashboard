from .shared import db # Allows the models to be split out into separate files.

from utilities.weighting_techniques import balance_weights
from .reference import Reference

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
    local_weight : float
        Floating point value representing the local weight
    global_weight : float
        Floating point value representing the global weight
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
    local_weight = db.Column(db.Float)
    global_weight = db.Column(db.Float)

    # For Measurements
    measurement_type = db.Column(db.String())
    vf_type = db.Column(db.String)
    references = db.relationship(
        "Reference",
        cascade = "all, delete",
        backref=db.backref("measurement"),
        )

    # Child Nodes, can be measurements or sub-objectives
    children = db.relationship(
        "Node",
        cascade="all, delete-orphan",
        backref=db.backref("parent",remote_side=[id]),
        )
    
    values = db.relationship(
        "Value",
        cascade="all, delete",
        backref=db.backref("measurement"),
    )

    def __init__(self, name, parent=None, icon=None, local_weight=None, measurement_type=None, vf_type=None):
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
        local_weight : float, optional
            Floating point value representing the local weight of the node
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
            # TODO: Make this less weird??
            self.global_weight=parent.global_weight * local_weight
        else:
            self.global_weight=1
            local_weight=1
        # Identifiers
        self.parent=parent

        # Data Fields
        self.name=name
        self.local_weight=local_weight
        self.icon=icon

        # For Measurements
        self.measurement_type=measurement_type
        self.vf_type=vf_type

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
            'weight': self.local_weight,
            'icon': self.icon,
        }

        if not export:
            node_dict['id'] = str(self.id)

        # Is a measurement node
        if self.measurement_type:
            node_dict['measurementDefinition'] = {
                'measurementType': self.measurement_type,
                'VFType': self.vf_type,
                'referencePoints': [ref.to_dict() for ref in self.references]
            }

            # TODO: Move this somewhere else? These points should maybe saved on the backend.
            if self.vf_type == "Linear":
                data_points = []

                x1 = self.normalize(0.0, True)
                x2 = self.normalize(1.0, True)
                
                domain = abs(x2 - x1)
                increment = domain / 10

                for i in range(11):
                    x = i * increment
                    y = self.normalize(x)

                    if y > 1:
                        y = 1
                    if y < 0:
                        y = 0
                    data_points.append({
                        'x': round(x, 3),
                        'y': round(y, 3),
                    })
                
                node_dict['measurementDefinition']['valueFunctionData'] = data_points

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
        local_weight = 1
        measurement_type = None
        vf_type = None
        references=None

        if 'icon' in data:
            icon = data['icon']
        if 'weight' in data:
            local_weight = data['weight']

        if 'measurementDefinition' in data:
            m_data = data['measurementDefinition']
            if 'measurementType' in m_data:
                measurement_type = m_data['measurementType']
            if 'VFType' in m_data:
                vf_type = m_data['VFType']
            if 'referencePoints' in m_data:
                references=m_data['referencePoints']

                
        # Create child node
        new_node = Node(
            name=data['name'],
            parent=self,
            icon=icon,
            local_weight=local_weight,
            measurement_type=measurement_type,
            vf_type=vf_type,
        )


        # TODO: Error checking
        if references:
            for ref in references:
                Reference(new_node, ref['x'], ref['y'])

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

    # Utility Functions
    @classmethod
    def get_measurements(cls, hierarchy_id):
        return cls.query.filter(cls.measurement_type != None, cls.hierarchy_id == hierarchy_id)

    def normalize(self, measure, inverse=False):
        # TODO: Add a cap to reference points, y must be between 0 and 1
        # If you enter in an x that after normalization > 1
        # Return 1
        # If < 1
        # Return 0

        if measure is None:
            return 0
        # TODO: Switch to vfType
        if self.vf_type == "Linear":
            point_1 = self.references[0].to_tuple()
            point_2 = self.references[1].to_tuple()

            # Swap if point_2's x should come first
            if point_1[0] > point_2[0]:
                temp = point_2
                point_2 = point_1
                point_1 = temp

            # For sanity
            x1 = point_1[0]
            y1 = point_1[1]
            x2 = point_2[0]
            y2 = point_2[1]

            m = ((y2 - y1) / (x2 - x1))
            b = ((x2 * y1) - (x1 * y2)) / (x2 - x1)
            # Linear function equation
            if not inverse:
                result = (m * measure) + b
            else:
                result = (measure - b) / m

            return result

        return 0
    
    def refresh_weights(self):
        if self.parent:
            self.global_weight = self.local_weight * self.parent.global_weight

        weights = []
        if self.children:
            for child in self.children:
                weights.append(child.local_weight)
            
            balanced_weights = balance_weights(weights)
            for child in self.children:
                child.local_weight = balanced_weights.pop(0)
                child.refresh_weights()

