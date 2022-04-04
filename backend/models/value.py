from glob import glob
from .shared import db # Allows the models to be split out into separate files.

class Value(db.Model):
    __tablename__ = 'value'
    id = db.Column(db.Integer, primary_key=True)
    
    alternative_id = db.Column(db.Integer, db.ForeignKey("alternative.id"), nullable=False)
    node_id = db.Column(db.Integer)
    measure = db.Column(db.Integer)
    local_value = db.Column(db.Integer)
    global_value = db.Column(db.Integer)


    def __init__(self, node_id, measure, local_value, global_value):
        self.node_id = node_id
        self.measure=measure
        self.local_value = local_value
        self.global_value = global_value

    def to_dict(self, export=False):
        alt_dict = {
            "node_id": self.node_id,
            "measure": self.measure,
            "local_value": self.local_value,
            "global_value": self.global_value
        }

        if not export:
            alt_dict['id'] = str(self.id)

        return alt_dict
    