# Hierarchy Dashboard 

## Architecture Primer
A brief overview of the backend architecture to reduce the learning curve of editing the code.

### Flask
Flask is a Python web application framework. We used flask to implement a REST api that the frontend can use to communicate with the backend. In the app.py file, the main file of the backend, you will notice several @app.route()'s with a path and a method such as POST, GET, DELETE, or PATCH as parameters. These routes link REST API calls to the functions below them. `<text>` areas in the routing path translate to function parameters.

### SQLAlchemy
SQLAlchemy is an ORM that abstracts SQLite into python classes and objects. We extend objects such as hierarchy and alternative from the SQLAlchemy object db.Model. If we set up member variables this way:  

```id = db.Column(db.Integer, primary_key=True)```  

we can use the member variable like normal but can write the object directly to the database, in this case this is the primary key ID of a hierarchy. Each object that extends this are contained in their own table. You can relate these fields to eachother like this:  

```hierarchy_id = db.Column(db.Integer, db.ForeignKey("hierarchy.id"), nullable=False)```  
    
which tells SQLAlchemy that the field in Node relates to an entry in the table of hierarchies.
Using it like this allows automatic deletion of fields in seperate tables if, for instance, a hierarchy is deleted. 

### Hierarchy
A hierarchy is a tree of nodes. Most nodes are value nodes. Children nodes can be value or measurement nodes.

### Alternative
An alternative is a potential option with various metrics relate to measurement nodes in it's related hierarchy.

## API requests

### POST /hierarchy
Send a Hierarchy in JSON format {
    "name": "Test Hierarchy",
    "description": "Description of your hierarchy",
    "root": {
        "name": "root",
        "weight": null,
        "icon": null,
        "children": [
            {
                "name": "Child Node",
                "weight": 0.273,
                "icon": null,
                "children": [
                    {
                        "name": "Another Child Node",
                        "weight": 0.25,
                        "icon": "gavel",
                        "children": [
                            {
                                "name": "Measurement Node",
                                "weight": 1.0,
                                "icon": null,
                                "measurementDefinition": {
                                    "measurementType": "Number",
                                    "valueFunction": null
                                },
                                "children": []
                            }
                        ]
                    }
                ]
            }
        ]
    }

This creates the Hierarchy and adds it to the database, as well as any optional alternatives you list after the root node.

### GET /hierarchy/ascending_id
Returns the name and ID of every hierarchy in ascending order, you can use the ID to get the full hierarchy by using the hierarchy GET method

### GET /hierarchy/descending_id
Returns the name and ID of every hierarchy in descending order, you can use the ID to get the full hierarchy by using the hierarchy GET method

### GET /hierarchy/<hierarchy_id>
Get the full hierarchy with a matching ID and return it in JSON format

### GET /hierarchy/<hierarchy_id>/export
Get the full hierarchy without database metadata for use in saving a hierarchy to file. You can re-import a hierarchy that is in export JSON with the POST hierarchy method

### DELETE /hierarchy/<hierarchy_id>
Deletes a hierarchy with a matching ID from the database. Will also delete any measurements, alternatives, and child nodes related to this hierarchy

### POST /hierarchy/<hierarchy_id>/node/<parent_id>
Create a new node in a specific hierarchy, as a child of a specific node. This will automatically redo weighting and calulations for other nodes in the hierarchy you added to. Use the same node format as POST hierarchy

### PATCH /hierarchy/<hierarchy_id>/node/<node_id>
Change values of a specific node in a specific hierarchy. This can be a measurement node. Will automatically recalculate weights and values

### DELETE /hierarchy/<hierarchy_id>/node/<node_id>
Deletes a specific node in a specific hierarchy. This can be a measurement node. Will automatically recalculate weights and values

### POST /hierarchy/<hierarchy_id>/alternative
Adds a new alternative in JSON format to the alternative with a matching ID. The alternative is in the following format

{
    "name": "Alternative1",
    "values": [
        {
            "nodeId": 57,
            "measure": 18,
            "localValue": 43,
            "globalValue": 32
        },
        {
            "nodeId": 58,
            "measure": 24,
            "localValue": 64,
            "globalValue": 128
        }
    ]
}

nodeID must match a node in the hierarchy provided

### GET /hierarchy/<hierarchy_id>/alternative/<alternative_id>
Return an alternative in JSON format with a matching hierarchy ID and alternative ID

### DELETE /hierarchy/<hierarchy_id>/alternative/<alternative_id>
Delete an alternative with a matching hierarchy ID and alternative ID. Will delete underlying values but will not delete the hierarchy it belongs to

### PATCH /hierarchy/<hierarchy_id>/alternative/<alternative_id>/node/<node_id>
Edit a measure and update values of a alternative. If the node selected is not a measurement node, nothing will change

### GET /hierarchy/<hierarchy_id>/alternative/ranking
Get a ranking of all alternatives based on current weighting and values from top selection to bottom selection

