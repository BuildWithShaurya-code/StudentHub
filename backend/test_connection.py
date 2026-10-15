import sys
import json
from sqlalchemy import create_engine, text
from config import Config

def run_test():
    print("=" * 60)
    print(" StudentHub — Stage 1: MySQL Connection Test")
    print("=" * 60)
    print(f"Target Server : {Config.DB_HOST}:{Config.DB_PORT}")
    print(f"Database      : {Config.DB_NAME}")
    print(f"Username      : {Config.DB_USER}")
    print(f"Password Set  : {'Yes (redacted)' if Config.DB_PASSWORD else 'No (Empty)'}")
    print(f"Safe URI      : {Config.safe_db_summary()}")
    print("-" * 60)

    try:
        engine = create_engine(
            Config.SQLALCHEMY_DATABASE_URI,
            **Config.SQLALCHEMY_ENGINE_OPTIONS
        )

        with engine.connect() as conn:
            # 1. Verify MySQL version & current database
            res_ver = conn.execute(text("SELECT VERSION()")).scalar()
            res_db = conn.execute(text("SELECT DATABASE()")).scalar()
            print(f" Connected successfully!")
            print(f"MySQL Version   : {res_ver}")
            print(f"Active Database : {res_db}")
            print("-" * 60)

            # 2. Inspect existing tables in studenthub_db
            res_tables = conn.execute(text("SHOW TABLES")).fetchall()
            table_names = [r[0] for r in res_tables]
            print(f"Existing Tables in '{Config.DB_NAME}': {table_names if table_names else '(No tables found)'}")

            # 3. Check for students table specifically
            if 'students' in table_names:
                print("\n Inspecting existing 'students' table schema:")
                columns = conn.execute(text("DESCRIBE students")).fetchall()
                for col in columns:
                    field, col_type, null, key, default, extra = col
                    print(f"  - {field:<20} {col_type:<20} Null: {null:<4} Key: {key:<4} Default: {default or ''} Extra: {extra or ''}")

                count = conn.execute(text("SELECT COUNT(*) FROM students")).scalar()
                print(f"\nTotal existing records in 'students': {count}")
            else:
                print("\n 'students' table does not exist yet in 'studenthub_db'.")

        print("=" * 60)
        print("STAGE 1 RESULT: SUCCESS")
        print("=" * 60)
        return True

    except Exception as e:
        err_msg = str(e)
        print(" Connection Failed!")
        print("-" * 60)
        if "1045" in err_msg or "Access denied" in err_msg:
            print("REASON: Authentication Failed (Error 1045).")
            print("The MySQL user requires a valid password.")
            print("Please set your MySQL root password in 'backend/.env' (DB_PASSWORD=...).")
        elif "1049" in err_msg or "Unknown database" in err_msg:
            print(f"REASON: Unknown database '{Config.DB_NAME}' (Error 1049).")
            print(f"The MySQL server is running, but database '{Config.DB_NAME}' does not exist yet.")
            print(f"You can create it in MySQL Workbench: CREATE DATABASE {Config.DB_NAME};")
        elif "2003" in err_msg or "Can't connect to MySQL server" in err_msg:
            print(f"REASON: Can't connect to MySQL server at {Config.DB_HOST}:{Config.DB_PORT} (Error 2003).")
            print("Please ensure the MySQL Server is running.")
        else:
            # Print generic safe message
            print(f"REASON: {type(e).__name__}")
            # Filter out credentials if somehow present in raw message
            clean_err = err_msg.replace(Config.DB_PASSWORD, '****') if Config.DB_PASSWORD else err_msg
            print(f"Details: {clean_err[:300]}")

        print("=" * 60)
        print("STAGE 1 RESULT: FAILED - ACTION REQUIRED")
        print("=" * 60)
        return False

if __name__ == '__main__':
    success = run_test()
    sys.exit(0 if success else 1)
