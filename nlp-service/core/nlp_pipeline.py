import os
import joblib
import logging
from .preprocessor import TextPreprocessor
from .response_engine import ResponseEngine
from typing import Any

class NLPClassifier:
    def __init__(self):
        # Inisialisasi komponen: Preprocessor untuk bersihkan teks, ResponseEngine untuk ambil jawaban
        self.preprocessor = TextPreprocessor()
        self.response_engine = ResponseEngine()
        self.model: Any = None
        self.vectorizer: Any = None
        self.model_loaded = False
        self.load_model()

    def load_model(self):
        """
        Memuat model Machine Learning yang sudah dilatih (format .pkl)
        """
        model_path = "models/classifier.pkl"
        vec_path = "models/vectorizer.pkl"
        
        # Mengecek apakah file model ada di folder models/
        if not (os.path.exists(model_path) and os.path.exists(vec_path)):
            logging.warning("Model files not found. Training model now...")
            try:
                from train_model import train_and_save_model # type: ignore
                train_and_save_model()
            except Exception as e:
                logging.error(f"Failed to train model on startup: {e}")
        
        if os.path.exists(model_path) and os.path.exists(vec_path):
            try:
                # joblib.load digunakan untuk membaca file AI (Binary) ke dalam memori Python
                self.model = joblib.load(model_path)
                self.vectorizer = joblib.load(vec_path)
                
                # Deteksi jika model lama (Naive Bayes) yang termuat dari volume Docker
                from sklearn.linear_model import LogisticRegression
                if not isinstance(self.model, LogisticRegression):
                    logging.warning("Loaded model is not LogisticRegression (old NB model). Retraining...")
                    from train_model import train_and_save_model # type: ignore
                    train_and_save_model()
                    self.model = joblib.load(model_path)
                    self.vectorizer = joblib.load(vec_path)
                
                self.model_loaded = True
                logging.info("NLP model and vectorizer loaded successfully.")
            except Exception as e:
                logging.error(f"Error loading model files: {e}")
                self.model_loaded = False
        else:
            logging.warning("Model files not found. Running in fallback mode.")
            self.model_loaded = False

    def classify(self, text: str) -> dict:
        """
        Proses utama menebak kategori (Intent) dari input pengguna
        """
        if not self.model_loaded:
            return {
                "kategori": "Lainnya",
                "confidence": 0.0,
                "response": "Maaf, layanan chatbot sedang tidak tersedia. Silakan coba lagi nanti."
            }
            
        try:
            # LANGKAH 1: Preprocessing
            # Teks dibersihkan (lowercase, hapus stopwords, stemming)
            processed_text = self.preprocessor.preprocess(text)
            
            # LANGKAH 2: Vectorization
            # Mengubah teks yang sudah bersih menjadi angka (Vektor TF-IDF) agar bisa diproses AI semikonduktor
            X_tfidf = self.vectorizer.transform([processed_text])
            
            # LANGKAH 3: Prediction
            # AI menebak kategori (Intent) berdasarkan pola angka yang dia pelajari saat training
            kategori = self.model.predict(X_tfidf)[0]
            
            # LANGKAH 4: Confidence Score
            # Mengukur seberapa yakin AI dengan tebakannya (nilai 0.0 sampai 1.0)
            probs = self.model.predict_proba(X_tfidf)[0]
            max_prob_idx = probs.argmax()
            confidence = float(probs[max_prob_idx])
            
            # LANGKAH 5: Response Generation
            # Mencari respon yang tepat (cek keyword spesifik dulu)
            specific_responses = self.response_engine.responses.get("specific", {})
            text_lower = text.lower()
            
            import re
            import difflib
            # Ekstrak kata-kata dari input user untuk dicocokkan (Fuzzy Matching)
            input_words = re.findall(r'\w+', text_lower)
            
            final_response = None
            final_kategori = kategori
            
            # Cek apakah ada kecocokan kata kunci manual (Override AI) dengan Toleransi Typo
            for keyword, resp in specific_responses.items():
                words = keyword.split()
                
                is_match = True
                for word in words:
                    # Cek apakah kata ada persis di text_lower, ATAU ada kata yang mirip >= 75% di input_words
                    if word not in text_lower and not difflib.get_close_matches(word, input_words, n=1, cutoff=0.75):
                        is_match = False
                        break
                        
                if is_match:
                    final_response = resp
                    # Jika lapor barang atau menyebut nama barang, paksa kategori ke 'Produk' agar lolos DB Check
                    report_keywords = ["lapor", "produk", "barangnya", "barangya", "baranya", "namanya"]
                    if any(key in keyword for key in report_keywords):
                        final_kategori = "Produk"
                    break
            
            # Menyimpan status apakah jawaban manual sudah ditemukan
            is_manual_override = final_response is not None
            
            if not final_response:
                if confidence < 0.4:
                    final_kategori = "Lainnya"
                    final_response = "Maaf, saya tidak begitu memahami pesan Anda. Silakan jelaskan kendala Anda secara lebih detail agar saya dapat membantu dengan tepat."
                else:
                    final_response = self.response_engine.get_response(kategori, text)

            return {
                "kategori": final_kategori,
                "confidence": 1.0 if is_manual_override else confidence,
                "response": final_response
            }
        except Exception as e:
            logging.error(f"Error during classification: {e}")
            return {
                "kategori": "Lainnya",
                "confidence": 0.0,
                "response": "Terjadi kesalahan saat memproses pesan Anda."
            }
