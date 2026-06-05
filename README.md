# PawSphere Backend

Backend API untuk **PawSphere** — Sistem Informasi Platform Layanan Kesehatan Hewan Digital Terintegrasi.

Dibangun dengan **Express.js**, **MySQL**, dan **Prisma ORM**. Integrasi AI Chat Diagnosa menggunakan **Google Gemini API** dengan _fallback_ otomatis ke mesin triase berbasis kata kunci jika API key tidak tersedia.

> **Status iterasi saat ini:** Foundation + Authentication + AI Chat Diagnosa.
> Modul lain (Vet Connect, Marketplace, Paw Alert, Shelter, Adoption, Care Funding) sudah disiapkan di skema database dan tinggal diimplementasikan secara bertahap.

---

## Daftar Isi

1. [Teknologi](#teknologi)
2. [Struktur Folder](#struktur-folder)
3. [Prasyarat](#prasyarat)
4. [Instalasi dari Awal](#instalasi-dari-awal)
5. [Menjalankan Server](#menjalankan-server)
6. [Konfigurasi Environment](#konfigurasi-environment)
7. [Daftar Endpoint](#daftar-endpoint)
8. [Format Response](#format-response)
9. [Pengujian dengan Postman / cURL](#pengujian)
10. [Arsitektur & Konvensi Kode](#arsitektur--konvensi-kode)
11. [Menambahkan Modul Baru](#menambahkan-modul-baru)
12. [Troubleshooting](#troubleshooting)

---

## Teknologi

| Komponen        | Pilihan                          |
| --------------- | -------------------------------- |
| Runtime         | Node.js 18+                      |
| Framework       | Express.js 4.x                   |
| Database        | MySQL 8.x                        |
| ORM             | Prisma 5.x                       |
| Autentikasi     | JWT (`jsonwebtoken`) + `bcryptjs`|
| Validasi        | `express-validator`              |
| AI              | Google Gemini (`@google/genai`)  |

---

## Struktur Folder

```
pawsphere-backend/
├── prisma/
│   ├── schema.prisma          # Definisi seluruh model database (ERD)
│   └── seed.js                # Data awal (akun admin & user demo)
├── src/
│   ├── config/
│   │   ├── env.js             # Pembaca environment variable terpusat
│   │   ├── prisma.js          # Singleton Prisma Client
│   │   └── gemini.js          # Inisialisasi lazy Gemini Client
│   ├── controllers/           # Lapisan HTTP (request → service → response)
│   │   ├── auth.controller.js
│   │   └── ai-chat.controller.js
│   ├── services/              # Logika bisnis + akses database
│   │   ├── auth.service.js
│   │   ├── ai-chat.service.js
│   │   └── gemini.service.js  # Gemini + fallback ke stub
│   ├── routes/                # Definisi endpoint per modul
│   │   ├── index.js           # Agregator semua route + /health
│   │   ├── auth.route.js
│   │   └── ai-chat.route.js
│   ├── middlewares/
│   │   ├── auth.js            # authenticate + authorize (role)
│   │   ├── validate.js        # Handler hasil express-validator
│   │   ├── not-found.js       # 404 untuk route tak dikenal
│   │   └── error-handler.js   # Penanganan error terpusat
│   ├── validators/            # Aturan validasi request
│   │   ├── auth.validator.js
│   │   └── ai-chat.validator.js
│   ├── utils/
│   │   ├── response.js        # successResponse / errorResponse
│   │   ├── api-error.js       # Class ApiError bertipe
│   │   ├── async-handler.js   # Pembungkus async controller
│   │   └── triage-engine.js   # Mesin triase berbasis kata kunci
│   ├── app.js                 # Setup Express (middleware, route, error)
│   └── server.js              # Entry point + graceful shutdown
├── .env.example               # Template environment variable
├── .gitignore
└── package.json
```

---

## Prasyarat

Sebelum memulai, pastikan sudah terpasang di komputer:

- **Node.js** versi 18 atau lebih baru — cek dengan `node --version`
- **MySQL** yang berjalan (bisa lewat **XAMPP**, **Laragon**, atau MySQL standalone)
- **npm** (otomatis terpasang bersama Node.js)
- (Opsional) **Postman** untuk menguji endpoint

---

## Instalasi dari Awal

Ikuti langkah ini secara berurutan.

### 1. Masuk ke folder proyek

```bash
cd pawsphere-backend
```

### 2. Pasang semua dependency

```bash
npm install
```

### 3. Siapkan database MySQL

Buat database kosong bernama `pawsphere`. Beberapa cara:

**Lewat phpMyAdmin (XAMPP):** buka `http://localhost/phpmyadmin` → tab _Databases_ → buat database `pawsphere`.

**Lewat terminal MySQL:**

```sql
CREATE DATABASE db_pawsphere;
```

### 4. Buat file `.env`

Salin template lalu sesuaikan isinya:

```bash
# Windows (Command Prompt)
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Buka `.env` dan sesuaikan minimal dua hal:

- **`DATABASE_URL`** — sesuaikan user, password, dan nama database MySQL Anda.
  Contoh untuk XAMPP default (user `root`, tanpa password):
  ```
  DATABASE_URL="mysql://root:@localhost:3306/pawsphere"
  ```
- **`JWT_SECRET`** — isi dengan string acak yang panjang. Buat dengan:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
  Salin hasilnya ke `JWT_SECRET`.

> **`GEMINI_API_KEY` boleh dikosongkan dulu.** Jika kosong, fitur AI Chat Diagnosa
> otomatis memakai mesin triase berbasis kata kunci bawaan (tanpa panggilan ke
> Gemini). Isi nanti saat sudah punya API key dari https://aistudio.google.com/app/apikey.

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Jalankan migrasi database

Perintah ini membuat seluruh tabel di database `pawsphere` sesuai `schema.prisma`:

```bash
npx prisma migrate dev --name init
```

### 7. Isi data awal (seed)

```bash
npm run db:seed
```

Ini membuat dua akun siap pakai:

| Role  | Email                  | Password      |
| ----- | ---------------------- | ------------- |
| admin | `admin@pawsphere.id`   | `password123` |
| user  | `user@pawsphere.id`    | `password123` |

---

## Menjalankan Server

**Mode development** (auto-reload dengan nodemon):

```bash
npm run dev
```

**Mode produksi:**

```bash
npm start
```

Jika berhasil, terminal menampilkan:

```
============================================
  PawSphere Backend
============================================
  Environment : development
  Server      : http://localhost:3000
  Health      : http://localhost:3000/api/health
  AI Engine   : Keyword stub (fallback)
============================================
```

Baris **AI Engine** menunjukkan `Gemini API` jika `GEMINI_API_KEY` terisi, atau `Keyword stub (fallback)` jika kosong.

Cek cepat lewat browser: buka `http://localhost:3000/api/health`.

---

## Konfigurasi Environment

| Variabel          | Wajib | Default                | Keterangan                                                |
| ----------------- | ----- | ---------------------- | --------------------------------------------------------- |
| `PORT`            | ❌    | `3000`                 | Port server                                               |
| `NODE_ENV`        | ❌    | `development`          | `development` menampilkan detail error                    |
| `DATABASE_URL`    | ✅    | —                      | Connection string MySQL                                   |
| `JWT_SECRET`      | ✅    | —                      | Kunci penandatanganan token                               |
| `JWT_EXPIRES_IN`  | ❌    | `7d`                   | Masa berlaku token                                        |
| `GEMINI_API_KEY`  | ❌    | _(kosong)_             | Kosong = pakai fallback stub                              |
| `GEMINI_MODEL`    | ❌    | `gemini-1.5-flash`     | Model Gemini yang dipakai                                 |
| `CORS_ORIGIN`     | ❌    | `http://localhost:5173`| Origin frontend yang diizinkan (pisahkan koma jika lebih) |

---

## Daftar Endpoint

Base URL: `http://localhost:3000/api`

### Health

| Method | Path      | Auth | Keterangan          |
| ------ | --------- | ---- | ------------------- |
| GET    | `/health` | ❌   | Cek status server   |

### Authentication

| Method | Path             | Auth | Keterangan                          |
| ------ | ---------------- | ---- | ----------------------------------- |
| POST   | `/auth/register` | ❌   | Registrasi akun baru                |
| POST   | `/auth/login`    | ❌   | Login, mengembalikan JWT            |
| GET    | `/auth/me`       | ✅   | Profil user yang sedang login       |

### AI Chat Diagnosa

| Method | Path                    | Auth | Keterangan                                |
| ------ | ----------------------- | ---- | ----------------------------------------- |
| POST   | `/ai-chat/triage`       | ✅   | Buat triase awal dari gejala hewan        |
| GET    | `/ai-chat/histories`    | ✅   | Riwayat triase milik user (terbaru dulu)  |
| GET    | `/ai-chat/histories/:id`| ✅   | Detail satu riwayat triase                |

Endpoint ber-`Auth ✅` membutuhkan header:

```
Authorization: Bearer <token>
```

---

## Format Response

Semua response mengikuti envelope yang konsisten.

**Sukses:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": { }
}
```

**Error:**

```json
{
  "success": false,
  "message": "Validation error",
  "type": "validation-error",
  "errors": [
    {
      "type": "field",
      "value": "bad",
      "msg": "Email must be a valid email address",
      "path": "email",
      "location": "body"
    }
  ]
}
```

Daftar `type` error: `validation-error`, `bad-request`, `unauthorized`, `forbidden`, `not-found`, `conflict-error`, `internal-server-error`.

---

## Pengujian

### Lewat Postman

Import file **`PawSphere.postman_collection.json`** (disertakan di repo) ke Postman.
Collection sudah berisi variabel `{{baseUrl}}` dan `{{token}}` — token otomatis
tersimpan setelah Anda menjalankan request **Login** (lewat script di tab _Tests_).

Urutan disarankan: `Health` → `Register` → `Login` → `Get Profile` → `Create Triage` → `Get Histories`.

### Lewat cURL

**Register:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Chandra Putra\",\"email\":\"chandra@pawsphere.id\",\"password\":\"secret123\"}"
```

**Login** (salin `token` dari response):

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"chandra@pawsphere.id\",\"password\":\"secret123\"}"
```

**AI Triage** (ganti `<TOKEN>`):

```bash
curl -X POST http://localhost:3000/api/ai-chat/triage \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d "{\"animal_type\":\"Kucing\",\"age\":\"2 tahun\",\"symptoms\":[\"muntah\",\"lemas\"],\"duration\":\"sejak pagi\"}"
```

Response akan memuat `urgency_level` (`green`/`yellow`/`red`), `first_aid_advice`,
`recommendation`, `source` (`stub` atau `gemini`), dan `disclaimer`.

---

## Arsitektur & Konvensi Kode

Setiap modul mengikuti alur berlapis yang sama (mirip repo latihan):

```
Route → (Validator → validate) → (authenticate) → Controller → Service → Prisma → MySQL
```

- **Validator** mendefinisikan aturan input; **`validate`** mengubah error menjadi envelope standar.
- **Controller** tipis: hanya mengambil input, memanggil service, dan mengembalikan response. Dibungkus `asyncHandler` agar error otomatis diteruskan.
- **Service** memuat logika bisnis dan satu-satunya lapisan yang menyentuh database. Melempar `ApiError` bertipe saat ada masalah.
- **`error-handler`** menangkap semua error (termasuk error Prisma seperti pelanggaran unique) dan mengubahnya menjadi response yang rapi.

Konvensi penamaan: request/response body memakai **`snake_case`** (`animal_type`, `phone_number`), sedangkan kode internal & Prisma memakai **`camelCase`** (`animalType`, `phoneNumber`). Pemetaan dilakukan di service/controller.

---

## Menambahkan Modul Baru

Skema database sudah memuat seluruh tabel (Shelter, Animal, VetProfile, Product, dst).
Untuk mengaktifkan modul berikutnya, cukup:

1. Buat `validators/<modul>.validator.js`
2. Buat `services/<modul>.service.js` (akses Prisma di sini)
3. Buat `controllers/<modul>.controller.js`
4. Buat `routes/<modul>.route.js`
5. Daftarkan di `routes/index.js`:
   ```js
   router.use("/vet-connect", vetConnectRoutes);
   ```

Tidak perlu migrasi struktur baru kecuali ada perubahan kolom.

---

## Troubleshooting

**`Error: P1001: Can't reach database server`**
MySQL belum berjalan, atau `DATABASE_URL` salah. Pastikan MySQL aktif dan kredensial benar.

**`Error: P1003: Database 'pawsphere' does not exist`**
Buat database dulu (lihat langkah 3 instalasi).

**`PrismaClientInitializationError ... did you forget prisma generate`**
Jalankan `npx prisma generate`.

**Token selalu 401**
Pastikan header berformat `Authorization: Bearer <token>` (ada spasi setelah `Bearer`), dan `JWT_SECRET` tidak berubah setelah token diterbitkan.

**AI selalu memakai stub padahal sudah isi API key**
Restart server setelah mengubah `.env`. Pastikan tidak ada spasi/kutip berlebih pada `GEMINI_API_KEY`.

**Ingin melihat isi database secara visual**
Jalankan `npx prisma studio` lalu buka `http://localhost:5555`.

---

_Dibuat oleh TIm PawSphere — Program Studi Informatika, Universitas Udayana._
