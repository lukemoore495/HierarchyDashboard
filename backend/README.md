# Working on the Backend
## Create the Virtual Environment
```
python3 -m venv venv
pip install -r requirements.txt
```

## Running the Virtual Environment
Should be created after making venv. 
```
. venv/bin/activate
```  

## Create the Database
For some reason ```db.create_all()``` doesn't play nice when run in server.py  
```
python3
from server import db
db.create_all()
exit()
```

## Run the Server
```
python3 server.py
```