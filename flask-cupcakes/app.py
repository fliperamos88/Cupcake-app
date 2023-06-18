"""Flask app for Cupcakes"""

import datetime
from models import db, connect_db, Cupcake
from flask_sqlalchemy import SQLAlchemy
from flask_debugtoolbar import DebugToolbarExtension
from flask import Flask, request, render_template, redirect, flash, session, jsonify
from sqlalchemy import text


app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///cupcakes'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = True
app.config['SECRET_KEY'] = '123VITORIA'
# app.run(debug=True)
connect_db(app)
app.app_context().push()


@app.route('/')
def homepage():
    return render_template('index.html')

# GET request to retrive all cupcakes


@app.route('/api/cupcakes')
def show_cupcakes():
    all_cupcakes = Cupcake.query.order_by(Cupcake.flavor).all()
    cupcakes = [cupcake.serialize() for cupcake in all_cupcakes]
    response = jsonify(cupcakes)
    return response


# GET request to retrive cupcake by id
@app.route('/api/cupcakes/<int:id>')
def get_all_cupcakes(id):
    cupcake = Cupcake.query.get_or_404(id)
    response = jsonify(cupcake.serialize())
    return response

# GET reuquest to retrieve cupcake list by flavor


@app.route('/api/cupcakes/<flavor>')
def get_cupcakes_by_flavor(flavor):
    cupcakes_flavor = Cupcake.query.filter(
        Cupcake.flavor.ilike(f'%{flavor}%')).order_by(Cupcake.flavor).all()
    response = jsonify([cupcake.serialize() for cupcake in cupcakes_flavor])
    return response


#  POST request to add new cupcake to database


@app.route('/api/cupcakes', methods=['POST'])
def add_cupcake():
    new_cupcake = Cupcake(flavor=request.json['flavor'].capitalize(), size=request.json['size'],
                          rating=request.json['rating'], image=request.json.get('image'))
    if new_cupcake.image == '':
        new_cupcake.image = None
    db.session.add(new_cupcake)
    db.session.commit()
    response = jsonify(cupcake=new_cupcake.serialize())
    return response

#  Patch request to edit cupcake info


@app.route('/api/cupcakes/<int:id>', methods=['PATCH'])
def edit_cupcake(id):
    cupcake = Cupcake.query.get(id)
    previous_image = cupcake.image
    cupcake.flavor = request.json.get('flavor', cupcake.flavor)
    cupcake.size = request.json.get('size', cupcake.size)
    cupcake.rating = request.json.get('rating', cupcake.rating)
    cupcake.image = request.json.get('image', cupcake.image)
    if cupcake.image == '':
        cupcake.image = previous_image
    db.session.commit()
    response = jsonify(cupcake=cupcake.serialize())
    return response


#  Delete request to delete cupcake from the database

@app.route('/api/cupcakes/<int:id>', methods=['DELETE'])
def delete_cupcake(id):
    cupcake = Cupcake.query.get(id)
    db.session.delete(cupcake)
    db.session.commit()
    response = jsonify(cupcake='deleted')
    return response
