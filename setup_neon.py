import psycopg2
import sys

conn_string = "postgresql://neondb_owner:npg_bC2yvBV6aqnA@ep-orange-cloud-aolaqybe-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

try:
    print("Connecting to Neon PostgreSQL...")
    conn = psycopg2.connect(conn_string)
    conn.autocommit = True
    cursor = conn.cursor()
    
    print("Reading init.sql...")
    with open('postgres/init.sql', 'r') as file:
        sql_script = file.read()
        
    print("Executing SQL script...")
    cursor.execute(sql_script)
    
    print("Database initialization successful!")
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
