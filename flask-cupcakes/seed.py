from app import app
from models import db, Cupcake


db.drop_all()
db.create_all()

c1 = Cupcake(
    flavor="Cherry",
    size="Large",
    rating=5,
)

c2 = Cupcake(
    flavor="Chocolate",
    size="Small",
    rating=9,
    image="https://www.bakedbyrachel.com/wp-content/uploads/2018/01/chocolatecupcakesccfrosting1_bakedbyrachel.jpg"
)

db.session.add_all([c1, c2])
db.session.commit()
