from .shared import db # Allows the models to be split out into separate files.
from models.value import Value

class Alternative(db.Model):
    __tablename__ = 'alternative'
    id = db.Column(db.Integer, primary_key=True)

    hierarchy_id = db.Column(db.Integer, db.ForeignKey("hierarchy.id"), nullable=False)
    name = db.Column(db.String())

    values = db.relationship(
        "Value",
        cascade="all, delete",
        backref=db.backref("alternative")
        )

    def __init__(self, name, hierarchy):
        """
        Parameters
        ----------
        name : str
            Name of the alternative to be created.

        """
        self.name=name
        self.hierarchy=hierarchy

    def to_dict(self, get_values=True, export=False):
        alt_dict = {
            "name": self.name,
            "hierarchyId": self.hierarchy_id
        }

        if not export:
            alt_dict['id'] = str(self.id)

        if get_values:
            alt_dict['values'] = []
            values = Value.query.filter_by(alternative_id=self.id)
            for value in values:
                alt_dict['values'].append(value.to_dict(export))

        return alt_dict

    @classmethod
    def create(cls, hierarchy, measurements, data):
        # Create alternative
        alternative = Alternative(
            name=data["name"],
            hierarchy=hierarchy,
        )

        # Check each value's nodeId belongs to an existing node.
        measurement_ids = []
        for measurement in measurements:
            measurement_ids.append(measurement.id)
        
        value_node_ids = []
        for value in data["values"]:
            value_node_ids.append(value['nodeId'])

        # Fancy way to check if value_node_ids is a subset of measurement_ids
        if not all(value_node_id in measurement_ids for value_node_id in value_node_ids):
            return None

        for measurement in measurements:
            new_value = Value(
                alternative=alternative,
                measurement=measurement,
            )
            
            if measurement.id in value_node_ids:
                for value in data['values']:
                    if value['nodeId'] == measurement.id:
                        # Substitute values
                        if "measure" in value:
                            new_value.measure = value["measure"]
                        if "localValue" in value:
                            new_value.local_value = value["localValue"]
                        if "globalValue" in value:
                            new_value.global_value = value["globalValue"]

        return alternative
    
    @classmethod
    def create_alternatives(cls, measurements, alt_lst):
        new_alternatives = []
        for alternative in alt_lst:
            new_alternatives.append(Alternative.create(measurements, alternative))
        
        return new_alternatives
