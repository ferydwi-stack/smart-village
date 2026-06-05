import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import chat, health
from core.nlp_pipeline import NLPClassifier
from contextlib import asynccontextmanager

# 1. Konfigurasi Logging: 
# Berfungsi mencatat aktivitas aplikasi (seperti jam berapa ada pesan masuk, atau jika ada error) 
# agar kita bisa memantau kesehatan server di terminal/console.
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# 2. Lifespan Event Handler:
# Ini adalah bagian yang mengatur apa yang harus dilakukan aplikasi saat dia BARU MENYALA dan saat AKAN MATI.
@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- SAAT STARTUP (Baru Menyala) ---
    logging.info("Starting up NLP Service...")
    
    # Memanggil "Otak" AI (NLPClassifier) untuk dimuat ke dalam memori server.
    # Ini penting agar saat ada chat masuk, model AI-nya sudah siap digunakan.
    classifier = NLPClassifier()
    app.state.classifier = classifier
    
    logging.info(f"Model loaded status: {classifier.model_loaded}")
    
    yield # Proses server berjalan normal di sini...
    
    # --- SAAT SHUTDOWN (Akan Mati) ---
    logging.info("Shutting down NLP Service...")

# 3. Inisialisasi Aplikasi FastAPI:
# Membuat objek utama 'app' yang menjadi pusat kontrol seluruh layanan API Chatbot.
app = FastAPI(title="DesaMart NLP Service", lifespan=lifespan)

# 4. CORS Middleware:
# Ini sangat PENTING! Fungsinya memberi izin agar Frontend (misal: React/Next.js) 
# yang berada di alamat domain/port berbeda bisa mengirim data ke server Python ini.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Memperbolehkan akses dari alamat mana saja
    allow_credentials=True,
    allow_methods=["*"], # Memperbolehkan semua metode (GET, POST, dll)
    allow_headers=["*"], # Memperbolehkan semua jenis header data
)

# 5. Routing (Pendaftaran Alamat Pintu):
# Menghubungkan file routng ('chat' dan 'health') ke aplikasi utama.
# Router 'chat' diberikan prefix "/api" agar alamatnya menjadi /api/chat
app.include_router(chat.router, prefix="/api")
app.include_router(health.router)

# 6. Endpoint Root (/):
# Hanya sebagai tanda bahwa server sudah berjalan jika dicek lewat browser di alamat dasar.
@app.get("/")
def root():
    return {"message": "Welcome to DesaMart NLP Service"}
