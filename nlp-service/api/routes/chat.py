import os
import logging
from fastapi import APIRouter, HTTPException, Depends
from api.schemas.chat import ClassifyRequest, ClassifyResponse, ChatMessageRequest, ChatMessageResponse, ChatHistoryResponse, ChatMessageItem
from core.nlp_pipeline import NLPClassifier
from psycopg2 import pool

router = APIRouter()
nlp_classifier = NLPClassifier()

# Database Connection Pool
DB_HOST = os.getenv("DB_HOST", "postgres")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_NAME = os.getenv("DB_NAME", "desamart")

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

@router.post("/classify", response_model=ClassifyResponse)
def classify_text(request: ClassifyRequest):
    if not nlp_classifier.model_loaded:
        raise HTTPException(status_code=503, detail="Model not loaded")
        
    result = nlp_classifier.classify(request.text)
    return ClassifyResponse(**result)

@router.post("/chat/message", response_model=ChatMessageResponse)
def chat_message(request: ChatMessageRequest):
    result = nlp_classifier.classify(request.message)
    
    complaint_id = None
    
    # Save to database if not FAQ and DB is connected
    if result["kategori"] != "FAQ" and db_pool:
        conn = None
        try:
            conn = db_pool.getconn()
            cursor = conn.cursor()
            
            # Insert into complaints
            cursor.execute(
                """
                INSERT INTO complaints (user_id, category, confidence, raw_message, bot_response, status)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id;
                """,
                (request.user_id, result["kategori"], result["confidence"], request.message, result["response"], "open")
            )
            complaint_id = cursor.fetchone()[0]
            
            # Insert user message
            cursor.execute(
                """
                INSERT INTO complaint_messages (complaint_id, sender, message)
                VALUES (%s, %s, %s);
                """,
                (complaint_id, "user", request.message)
            )
            
            # Insert bot response
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
            # Still return response to user even if DB fails
        finally:
            if conn:
                db_pool.putconn(conn)
                
    return ChatMessageResponse(
        kategori=result["kategori"],
        confidence=result["confidence"],
        response=result["response"],
        complaint_id=str(complaint_id) if complaint_id else None
    )

@router.get("/chat/history/{user_id}", response_model=ChatHistoryResponse)
def chat_history(user_id: str):
    if not db_pool:
        raise HTTPException(status_code=503, detail="Database not available")
        
    conn = None
    try:
        conn = db_pool.getconn()
        cursor = conn.cursor()
        
        # Query messages for complaints belonging to this user
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
            messages.append(ChatMessageItem(
                id=str(row[0]),
                complaint_id=str(row[1]),
                sender=row[2],
                message=row[3],
                created_at=str(row[4])
            ))
            
        return ChatHistoryResponse(messages=messages)
        
    except Exception as e:
        logging.error(f"Database error during fetching history: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        if conn:
            db_pool.putconn(conn)
