from .shared import db


class Measurement(db.Model):
    __tablename__ = "measurement"
    id = db.Column(db.Integer, primary_key=True)
    hierarchy_id = db.Column(db.Integer, db.ForeignKey("hierarchy.id"), nullable=False)
    node_id = db.Column(db.Integer, db.ForeignKey("node.id"), nullable=False)
    
    name = db.Column(db.String(50))
    type = db.Column(db.String(50))
    value_function = db.Column(db.String(50))

    @classmethod
    def create(cls, measurement_data, hierarchy_id, node_id):
        new_measurement=Measurement(
            hierarchy_id=hierarchy_id,
            node_id=node_id,

            name=measurement_data["measurementName"],
            type=measurement_data["measurementType"],
        )

        db.session.add(new_measurement)
        db.session.commit() # measurement now has a unique id

        return new_measurement

    @classmethod
    def create_measurements(cls, measurements_lst, hierarchy_id, node_id):
        for measurement_data in measurements_lst:
            Measurement.create(measurement_data, hierarchy_id, node_id)

    @classmethod
    def get(cls, measurement_id):
        return Measurement.query.filter_by(id=measurement_id).first()    

    @classmethod
    def get_all(cls, hierarchy_id, node_id):
        return Measurement.query.filter_by(hierarchy_id=hierarchy_id, node_id=node_id)

    def to_dict(self):
        measurement_dict = {
                "id": str(self.id),

                "name": self.name,
                "type": self.type,
                "valueFunction": self.value_function,
            }
        
        return measurement_dict

    @classmethod
    def get_list(cls, hierarchy_id, node_id):
        measurements = Measurement.get_all(hierarchy_id, node_id)
        measurement_list = []

        for measurement in measurements:
            measurement_list.append(measurement.to_dict())
        
        return measurement_list
