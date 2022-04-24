# Hierarchy Dashboard 
This is the backend of the Hierarchy Dashboard, which provides the REST API which the front end uses. This is an interface to a SQL database which contains all of the data that can be edited in the front end user interface.

## Running the back end standalone
### Create the Virtual Environment
```
python3 -m venv venv
. venv/bin/activate
pip install -r requirements.txt
```

### Running the Virtual Environment
Should be created after making venv. 
```
. venv/bin/activate
```  

### Run the Server
```
python3 app.py
```

### Use Postman
Postman can build and send REST API requests