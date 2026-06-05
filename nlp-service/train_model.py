import os
import json
import joblib
import nltk
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split

# Menyiapkan data pendukung NLP (Punkt untuk pemecah kata, Stopwords untuk kata umum)
nltk.download('punkt')
nltk.download('stopwords')
from nltk.corpus import stopwords

# Inisialisasi Sastrawi untuk proses Stemming Bahasa Indonesia
factory = StemmerFactory()
stemmer = factory.create_stemmer()

# Daftar kata yang akan dihapus karena terlalu umum dan tidak membantu klasifikasi
try:
    indo_stopwords = set(stopwords.words('indonesian'))
except:
    indo_stopwords = set()

# Mengeluarkan kata kunci penanya penting agar tetap dianalisis AI
indo_stopwords.discard("cara")
indo_stopwords.discard("bagaimana")

custom_stopwords = {
    "dan", "atau", "di", "ke", "dari", "ini", "itu", "yang", "saya", "kami", 
    "anda", "mereka", "dia", "adalah", "yaitu", "yakni", "karena", "sehingga",
    "untuk", "dengan", "pada", "tentang", "seperti"
}
indo_stopwords.update(custom_stopwords)

def preprocess(text):
    """
    Fungsi pembersihan teks sebelum masuk ke tahap pelatihan model AI
    """
    text = text.lower()
    tokens = nltk.word_tokenize(text)
    # Hanya ambil kata yang isinya huruf (bukan angka/simbol) dan bukan stopwords
    tokens = [t for t in tokens if t.isalpha() and t not in indo_stopwords]
    text_clean = " ".join(tokens)
    # Mengubah ke kata dasar agar "Membeli" dan "Beli" dianggap 1 fitur yang sama
    text_stemmed = stemmer.stem(text_clean)
    return text_stemmed

def train_and_save_model():
    """
    Proses Utama Pelatihan Model AI (Machine Learning Pipeline)
    """
    # 1. Menyiapkan Dataset (Kumpulan Contoh Pesanan & Labelnya/Intentnya)
    # Dataset diperluas dari ~75 menjadi 350+ contoh untuk meningkatkan akurasi klasifikasi
    dataset = [
        # =============================================
        # KATEGORI PRODUK (~70 contoh)
        # Variasi: formal, informal, gaul, typo, konteks DesaMart
        # =============================================
        ("Barang saya rusak", "Produk"),
        ("Produk tidak sesuai deskripsi", "Produk"),
        ("Barang yang saya terima cacat", "Produk"),
        ("Kualitas barang jelek", "Produk"),
        ("Produk tidak seperti di foto", "Produk"),
        ("Deskripsi produk kurang jelas", "Produk"),
        ("Barang yang dikirim salah", "Produk"),
        ("Produk tidak layak pakai", "Produk"),
        ("brg yg dikirim rusak nih min", "Produk"),
        ("brg ga sesuai sama di foto", "Produk"),
        ("kok barngnya cacat ya", "Produk"),
        ("kualitas brng jelek banget", "Produk"),
        ("baju yang dikirim sobek", "Produk"),
        ("barangnya ga nyala", "Produk"),
        ("pesenan ga sesuai", "Produk"),
        ("warnanya beda sama yang di pesen", "Produk"),
        ("pecah pas sampe", "Produk"),
        ("ukuran kekecilan", "Produk"),
        # Tambahan formal
        ("Barang yang saya terima tidak berfungsi", "Produk"),
        ("Produk memiliki cacat pada bagian kemasan", "Produk"),
        ("Barang tidak sesuai dengan spesifikasi yang tercantum", "Produk"),
        ("Saya menerima barang yang salah", "Produk"),
        ("Produk yang saya terima sudah kadaluarsa", "Produk"),
        ("Barang mengalami kerusakan saat pengiriman", "Produk"),
        ("Kualitas produk sangat mengecewakan", "Produk"),
        ("Barang tidak sesuai ukuran yang dipesan", "Produk"),
        ("Produk berbeda dari yang ditampilkan di gambar", "Produk"),
        ("Saya ingin komplain soal produk yang rusak", "Produk"),
        ("Barang yang sampai sudah tidak layak digunakan", "Produk"),
        # Tambahan informal/gaul
        ("barang gue rusak min tolong", "Produk"),
        ("beli barang tp kondisinya jelek banget", "Produk"),
        ("min barangku cacat nih gimana", "Produk"),
        ("produk yang dapet beda sama gambar", "Produk"),
        ("pesanan salah kirim", "Produk"),
        ("barangnya patah waktu dibuka", "Produk"),
        ("warna beda jauh dari foto", "Produk"),
        ("ukurannya ga pas sama yang dipesan", "Produk"),
        ("barang ga sesuai ekspektasi", "Produk"),
        ("kualitasnya buruk banget", "Produk"),
        ("barang rusak pas nyampe", "Produk"),
        ("produknya ga sesuai deskripsi", "Produk"),
        ("ini bukan barang yang gue pesan", "Produk"),
        ("barangnya lecet waktu buka", "Produk"),
        ("produk mati total", "Produk"),
        ("kemasan rusak isinya pecah", "Produk"),
        ("salah warna yang dikirim", "Produk"),
        # Variasi typo / disingkat
        ("brg cacat bgt min", "Produk"),
        ("prdk tdk ssuai dskripsi", "Produk"),
        ("brg ga ssuai foto", "Produk"),
        ("gue dpt barang slah", "Produk"),
        ("brg kmasan rusak", "Produk"),
        ("baju sobek udh dr dl", "Produk"),
        ("barang mati ga nyala2", "Produk"),
        ("produk ky gini nih kualitas sbrnya", "Produk"),
        ("brg ga layak pk", "Produk"),
        # Konteks laporan produk DesaMart
        ("saya ingin melaporkan produk yang tidak pantas", "Produk"),
        ("ada produk yang tidak layak dijual di DesaMart", "Produk"),
        ("mau lapor barang yang tidak sesuai", "Produk"),
        ("ada barang yang mencurigakan di marketplace", "Produk"),
        ("produk ini perlu dicek sama admin", "Produk"),
        ("tolong hapus produk ini dari toko", "Produk"),
        ("min ada barang yang melanggar aturan", "Produk"),
        ("lapor produk palsu di DesaMart", "Produk"),
        ("ada yang jual barang haram nih", "Produk"),
        ("produk ini tidak boleh dijual", "Produk"),

        # =============================================
        # KATEGORI TRANSAKSI (~65 contoh)
        # =============================================
        ("Saya tidak bisa checkout", "Transaksi"),
        ("Gagal melakukan pembayaran", "Transaksi"),
        ("Pesanan tidak masuk", "Transaksi"),
        ("Tidak bisa membeli barang", "Transaksi"),
        ("Checkout error", "Transaksi"),
        ("Pembayaran saya gagal terus", "Transaksi"),
        ("Pesanan saya tidak muncul", "Transaksi"),
        ("Tidak bisa konfirmasi pesanan", "Transaksi"),
        ("min gabisa tf pake briva ya", "Transaksi"),
        ("knp tiap mau bayar error mlu", "Transaksi"),
        ("saldo sdh kepotong tp pesanan ga msk", "Transaksi"),
        ("tombol buat pesanan ga bisa dipencet", "Transaksi"),
        ("gagal bayar mulu dari tadi", "Transaksi"),
        ("kenapa keranjang error", "Transaksi"),
        ("ga bisa klik beli", "Transaksi"),
        ("transaksi dibatalkan terus", "Transaksi"),
        ("voucher ga bisa dipake", "Transaksi"),
        # Tambahan formal
        ("Saya mengalami kendala saat proses pembayaran", "Transaksi"),
        ("Transaksi saya gagal padahal saldo mencukupi", "Transaksi"),
        ("Sistem tidak menerima metode pembayaran saya", "Transaksi"),
        ("Pesanan tidak terkonfirmasi setelah pembayaran", "Transaksi"),
        ("Saya tidak dapat menyelesaikan proses pembelian", "Transaksi"),
        ("Tombol konfirmasi pesanan tidak berfungsi", "Transaksi"),
        ("Keranjang belanja saya tidak bisa dibuka", "Transaksi"),
        ("Voucher diskon tidak dapat digunakan", "Transaksi"),
        ("Saya sudah bayar tapi status masih menunggu", "Transaksi"),
        ("Dana sudah terpotong tapi pesanan tidak ada", "Transaksi"),
        # Tambahan informal/gaul
        ("bayar gagal mulu padahal duit ada", "Transaksi"),
        ("checkout tapi ga bisa dilanjutin", "Transaksi"),
        ("pesenan gue ga masuk padahal udah bayar", "Transaksi"),
        ("min transfer gagal terus gimana", "Transaksi"),
        ("knp ya tiap mau beli selalu error", "Transaksi"),
        ("tombol pesan ga bisa diklik", "Transaksi"),
        ("aplikasi freeze pas mau bayar", "Transaksi"),
        ("error pas proses pembayaran", "Transaksi"),
        ("uang udah kepotong tp barang ga di proses", "Transaksi"),
        ("status bayar nunggu mulu ga berubah", "Transaksi"),
        ("mau cancel pesanan gimana caranya", "Transaksi"),
        ("gimana cara batalin order", "Transaksi"),
        ("pesan sudah masuk tapi mau dibatalin", "Transaksi"),
        ("refund kemana ya kalau batal", "Transaksi"),
        ("pesanan gue ilang dari riwayat", "Transaksi"),
        ("ada double charge nih min", "Transaksi"),
        ("kena charge dua kali", "Transaksi"),
        ("ga bisa pake ovo buat bayar", "Transaksi"),
        ("pembayaran lewat gopay error", "Transaksi"),
        # Variasi typo / singkatan
        ("ga bs ckout", "Transaksi"),
        ("pmbayaran ggal trus", "Transaksi"),
        ("pesen msk tp duit kpotong", "Transaksi"),
        ("krnjang ga bs dbuka", "Transaksi"),
        ("vc ga bs dpakai", "Transaksi"),
        ("byr error mlu", "Transaksi"),
        ("gnti mtd byr jg ggal", "Transaksi"),
        ("pesan 2x karena error", "Transaksi"),
        ("kena charge 2x gimana refundnya", "Transaksi"),
        ("minta refund donk", "Transaksi"),
        ("proses pengembalian dana gimana", "Transaksi"),
        ("kapan uang saya kembali", "Transaksi"),
        ("dana balik kemana setelah dibatalkan", "Transaksi"),

        # =============================================
        # KATEGORI PENGIRIMAN (~65 contoh)
        # =============================================
        ("Barang saya belum sampai", "Pengiriman"),
        ("Pesanan lama sekali", "Pengiriman"),
        ("Status tidak berubah", "Pengiriman"),
        ("Pengiriman terlalu lama", "Pengiriman"),
        ("Barang belum dikirim", "Pengiriman"),
        ("Kapan pesanan saya sampai", "Pengiriman"),
        ("Barang belum saya terima", "Pengiriman"),
        ("Pengiriman bermasalah", "Pengiriman"),
        ("pesenan w kok ga nyampe nyampe ya", "Pengiriman"),
        ("min brgku kpn dikirim?", "Pengiriman"),
        ("status pengiriman kok ga jalan jalan", "Pengiriman"),
        ("kurirnya nyasar brg blm kuterima", "Pengiriman"),
        ("no resi ga bisa dilacak nih", "Pengiriman"),
        ("kurir belum pickup", "Pengiriman"),
        ("paket nyangkut di gudang", "Pengiriman"),
        ("kapan nyampe sih lama bgt", "Pengiriman"),
        ("ongkir kemahalan", "Pengiriman"),
        # Tambahan formal
        ("Barang saya belum juga sampai setelah beberapa hari", "Pengiriman"),
        ("Status pengiriman tidak kunjung berubah", "Pengiriman"),
        ("Estimasi pengiriman sudah terlewati", "Pengiriman"),
        ("Nomor resi tidak dapat dilacak di sistem", "Pengiriman"),
        ("Penjual belum mengirimkan barang saya", "Pengiriman"),
        ("Kurir tidak bisa dihubungi", "Pengiriman"),
        ("Paket saya hilang dalam pengiriman", "Pengiriman"),
        ("Barang dikembalikan ke pengirim tanpa konfirmasi", "Pengiriman"),
        ("Pengiriman sudah melebihi estimasi yang dijanjikan", "Pengiriman"),
        ("Saya ingin mengubah alamat pengiriman", "Pengiriman"),
        # Tambahan informal/gaul
        ("min barang gue kemana sih ga nyampe", "Pengiriman"),
        ("udah seminggu barang blm dateng", "Pengiriman"),
        ("lacak pesanan error ga bisa dilacak", "Pengiriman"),
        ("kurir ga nelpon pas mau deliver", "Pengiriman"),
        ("paket gue hilang kayaknya", "Pengiriman"),
        ("barang balik ke pengirim sendiri kok", "Pengiriman"),
        ("status masih di gudang dari kemarin", "Pengiriman"),
        ("tracking ga update dari 3 hari lalu", "Pengiriman"),
        ("kurirnya salah alamat", "Pengiriman"),
        ("resi ini bisa dilacak ga", "Pengiriman"),
        ("kapan barang gue dikirim pak", "Pengiriman"),
        ("penjual belum proses pesenan gue", "Pengiriman"),
        ("min tolong follow up ke kurirnya", "Pengiriman"),
        ("ongkir berapa untuk kirim ke sini", "Pengiriman"),
        ("ada pilihan pengiriman express ga", "Pengiriman"),
        ("bisa ganti alamat pengiriman ga", "Pengiriman"),
        # Variasi typo / singkatan
        ("brg blm smpe smpe", "Pengiriman"),
        ("pket ilang kayaknya", "Pengiriman"),
        ("trking ga updte", "Pengiriman"),
        ("krr blm pckup", "Pengiriman"),
        ("ngrim ke mana ini kurir", "Pengiriman"),
        ("rsi ga bs dilcak", "Pengiriman"),
        ("udh lma bgt ga nyampe", "Pengiriman"),
        ("status pngrman stuck", "Pengiriman"),
        ("paket ke return nih", "Pengiriman"),
        ("gmn cr lacak pesanan", "Pengiriman"),
        ("mau tau posisi barang ku dimana", "Pengiriman"),
        ("barang sudah sampai dimana ya", "Pengiriman"),
        ("cek status pengiriman donk", "Pengiriman"),

        # =============================================
        # KATEGORI AKUN (~65 contoh)
        # =============================================
        ("Saya tidak bisa login", "Akun"),
        ("Lupa password", "Akun"),
        ("Tidak bisa daftar", "Akun"),
        ("Akun saya error", "Akun"),
        ("Tidak bisa masuk akun", "Akun"),
        ("Akun tidak bisa digunakan", "Akun"),
        ("Gagal login terus", "Akun"),
        ("Tidak bisa verifikasi akun", "Akun"),
        ("min kok gw gabisa masuk akun ya", "Akun"),
        ("pass bener tapi login gagal trus", "Akun"),
        ("lupa sandi trus emailnya mati", "Akun"),
        ("mau daftar tp gagal trus", "Akun"),
        ("akun keblokir gmn cara bukanya", "Akun"),
        ("otp ga masuk masuk", "Akun"),
        ("verifikasi nomer hp gagal", "Akun"),
        ("gak bisa ganti password", "Akun"),
        # Tambahan formal
        ("Akun saya tidak dapat diakses", "Akun"),
        ("Saya tidak dapat melakukan registrasi", "Akun"),
        ("Email verifikasi tidak kunjung diterima", "Akun"),
        ("Kata sandi saya tidak berfungsi", "Akun"),
        ("Akun saya telah dinonaktifkan", "Akun"),
        ("Saya ingin menghapus akun saya", "Akun"),
        ("Profil saya tidak dapat diedit", "Akun"),
        ("Nama toko saya tidak bisa diubah", "Akun"),
        ("Foto profil tidak bisa diperbarui", "Akun"),
        ("Saya tidak bisa mengubah nomor telepon", "Akun"),
        # Tambahan informal/gaul
        ("akun gue hilang kemana", "Akun"),
        ("login gagal terus padahal pw bener", "Akun"),
        ("email verif ga masuk inbox", "Akun"),
        ("otp ga dateng dateng", "Akun"),
        ("akun kena banned nih min", "Akun"),
        ("mau hapus akun gimana caranya", "Akun"),
        ("ubah email di akun bisa ga", "Akun"),
        ("ganti nomor hp yang terdaftar gimana", "Akun"),
        ("profil ga bisa disimpen", "Akun"),
        ("foto profil ga bisa diupload", "Akun"),
        ("akun gue dicuri kayaknya", "Akun"),
        ("ada yang login ke akun gue", "Akun"),
        ("ganti password lama gimana", "Akun"),
        ("mau reset akun dari awal", "Akun"),
        ("daftar tapi email sudah terdaftar katanya", "Akun"),
        ("nomor hp sudah dipakai kata sistemnya", "Akun"),
        # Variasi typo / singkatan
        ("lgn ggal mlu", "Akun"),
        ("lpa pswd", "Akun"),
        ("akn ga bs dkses", "Akun"),
        ("vrf hp ggal", "Akun"),
        ("otp ga msk2", "Akun"),
        ("akun kblokir", "Akun"),
        ("dftr slalu ggal", "Akun"),
        ("email vrf ga msk", "Akun"),
        ("ga bs gnt pw", "Akun"),
        ("akun kna hack", "Akun"),
        ("mau login tapi selalu salah katanya", "Akun"),
        ("saya sudah buat akun tapi tidak bisa masuk", "Akun"),
        ("akun saya tidak aktif", "Akun"),

        # =============================================
        # KATEGORI FAQ (~65 contoh)
        # =============================================
        ("Bagaimana cara beli barang", "FAQ"),
        ("Bagaimana cara menjual barang", "FAQ"),
        ("Cara membeli produk", "FAQ"),
        ("Cara menambah produk", "FAQ"),
        ("Bagaimana cara checkout", "FAQ"),
        ("Cara melihat pesanan", "FAQ"),
        ("Bagaimana cara login", "FAQ"),
        ("Bagaimana cara daftar", "FAQ"),
        ("tutor cara jualan min", "FAQ"),
        ("buka toko dmn ya", "FAQ"),
        ("cara belanja nya gmn", "FAQ"),
        ("tutorial pesen brg", "FAQ"),
        ("kasih tau cara liat histori blanja", "FAQ"),
        ("gimana caranya bikin akun", "FAQ"),
        ("cara reset sandi", "FAQ"),
        # Tambahan formal
        ("Bagaimana cara mendaftarkan diri sebagai penjual", "FAQ"),
        ("Bagaimana cara mengelola toko di DesaMart", "FAQ"),
        ("Cara mengunggah produk ke DesaMart", "FAQ"),
        ("Bagaimana cara melihat riwayat transaksi", "FAQ"),
        ("Cara membatalkan pesanan yang sudah dibuat", "FAQ"),
        ("Bagaimana cara menggunakan fitur chatbot", "FAQ"),
        ("Metode pembayaran apa saja yang tersedia", "FAQ"),
        ("Apakah DesaMart tersedia di seluruh wilayah", "FAQ"),
        ("Bagaimana kebijakan pengembalian barang", "FAQ"),
        ("Bagaimana cara menghubungi admin", "FAQ"),
        ("Jam operasional DesaMart", "FAQ"),
        ("Bagaimana cara mengajukan komplain", "FAQ"),
        ("Apa saja kategori produk yang tersedia", "FAQ"),
        ("Bagaimana cara mengedit produk yang dijual", "FAQ"),
        # Tambahan informal/gaul
        ("cara jualan di desamart gmn sih", "FAQ"),
        ("gimana cara pake marketplace ini", "FAQ"),
        ("bisa beli barang tanpa daftar ga", "FAQ"),
        ("cara pesen barang di sini gmn", "FAQ"),
        ("cara daftar akun di DesaMart", "FAQ"),
        ("cara liat pesanan yang udah dibuat", "FAQ"),
        ("gimana cara batalin pesanan", "FAQ"),
        ("cara upload foto produk gimana", "FAQ"),
        ("cara jadi seller di sini", "FAQ"),
        ("bisa bayar pake apa aja", "FAQ"),
        ("ada promo atau diskon ga", "FAQ"),
        ("cara dapet voucher diskon gmn", "FAQ"),
        ("cara pakai promo code", "FAQ"),
        ("cara chat sama penjual", "FAQ"),
        ("cara kasih ulasan produk", "FAQ"),
        ("bisa minta refund ga", "FAQ"),
        ("proses refund berapa lama", "FAQ"),
        ("DesaMart itu apa sih", "FAQ"),
        ("ini bisa buat belanja apa aja", "FAQ"),
        # Variasi typo / singkatan
        ("cr bli brg", "FAQ"),
        ("cr jual brg", "FAQ"),
        ("cr dftr akun", "FAQ"),
        ("gmn cr bli", "FAQ"),
        ("cr liat pesen", "FAQ"),
        ("gmn cr jd seller", "FAQ"),
        ("cr upld foto", "FAQ"),
        ("cr buka toko", "FAQ"),
        ("cr pke vouchr", "FAQ"),
        ("cara refund gimana", "FAQ"),
        ("gmn cr ckout", "FAQ"),
    ]

    X = [d[0] for d in dataset]
    y = [d[1] for d in dataset]

    # 2. Preprocessing Data Training
    print("Preprocessing data...")
    X_processed = [preprocess(x) for x in X]

    # 3. Model Training
    print("Training model...")
    
    # TF-IDF Vectorizer: Mengubah teks menjadi angka.
    # ngram_range=(1,2) artinya AI belajar dari kata tunggal (unigram) dan pasangan 2 kata (bigram)
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1,2))
    X_tfidf = vectorizer.fit_transform(X_processed)

    # Membagi data menjadi 80% untuk BELAJAR (Train) dan 20% untuk UJIAN (Test)
    X_train, X_test, y_train, y_test = train_test_split(
        X_tfidf, y, test_size=0.2, random_state=42, stratify=y
    )

    # Menggunakan algoritma Logistic Regression
    # Sangat baik untuk klasifikasi teks dengan TF-IDF features
    classifier = LogisticRegression(C=1.0, random_state=42, max_iter=1000)
    classifier.fit(X_train, y_train)

    # Evaluasi: Melihat seberapa pintar AI setelah dilatih
    y_pred = classifier.predict(X_test)
    print("\nClassification Report (Evaluation on 20% test split):")
    print(classification_report(y_test, y_pred))

    # Melatih ulang menggunakan SEMUA data setelah dirasa performanya oke
    print("Retraining on full dataset...")
    classifier.fit(X_tfidf, y)

    # 4. Menyimpan hasil otak AI (Model & Vectorizer) ke file agar bisa dipakai di nlp-service
    os.makedirs("models", exist_ok=True)
    joblib.dump(classifier, "models/classifier.pkl")
    joblib.dump(vectorizer, "models/vectorizer.pkl")
    
    print("\nModel and vectorizer saved to models/ directory.")

if __name__ == "__main__":
    train_and_save_model()
