import os
import logging

# MANTRA ANTI-DEADLOCK PYTHONANYWHERE
# Harus dieksekusi sebelum Numpy/Scikit-Learn/Joblib dipanggil
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"

from flask import Flask, request, jsonify
from flask_cors import CORS
from psycopg2 import pool
from core.nlp_pipeline import NLPClassifier

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Inisialisasi Flask
app = Flask(__name__)
CORS(app)

logging.info("Starting up NLP Service (Flask Version)...")

# Memuat Model AI Global
nlp_classifier = NLPClassifier()
logging.info(f"Model loaded status: {nlp_classifier.model_loaded}")

# Database Connection Pool
# Database Connection Pool
DB_HOST = os.getenv("DB_HOST", "ep-orange-cloud-aolaqybe-pooler.c-2.ap-southeast-1.aws.neon.tech")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "neondb_owner")
DB_PASSWORD = os.getenv("DB_PASSWORD", "npg_bC2yvBV6aqnA")
DB_NAME = os.getenv("DB_NAME", "neondb")

try:
    db_pool = pool.SimpleConnectionPool(
        1, 10,
        user=DB_USER,
        password=DB_PASSWORD,
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME
    )
    logging.info("PostgreSQL connection pool created successfully.")
except Exception as e:
    logging.error(f"Failed to create PostgreSQL connection pool: {e}")
    db_pool = None


# --- ROUTES ---

@app.route("/", methods=["GET"])
def root():
    return jsonify({"message": "Welcome to DesaMart NLP Service (Flask Edition)"})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model_loaded": nlp_classifier.model_loaded})

@app.route("/api/classify", methods=["POST"])
def classify_text():
    if not nlp_classifier.model_loaded:
        return jsonify({"detail": "Model not loaded"}), 503

    data = request.json or {}
    text = data.get("text", "")
    result = nlp_classifier.classify(text)
    return jsonify(result)

@app.route("/api/chat/message", methods=["POST"])
def chat_message():
    data = request.json or {}
    user_message = data.get("message", "")
    user_id = data.get("user_id", "")

    result = nlp_classifier.classify(user_message)
    complaint_id = None

    if result["kategori"] != "FAQ" and db_pool:
        conn = None
        try:
            conn = db_pool.getconn()
            cursor = conn.cursor()

            cursor.execute(
                """
                INSERT INTO complaints (user_id, category, confidence, raw_message, bot_response, status)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id;
                """,
                (user_id, result["kategori"], result["confidence"], user_message, result["response"], "open")
            )
            complaint_id = cursor.fetchone()[0]

            cursor.execute(
                """
                INSERT INTO complaint_messages (complaint_id, sender, message)
                VALUES (%s, %s, %s);
                """,
                (complaint_id, "user", user_message)
            )

            cursor.execute(
                """
                INSERT INTO complaint_messages (complaint_id, sender, message)
                VALUES (%s, %s, %s);
                """,
                (complaint_id, "bot", result["response"])
            )

            conn.commit()
            logging.info(f"Complaint {complaint_id} saved to database.")

        except Exception as e:
            if conn:
                conn.rollback()
            logging.error(f"Database error during saving complaint: {e}")
        finally:
            if conn:
                db_pool.putconn(conn)

    return jsonify({
        "kategori": result["kategori"],
        "confidence": result["confidence"],
        "response": result["response"],
        "complaint_id": str(complaint_id) if complaint_id else None
    })

@app.route("/api/chat/history/<user_id>", methods=["GET"])
def chat_history(user_id):
    if not db_pool:
        return jsonify({"detail": "Database not available"}), 503

    conn = None
    try:
        conn = db_pool.getconn()
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT cm.id, cm.complaint_id, cm.sender, cm.message, cm.created_at
            FROM complaint_messages cm
            JOIN complaints c ON cm.complaint_id = c.id
            WHERE c.user_id = %s
            ORDER BY cm.created_at DESC;
            """,
            (user_id,)
        )

        rows = cursor.fetchall()
        messages = []
        for row in rows:
            messages.append({
                "id": str(row[0]),
                "complaint_id": str(row[1]),
                "sender": row[2],
                "message": row[3],
                "created_at": str(row[4])
            })

        return jsonify({"messages": messages})

    except Exception as e:
        logging.error(f"Database error during fetching history: {e}")
        return jsonify({"detail": "Internal server error"}), 500
    finally:
        if conn:
            db_pool.putconn(conn)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
