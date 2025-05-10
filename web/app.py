# Standard Library Imports
import os
import uuid
import datetime
import base64
import random
import json
import string
from enum import Enum
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Third-Party Imports
from flask import (
    Flask,
    jsonify,
    request,
    render_template,
    send_from_directory,
    redirect,
    url_for,
    current_app,
)
from flask_sqlalchemy import SQLAlchemy
from flask_login import (
    UserMixin,
    login_user,
    logout_user,
    login_required,
    current_user,
    LoginManager
)
from flask_bcrypt import Bcrypt # For password hashing
from flask_migrate import Migrate


# Initialize the Flask app
app = Flask(__name__, template_folder='templates', static_folder='static')

# Configurations
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")

# Initialize the database
db = SQLAlchemy(app)

# Register Flask-Migrate
migrate = Migrate(app, db)  

# Initialize the Bcrypt
bcrypt = Bcrypt(app)

# Initialize the LoginManager
login_manager = LoginManager()
login_manager.init_app(app)  # Associate it with the app
login_manager.login_view = 'login'  # Redirect unauthorized users to the login page


# User loader for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User.query.filter_by(user_id=user_id).first()


class User(db.Model, UserMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(150), unique=True, nullable=False)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now())
    last_updated = db.Column(db.DateTime, default=datetime.datetime.now())
    last_login = db.Column(db.DateTime, default=datetime.datetime.now())
    is_deleted = db.Column(db.Boolean, default=False)
    is_banned = db.Column(db.Boolean, default=False)


    def __str__(self) -> str:
        return f"{self.id} : {self.username}"
    
    def get_id(self) -> str:
        return self.user_id 


@app.route('/')
def index():
    user = current_user
    return render_template('index.html', user=user)

# Authentication routes
@app.route('/register', methods=['GET', 'POST'])
def register():
    """
    Handles user registration.
    This function supports both GET and POST HTTP methods:
    - For GET requests, it renders the registration page.
    - For POST requests, it processes the user registration by validating input data,
      checking for existing users, hashing the password, and saving the new user to the database.
    Returns:
        - For GET requests: Renders the 'auth/register.html' template.
        - For POST requests:
            - If any required field is missing, returns a JSON response with an error message and a 400 status code.
            - If the user already exists, returns a JSON response with an error message and a 400 status code.
            - If registration is successful, returns a JSON response with a success message and a 201 status code.
    """

    if request.method == 'GET':
        return render_template('auth/register.html')
    
    elif request.method == 'POST':
        data = request.json

        if not data.get('username') or not data.get('email') or not data.get('password') or not data.get("password_confirm"):
            return jsonify({'error': 'All fields are required'}), 400
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        password_confirm = data.get('password_confirm')

        if password != password_confirm:
            return jsonify({'error': 'Passwords do not match'}), 400


        # Check if user exists
        if User.query.filter_by(email=email).first() or User.query.filter_by(username=username).first():
            return jsonify({'error': 'User already exists'}), 400

        # Uuid for user_id
        user_id = str(uuid.uuid4())
        
        # Hash the password using Bcrypt
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        print(f"Hashed Password: {hashed_password}")
        
        # Create new user
        new_user = User(
            user_id=user_id, 
            username=username, 
            email=email, 
            password=hashed_password
        )

        db.session.add(new_user)
        db.session.commit()


        return jsonify({'message': 'User registered successfully'}), 201
    


@app.route('/login', methods=['GET', 'POST'])
def login():
    """
    Handle user login requests.
    This function supports both GET and POST HTTP methods:
    - GET: Renders the login page.
    - POST: Authenticates the user with provided email and password.
    Returns:
        - On GET: Renders the 'auth/login.html' template.
        - On POST:
            - If email or password is missing, returns a JSON response with an error message and HTTP 400 status.
            - If the user is not found or credentials are invalid, returns a JSON response with an error message and HTTP 401 status.
            - If authentication is successful:
                - Logs in the user.
                - Updates the user's last login timestamp.
                - Commits the changes to the database.
                - Returns a JSON response with a success message and HTTP 200 status.
    """
    if request.method == 'GET':
        return render_template('auth/login.html')
    
    elif request.method == 'POST':
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'All fields are required'}), 400

        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        if not bcrypt.check_password_hash(user.password, password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        login_user(user)
        user.last_login = datetime.datetime.now()
        db.session.commit()

        return jsonify({'message': 'Login successful'}), 200



@app.route('/logout', methods=['GET','POST'])
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))




if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)


