from .shared import db # Allows the models to be split out into separate files.

class Reference(db.Model):
    __tablename__ = 'reference'
    id = db.Column(db.Integer, primary_key=True)
    
    node_id = db.Column(db.Integer, db.ForeignKey("node.id"), nullable=False) # Measurement id
    
    x = db.Column(db.Float)
    y = db.Column(db.Float)

    def __init__(self, measurement, x, y):
        self.measurement=measurement

        self.x = x
        self.y = y
    
    def to_dict(self):
        return {
            'x': self.x,
            'y': self.y,
        }
        
    def to_tuple(self):
        return (self.x, self.y)

    def to_list(self):
        return [self.x, self.y]
