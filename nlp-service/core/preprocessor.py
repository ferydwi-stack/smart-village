import nltk
from nltk.corpus import stopwords
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory

# Men-download data NLTK yang diperlukan: 'punkt' untuk tokenisasi dan 'stopwords' untuk kata umum
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

class TextPreprocessor:
    def __init__(self):
        # Inisialisasi Sastrawi Stemmer (Khusus Bahasa Indonesia)
        # Fungsinya untuk memotong imbuhan agar mendapatkan kata dasar (misal: "membeli" -> "beli")
        factory = StemmerFactory()
        self.stemmer = factory.create_stemmer()
        
        # Memuat daftar stopword standar Bahasa Indonesia dari NLTK
        try:
            self.indo_stopwords = set(stopwords.words('indonesian'))
        except:
            self.indo_stopwords = set()
            
        # Mengeluarkan kata kunci penanya penting agar tetap dianalisis AI
        self.indo_stopwords.discard("cara")
        self.indo_stopwords.discard("bagaimana")
            
        # Menambahkan stopword tambahan (kata informal yang sering muncul tapi tidak bermakna unik)
        self.custom_stopwords = {
            "yang", "di", "dan", "ini", "itu", "untuk", "pada", "dengan", "saya", 
            "tidak", "bisa", "sudah", "dari", "ke", "juga", "akan", "lebih", "ada", 
            "mereka", "dia", "kami", "nya", "lah", "pun", "sih", "dong", "ya", "kok", "deh"
        }
        self.indo_stopwords.update(self.custom_stopwords)

    def preprocess(self, text: str) -> str:
        """
        Urutan Proses Pembersihan Teks (NLP Preprocessing Pipeline):
        """
        # 1. Lowercasing: Mengubah teks menjadi huruf kecil semua agar "Barang" dan "barang" dianggap sama
        text = text.lower()
        
        # 2. Tokenizing: Memecah kalimat menjadi daftar kata (tokens)
        tokens = nltk.word_tokenize(text)
        
        # 3. Filtering: Menghapus kata-kata yang tidak penting (stopwords) 
        # dan hanya menyisakan kata yang berisi huruf saja (menghapus angka/simbol)
        tokens = [t for t in tokens if t.isalpha() and t not in self.indo_stopwords]
        
        # 4. Stemming: Mengubah setiap kata menjadi kata dasarnya menggunakan Sastrawi
        # Sastrawi bekerja lebih baik jika menerima string utuh, jadi kita gabungkan dulu tokens-nya
        text_clean = " ".join(tokens)
        text_stemmed = self.stemmer.stem(text_clean)
        
        # Mengembalikan hasil teks yang sudah bersih dan berupa kata-dasar
        return text_stemmed
