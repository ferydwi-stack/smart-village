import json
import os
import logging

class ResponseEngine:
    def __init__(self):
        self.responses = {}
        self.load_responses()

    def load_responses(self):
        """
        Mengambil template jawaban dari file JSON data/responses.json
        """
        # Menggunakan path absolut agar lebih aman di lingkungan Docker
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        filepath = os.path.join(base_dir, 'data', 'responses.json')
        
        try:
            if os.path.exists(filepath):
                with open(filepath, 'r', encoding='utf-8') as f:
                    self.responses = json.load(f)
                logging.info(f"Response templates loaded successfully from {filepath}")
            else:
                raise FileNotFoundError(f"File not found at {filepath}")
        except Exception as e:
            logging.error(f"CRITICAL: Failed to load responses.json: {e}")
            # Fallback jika file JSON rusak atau tidak ditemukan
            self.responses = {
                "specific": {
                    "lapor barang": "Baik, mohon sebutkan NAMA BARANG yang bermasalah agar Admin dapat mengeceknya.",
                    "produk tidak pantas": "Mohon sebutkan nama produknya agar kami tindak lanjuti."
                },
                "Produk": "Mohon maaf atas kendala produk Anda.",
                "FAQ": "Terima kasih atas pertanyaan Anda."
            }

    def get_response(self, kategori: str, original_text: str) -> str:
        """
        Logika Pemilihan Jawaban (Decision Engine)
        """
        text_lower = original_text.lower()
        
        # PROSES 1: Pencocokan Kata Kunci Spesifik (Priority #1)
        # Sistem akan mengecek bagian "specific" di responses.json dulu.
        # Jika USER menggunakan kata kunci yang terdaftar, langsung jawab tanpa peduli apa kata AI.
        specific_responses = self.responses.get("specific", {})
        for keyword, response in specific_responses.items():
            # Keyword dipisahkan (misal: "barang rusak" jadi ["barang", "rusak"])
            words = keyword.split()
            # Cek apakah SEMUA kata kunci tersebut ada di kalimat user
            if all(word in text_lower for word in words):
                return response
                
        # PROSES 2: Aturan Tambahan FAQ (Priority #2)
        # Menangani pertanyaan spesifik seputar jualan/belanja di kategori FAQ
        if kategori == "FAQ":
            if "jual" in text_lower:
                return "Untuk menjual barang di DesaMart:\n1. Pastikan Anda sudah login.\n2. Klik inisial nama Anda di pojok kanan atas.\n3. Pilih 'Toko Saya'.\n4. Klik tombol tambah produk, isi data produk dan unggah gambar, lalu simpan."
            elif "beli" in text_lower:
                return "Untuk membeli barang di DesaMart:\n1. Jelajahi produk di halaman Marketplace atau Beranda.\n2. Klik produk yang Anda minati.\n3. Masukkan jumlah dan alamat pengiriman.\n4. Klik tombol 'Buat Pesanan'."
        
        # PROSES 3: Jawaban Berdasarkan Kategori AI (Priority #3 / Fallback)
        # Jika tidak ada kata kunci spesifik yang cocok, gunakan jawaban standar untuk kategori tersebut.
        return self.responses.get(kategori, "Terima kasih atas pesan Anda. Kami akan segera membantu.")
