from .shared import db # Allows the models to be split out into separate files.
from .node import Node

class Hierarchy(db.Model):
    """
    A class used to generate a table of Hierarchies.
    A Hierarchy object can be thought of as a collection of tables
    containing the data of the hierarchy.

    ...

    Attributes
    ----------
    id : int
        Unique identifer for the hierarchy.
    name : str
        The name of the hierarchy.
    description : str
        A description of the hierarchy.
    nodes : Iterable
        All nodes belonging to the hierarchy

    Methods
    -------
    dump(_indent=0):
        Returns a string representation of the hierarchy, including its hierarchy tree.
    to_dict():
        Returns a dictionary representation of the hierarchy and its tree.
    get_list(get_nodes):
        Returns a list of hierarchy objects. Flag determine if nodes are returned.
    """
    __tablename__ = 'hierarchy'
    id = db.Column(db.Integer, primary_key=True)
    
    name = db.Column(db.String())
    description = db.Column(db.String())

    # Currently contains all nodes in the tree
    nodes = db.relationship(
        "Node",
        cascade="all, delete",
        backref=db.backref("hierarchy"), # Allows the population of the hiearchy_id field in nodes
        )
    
    alternatives = db.relationship(
        "Alternative",
        cascade="all, delete",
        backref=db.backref("hierarchy"),
    )

    def __init__(self, name, description):
        """
        Parameters
        ----------
        name : str
            Name of the hierarchy to be created.
        description : str
            Description of the hierarchy to be created.

        """
        self.name = name
        self.description=description

    def __repr__(self):
        """Returns a string representation of a hierarchy, including nodes."""
        return f'Hierarchy: {self.id}, Name: {self.name}, Nodes: {self.nodes}'

    # Assumes the root node is the first node in the list
    def dump(self):
        """Returns a formatted string representation of a hierarchy, including nodes."""
        return repr(self) + "\n\nTree:\n" + self.nodes[0].dump()

    def to_dict(self, get_nodes=True, export=False):
        """
        Returns a dictionary representation of the hierarchy and its tree.
        Formats the fields according to the Frontend's requirements.

        Parameters
        ----------
        get_nodes : bool
            True will return all nodes in hierarchy format
            (default is True)
        export : bool
            True will return the hierarchy and nodes without id's
            (default is False)
            
        Returns
        -------
        hier_dict : Dictionary
            Dictionary representation of the hierarchy
        """
        hier_dict = {
            "name": self.name,
            "description": self.description,
        }

        if not export:
            hier_dict['id'] = str(self.id)

        # Get tree as dict
        if get_nodes:
            root = Node.query.filter_by(parent_id=None, hierarchy_id=self.id).first()
            hier_dict["root"] = root.to_dict(export) # naming it root simplifies frontend

        return hier_dict
    
    @classmethod
    def get_list(cls, get_nodes):
        """
        Returns a list of hierarchy objects.
        Flag determine if nodes are returned.
        
        Parameters
        ----------
        get_nodes : bool
            Flag to deterimine if nodes are returned or not.
        
        Returns
        -------
        all_hierarchies : list
            A list of all hierarchies as dicts.
        """
        hierarchies = Hierarchy.query.all()
        all_hierarchies = []

        for hierarchy in hierarchies:
            all_hierarchies.append(hierarchy.to_dict(get_nodes))
        
        return all_hierarchies
