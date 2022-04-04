from .shared import db # Allows the models to be split out into separate files.
from models.value import Value

class Alternative(db.Model):
    __tablename__ = 'alternative'
    id = db.Column(db.Integer, primary_key=True)

    hierarchy_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String())

    
    # Currently contains all nodes in the tree
    values = db.relationship(
        "Value",
        cascade="all, delete",
        backref=db.backref("alternative")
        )

    def __init__(self, hierarchy_id, name):
        """
        Parameters
        ----------
        name : str
            Name of the alternative to be created.

        """
        self.name = name
        self.hierarchy_id=hierarchy_id

    def to_dict(self, get_values=True, export=False):
        alt_dict = {
            "name": self.name,
            "hierarchy_id": self.hierarchy_id
        }

        if not export:
            alt_dict['id'] = str(self.id)

        if get_values:
            alt_dict['values'] = []
            values = Value.query.filter_by(alternative_id=self.id)
            for value in values:
                alt_dict['values'].append(value.to_dict(export))

        return alt_dict
