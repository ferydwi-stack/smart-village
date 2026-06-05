# BAHAN SLIDE PRESENTASI DESAMART
## Dibuat oleh Kelompok: fatal_error

---

### **SLIDE 1: COVER PRESENTASI**
*   **Judul Utama:** DesaMart: Platform Marketplace Digital Pemberdayaan Ekonomi Desa
*   **Sub-Judul:** Hub Pasar Lokal yang Cerdas & Terintegrasi Chatbot AI (Microservices Architecture)
*   **Identitas Kelompok:**
    *   **Nama Kelompok:** `fatal_error`
    *   **Anggota Kelompok:**
        1.  I Nyoman Viveka
        2.  Dimas Aprianto
        3.  Fathur Ramantha
        4.  Fery Dwi ramadi
        5.  Alvin Saputra
*   *Catatan Visual:* Desain slide minimalis modern dengan warna hijau alam/daun (#1B5E20) dikombinasikan dengan warna krem hangat (#FFF9EC), merepresentasikan kesegaran alam desa dan kecanggihan teknologi digital.

---

### **SLIDE 2: LATAR BELAKANG & PERMASALAHAN**
*   **Judul Slide:** Latar Belakang: Menjembatani Kesenjangan Digital Desa
*   **Poin Utama:**
    *   **Akses Pasar Terbatas:** Produk lokal unggulan desa (pertanian, kerajinan, kuliner) seringkali sulit dipasarkan ke luar daerah karena keterbatasan jangkauan fisik.
    *   **Minimnya Digitalisasi:** Belum adanya wadah e-commerce lokal terpadu yang ramah pengguna bagi masyarakat pedesaan.
    *   **Sistem Pengaduan Tradisional:** Layanan pelanggan atau aduan masalah transaksi masih lambat karena dikelola manual tanpa sistem otomatis.
*   **Solusi Kami:**
    *   **DesaMart:** Sebuah platform marketplace lokal modern dengan arsitektur microservices tangguh dan terintegrasi asisten virtual (Chatbot AI) untuk penanganan keluhan pembeli secara instan 24/7.

---

### **SLIDE 3: DEFINISI PROYEK (APA ITU DESAMART?)**
*   **Judul Slide:** Mengenal DesaMart
*   **Definisi:**
    *   DesaMart adalah platform marketplace digital multi-layanan kontainer berbasis microservices yang dirancang khusus untuk memajukan ekonomi desa secara aman, transparan, dan efisien.
*   **Nilai Jual Utama (Unique Value Proposition):**
    *   **Dual-Role Account:** Pengguna tidak perlu mendaftar dua kali; satu akun terintegrasi penuh untuk berbelanja sekaligus membuka toko online.
    *   **AI Complaint Classifier:** Chatbot pintar berbasis NLP (Natural Language Processing) untuk menjawab pertanyaan umum (FAQ) serta mengelompokkan laporan kendala secara otomatis.

---

### **SLIDE 4: ARSITEKTUR MICROSERVICES TANGGUH**
*   **Judul Slide:** Arsitektur Sistem DesaMart
*   **Komponen Layanan:**
    *   **Reverse Proxy (Nginx):** Pintu gerbang tunggal (Gateway) untuk mengarahkan rute lalu lintas web dengan aman.
    *   **Frontend (Next.js 14):** UI/UX modern responsif dengan performa tinggi (menggunakan Server Component & Standalone build).
    *   **Backend API (Go + Fiber):** Rest API super cepat dan hemat memori untuk melayani transaksi data.
    *   **NLP Service (Python FastAPI):** Engine kecerdasan buatan untuk mengklasifikasi pesan obrolan chatbot.
    *   **Penyimpanan Data (PostgreSQL 16 & Redis 7):** Kombinasi database relasional yang andal serta caching ultra-cepat.
    *   **Object Storage (MinIO):** Penyimpanan gambar produk berskala besar yang kompatibel dengan S3.

---

### **SLIDE 5: FITUR-FITUR UNGGULAN APLIKASI**
*   **Judul Slide:** Fitur Utama DesaMart
*   **Daftar Fitur:**
    *   🛍️ **Satu Akun, Dua Peran:** Beralih dengan mulus antara mode Pembeli (belanja kebutuhan lokal) dan mode Penjual (mengelola katalog produk).
    *   🤖 **AI Chatbot Asisten 24/7:** Asisten interaktif yang langsung membalas pertanyaan transaksi, produk, pengiriman, dan pembuatan akun.
    *   ⚠️ **Sistem Moderasi Laporan (Complaint Dashboard):** Deteksi otomatis barang yang dilaporkan rusak atau tidak layak pakai melalui klasifikasi AI, yang langsung masuk ke dashboard moderasi Admin.
    *   📈 **Aktivitas & Statistik Real-Time:** Dashboard ringkasan performa penjualan dan histori transaksi yang transparan.

---

### **SLIDE 6: DETEKTIF AI: NLP CLASSIFIER SERVICE**
*   **Judul Slide:** Di Balik Layar: Kecerdasan NLP Chatbot
*   **Cara Kerja Pipeline NLP (Python):**
    1.  **Text Preprocessing:** Pembersihan teks dari simbol/angka, konversi huruf kecil (lowercasing), penghapusan stopwords bahasa Indonesia, dan *Stemming* menggunakan **Sastrawi** untuk menemukan kata dasar.
    2.  **Vectorization (TF-IDF):** Mengubah kata-kata bersih menjadi format angka matriks TF-IDF (Unigram & Bigram).
    3.  **Machine Learning Classifier:** Menggunakan algoritma **Multinomial Naive Bayes** yang sangat cepat dan akurat untuk klasifikasi teks berskala kecil hingga menengah.
    4.  **Akurasi Klasifikasi:** Mengklasifikasikan pengaduan pengguna secara otomatis ke dalam **5 Kategori Utama**:
        *   **Produk** *(contoh: "barangnya cacat")*
        *   **Transaksi** *(contoh: "gagal bayar")*
        *   **Pengiriman** *(contoh: "kurir nyasar")*
        *   **Akun** *(contoh: "lupa password")*
        *   **FAQ** *(contoh: "cara jadi penjual")*

---

### **SLIDE 7: BACKEND ENGINE & DATABASE SCHEMA**
*   **Judul Slide:** Backend API & Skema Data yang Solid
*   **Teknologi:** **Golang (Go)** + **Fiber Framework** + **GORM**.
*   **Alasan Pemilihan Go:** Performa mendekati bahasa C, kompilasi sangat cepat, konsumsi RAM yang sangat rendah di container, serta penanganan konkurensi bawaan (goroutines).
*   **Struktur Database Relasional (PostgreSQL):**
    *   `users`: Menyimpan data profil, email terenkripsi, dan kata sandi aman.
    *   `products` & `categories`: Katalog barang dagangan desa.
    *   `orders`: Riwayat transaksi jual beli.
    *   `complaints` & `complaint_messages`: Pencatatan log pesan chatbot, tingkat kepercayaan model AI (*Confidence Score*), status tiket keluhan (`open`, `in_progress`, `resolved`, `closed`), dan aksi admin.

---

### **SLIDE 8: DOCKERIZATION & DEPLOYMENT STRATEGY**
*   **Judul Slide:** Kontainerisasi & Kemudahan Deployment
*   **Teknologi:** **Docker** & **Docker Compose**.
*   **Kelebihan Docker Compose DesaMart:**
    *   **Instan:** Seluruh microservices dapat dijalankan di komputer server mana pun hanya dengan satu perintah: `docker compose up --build`.
    *   **Isolated Environment:** Tidak ada bentrokan versi library antar service (Go, Python, Next.js terisolasi sempurna di containernya masing-masing).
    *   **Production Ready:** Multi-stage build pada Dockerfile Go dan Next.js menghasilkan ukuran image yang sangat ramping (meminimalkan risiko keamanan dan mempercepat deployment).


### **SLIDE 9: KESIMPULAN & PENUTUP**
*   **Judul Slide:** Kesimpulan: Ekonomi Desa Mandiri Secara Digital
*   **Poin Kesimpulan:**
    *   DesaMart sukses mengintegrasikan ekosistem e-commerce lokal dengan teknologi AI Chatbot yang cerdas.
    *   Platform ini siap mempercepat transformasi digital pedesaan, memperluas pasar UMKM, dan memodernisasi layanan publik desa.
*   **Sesi Tanya Jawab (Q&A):**
    *   *"Terima kasih atas perhatian Anda. Kami dari kelompok fatal_error siap menerima pertanyaan dan masukan."*
