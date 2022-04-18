from glob import glob
from .shared import db # Allows the models to be split out into separate files.

class Value(db.Model):
    __tablename__ = 'value'
    id = db.Column(db.Integer, primary_key=True)
    
    alternative_id = db.Column(db.Integer, db.ForeignKey("alternative.id"), nullable=False)
    node_id = db.Column(db.Integer, db.ForeignKey("node.id"), nullable=False) # Measurement id
    measure = db.Column(db.Integer)
    local_value = db.Column(db.Integer)
    global_value = db.Column(db.Integer)

    def __init__(self, alternative, measurement=None, measure=None, local_value=None, global_value=None):
        # Values belong to both alternatives and measurement nodes
        self.alternative=alternative
        self.measurement=measurement

        # Data fields
        self.measure=measure
        # Refresh global_value (weighted_value from rank_alternatives) each time the data changes.
        self.local_value=local_value
        self.global_value=global_value

    def to_dict(self, export=False):
        alt_dict = {
            "nodeId": self.node_id,
            "measure": self.measure,
            "localValue": self.local_value,
            "globalValue": self.global_value
        }

        if not export:
            alt_dict['id'] = str(self.id)

        return alt_dict

    def refresh_global_value(self):
        self.global_value = self.measurement.normalize(self.measure) * self.measurement.global_weight
    