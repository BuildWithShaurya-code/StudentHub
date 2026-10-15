from flask import Flask, jsonify
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from werkzeug.exceptions import HTTPException
from flask_cors import CORS
from sqlalchemy import text
from datetime import datetime
from config import Config
from extensions import db
from routes.students import students_bp

def create_app(test_config=None):
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = Config.SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = Config.SQLALCHEMY_TRACK_MODIFICATIONS
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = Config.SQLALCHEMY_ENGINE_OPTIONS

    if test_config:
        app.config.update(test_config)
    CORS(app, resources={r"/api/*": {"origins": [Config.FRONTEND_ORIGIN]}},
         supports_credentials=False)

    # Initialize extensions
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(students_bp, url_prefix='/api')

    # ------------------------------------------------------------
    # Health Check Endpoint
    # ------------------------------------------------------------
    @app.route('/api/health', methods=['GET'])
    def health_check():
        """
        GET /api/health
        Verifies both Flask runtime and live MySQL database connectivity.
        """
        try:
            # Run simple lightweight query to verify active MySQL session
            db.session.execute(text("SELECT 1"))
            version = db.session.execute(text("SELECT VERSION()")).scalar()

            return jsonify({
                "status": "ok",
                "database": "connected",
                "mysql_version": version,
                "target_database": db.engine.url.database,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }), 200
        except SQLAlchemyError:
            db.session.rollback()
            # Never leak database passwords or internal credentials
            return jsonify({
                "status": "error",
                "database": "disconnected",
                "message": "Failed to connect to MySQL database."
            }), 503

    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        db.session.rollback()
        code = getattr(error.orig, 'args', (None,))[0]
        if code == 1062:
            return jsonify(error="Conflict", message="Roll number or email already exists."), 409
        return jsonify(error="Invalid record", message="The record violates a database constraint."), 400

    @app.errorhandler(SQLAlchemyError)
    def handle_database_error(error):
        db.session.rollback()
        return jsonify(error="Database unavailable", message="Unable to complete the database request."), 503

    @app.errorhandler(Exception)
    def handle_error(error):
        db.session.rollback()
        if isinstance(error, HTTPException):
            return jsonify(error=error.name, message=error.description), error.code
        return jsonify(error="Internal Server Error", message="An unexpected server error occurred."), 500

    return app

if __name__ == '__main__':
    application = create_app()
    print("=" * 60)
    print(" StudentHub Backend Starting...")
    print(f" Target MySQL : {Config.safe_db_summary()}")
    print(f" Listening on : http://127.0.0.1:{Config.FLASK_PORT}")
    print("=" * 60)
    application.run(
        host='127.0.0.1',
        port=Config.FLASK_PORT,
        debug=Config.FLASK_DEBUG
    )
