#!/usr/bin/python3
"""
Module to run the HBnB application
"""


from app import create_app, db
from app.services.facade import HBnBFacade
from app.models.base import BaseModel
from app.models.user import User
from app.models.amenity import Amenity
from app.models.place import Place
from app.models.review import Review


app = create_app()
facade = HBnBFacade()

with app.app_context():
    db.create_all()
    facade.bootstrap_admin()

if __name__ == '__main__':
    app.run(debug=True)
