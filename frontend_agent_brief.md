# Aliman LMS — Frontend Integration Brief
> **Untuk:** Frontend Agent  
> **Backend:** Laravel 11 REST API · PHP 8.2  
> **Status:** Skema DB & Routes selesai. Controllers sedang dalam pengerjaan.  
> **Docs API (live):** `GET /docs/api` — OpenAPI 3 via Scramble (auto-generated)

---

## 1. Base URL & Versi

```
Base URL  : https://api.aliman.sch.id/api/v1
Local Dev : http://localhost:8000/api/v1
```

Semua endpoint berawalan `/api/v1/`. Jangan skip prefix-nya.

---

## 2. Authentication — Sanctum Bearer Token

Backend menggunakan **Laravel Sanctum Bearer Tokens** (bukan cookie session).  
Frontend adalah SPA yang di-host di origin terpisah (Vercel / Netlify / subdomain lain).

### Login Flow

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@aliman.sch.id",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "1|abcdef...",
  "token_type": "Bearer",
  "expires_at": "2026-10-10T02:25:00Z",
  "user": {
    "id": 1,
    "name": "Husnu",
    "email": "husnu@aliman.sch.id",
    "avatar_url": null,
    "is_super_admin": false
  },
  "schools": [
    {
      "school": { "id": 1, "name": "SMA Al-Iman", "code": "SMA" },
      "roles": ["Teacher"]
    },
    {
      "school": { "id": 2, "name": "SMP Al-Iman", "code": "SMP" },
      "roles": ["School Admin"]
    }
  ]
}
```

### Menyimpan & Menggunakan Token

```js
// Simpan ke localStorage / secure httpOnly cookie terserah implementasi FE
localStorage.setItem('token', data.token);
localStorage.setItem('active_school_id', selectedSchoolId);

// Setiap request wajib pakai header:
headers: {
  'Authorization': `Bearer ${token}`,
  'X-School-Id':   activeSchoolId,   // ← WAJIB untuk semua endpoint tenant-scoped
  'Accept':        'application/json',
  'Content-Type':  'application/json',
}
```

### Token Lifecycle

| Endpoint | Method | Keterangan |
|---|---|---|
| `/auth/login` | POST | Dapat token baru |
| `/auth/me` | GET | Profile user + daftar sekolah |
| `/auth/refresh` | POST | Rotasi token (perpanjang sesi) |
| `/auth/switch-school` | POST | Ganti sekolah aktif, dapat token baru |
| `/auth/logout` | POST | Revoke token saat ini |
| `/auth/logout-all` | POST | Revoke semua device |
| `/auth/profile` | PATCH | Update nama, avatar |
| `/auth/password` | PATCH | Ganti password |

**Token expiry: 24 jam** (`SANCTUM_TOKEN_EXPIRATION=1440`). Implementasi auto-refresh direkomendasikan.

---

## 3. Multi-Tenancy — Header `X-School-Id`

> ⚠️ **Ini yang paling penting untuk dipahami.**

Backend adalah **multi-tenant** — satu database untuk semua sekolah (SD, SMP, SMA Al-Iman). Setiap request ke endpoint operasional **wajib menyertakan** header:

```
X-School-Id: 1
```

Middleware `SetActiveSchool` di backend akan:
1. Membaca `X-School-Id`
2. Memverifikasi user punya akses ke sekolah tersebut
3. Meng-inject `school_id` ke semua query secara otomatis

**Respon backend menyertakan header:**
```
X-Active-School-Id: 1
```

Gunakan ini untuk konfirmasi sekolah yang sedang aktif di sisi FE.

### Switch School

```http
POST /api/v1/auth/switch-school
{
  "school_id": 2
}
```

---

## 4. CORS

Backend sudah dikonfigurasi untuk menerima request dari:
- `http://localhost:3000` (CRA / Next.js dev)
- `http://localhost:5173` (Vite dev)
- `https://app.aliman.sch.id` (production)

**Allowed headers dari FE:**
- `Authorization`, `Content-Type`, `Accept`, `X-School-Id`, `X-Requested-With`

**Exposed headers dari BE:**
- `X-Active-School-Id`, `Content-Disposition`

---

## 5. Response Format

Semua response JSON. Konvensi yang akan diikuti backend:

### Success (Collection)
```json
{
  "data": [ { ... }, { ... } ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 120,
    "last_page": 8
  },
  "links": {
    "prev": null,
    "next": "/api/v1/courses?page=2"
  }
}
```

### Success (Single Resource)
```json
{
  "data": { "id": 1, "name": "Matematika", ... }
}
```

### Error
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### HTTP Status Codes
| Code | Arti |
|---|---|
| `200` | OK |
| `201` | Created |
| `204` | No Content (delete berhasil) |
| `400` | Bad Request |
| `401` | Unauthenticated (token invalid/expired) |
| `403` | Forbidden (tidak punya role/permission) |
| `404` | Not Found |
| `422` | Validation Error |
| `429` | Too Many Requests |
| `500` | Server Error |

---

## 6. Timestamp & Timezone

- Semua timestamp disimpan **UTC** di database.
- API mengembalikan format **ISO 8601**: `"2026-10-09T02:25:00Z"`
- Aplikasi berjalan di timezone **Asia/Jakarta (WIB, UTC+7)**
- **Frontend bertanggung jawab** untuk konversi display ke timezone lokal user.

```js
// Contoh konversi di FE
const localTime = new Date("2026-10-09T02:25:00Z")
  .toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
```

---

## 7. Roles & Permissions

Setiap user bisa punya **role berbeda di setiap sekolah**. Role dikelola via Spatie Permission dengan `team_id = school_id`.

### Daftar Role

| Role | Deskripsi |
|---|---|
| `Super Admin` | Akses lintas semua sekolah. `is_super_admin = true` di tabel users. |
| `School Admin` | Admin untuk satu sekolah. Bisa CRUD semua data sekolah. |
| `Teacher` | Guru. Bisa kelola course, assignment, quiz, nilai, absensi miliknya. |
| `Student` | Siswa. Read-only pada course yang di-enroll, submit tugas & quiz. |

### Tips Implementasi FE

- Cek `user.is_super_admin` untuk tampilkan menu platform.
- Cek `roles` dari response `/auth/me` untuk tampilkan menu per sekolah.
- Backend juga enforce di level Policy — FE cukup untuk UX, bukan security.

---

## 8. Semua Endpoint API

### 8.1 Authentication

```
POST   /auth/login
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/me                   🔒
POST   /auth/logout               🔒
POST   /auth/logout-all           🔒
POST   /auth/refresh              🔒
POST   /auth/switch-school        🔒
PATCH  /auth/profile              🔒
PATCH  /auth/password             🔒
```

### 8.2 Notifications

```
GET    /notifications             🔒
POST   /notifications/read-all   🔒
PATCH  /notifications/{id}/read  🔒
```

### 8.3 Platform (Super Admin only)

```
GET    /platform/schools          🔒🏫
POST   /platform/schools          🔒🏫
GET    /platform/schools/{id}     🔒🏫
PATCH  /platform/schools/{id}     🔒🏫
DELETE /platform/schools/{id}     🔒🏫
GET    /platform/users            🔒🏫
GET    /platform/audit-logs       🔒🏫
```

### 8.4 Users & Staff

```
GET    /users                     🔒🏫
POST   /users                     🔒🏫
GET    /users/{user}              🔒🏫
PATCH  /users/{user}              🔒🏫
DELETE /users/{user}              🔒🏫
POST   /users/{user}/restore      🔒🏫
POST   /users/{user}/roles        🔒🏫  body: { role: "Teacher" }
DELETE /users/{user}/roles/{role} 🔒🏫
POST   /users/{user}/activate     🔒🏫
POST   /users/{user}/deactivate   🔒🏫
```

### 8.5 Students

```
GET    /students                              🔒🏫
POST   /students                              🔒🏫
GET    /students/{student}                    🔒🏫
PATCH  /students/{student}                    🔒🏫
DELETE /students/{student}                    🔒🏫
GET    /students/{student}/guardians          🔒🏫
POST   /students/{student}/guardians          🔒🏫
PATCH  /students/{student}/guardians/{g}      🔒🏫
DELETE /students/{student}/guardians/{g}      🔒🏫
```

### 8.6 Guardians

```
GET    /guardians               🔒🏫
POST   /guardians               🔒🏫
GET    /guardians/{guardian}    🔒🏫
PATCH  /guardians/{guardian}    🔒🏫
DELETE /guardians/{guardian}    🔒🏫
```

### 8.7 Academic Structure

```
# Academic Years
GET    /academic-years                                🔒🏫
POST   /academic-years                                🔒🏫
GET    /academic-years/{ay}                           🔒🏫
PATCH  /academic-years/{ay}                           🔒🏫
DELETE /academic-years/{ay}                           🔒🏫
POST   /academic-years/{ay}/activate                  🔒🏫

# Terms (Semesters) — nested
GET    /academic-years/{ay}/terms                     🔒🏫
POST   /academic-years/{ay}/terms                     🔒🏫
GET    /academic-years/{ay}/terms/{term}              🔒🏫
PATCH  /academic-years/{ay}/terms/{term}              🔒🏫
DELETE /academic-years/{ay}/terms/{term}              🔒🏫
POST   /academic-years/{ay}/terms/{term}/activate     🔒🏫

# Departments (Jurusan)
GET|POST|GET|PATCH|DELETE  /departments[/{id}]        🔒🏫

# Grade Levels (Tingkat Kelas)
GET|POST|GET|PATCH|DELETE  /grade-levels[/{id}]       🔒🏫

# Subjects (Mata Pelajaran)
GET|POST|GET|PATCH|DELETE  /subjects[/{id}]           🔒🏫
```

### 8.8 Classes (Rombel)

```
GET    /classes                              🔒🏫
POST   /classes                              🔒🏫
GET    /classes/{class}                      🔒🏫
PATCH  /classes/{class}                      🔒🏫
DELETE /classes/{class}                      🔒🏫

# Roster siswa
GET    /classes/{class}/students             🔒🏫
POST   /classes/{class}/students             🔒🏫
PATCH  /classes/{class}/students/{student}   🔒🏫
DELETE /classes/{class}/students/{student}   🔒🏫

# Pengampu guru
GET    /classes/{class}/teachers             🔒🏫
POST   /classes/{class}/teachers             🔒🏫
DELETE /classes/{class}/teachers/{assignment}🔒🏫
```

### 8.9 File Upload (R2 Presigned Flow)

```
POST   /files/upload-request       🔒🏫  ← Step 1
POST   /files/{file}/confirm       🔒🏫  ← Step 3
GET    /files/{file}               🔒🏫
DELETE /files/{file}               🔒🏫
GET    /files/{file}/download      🔒🏫  ← Generate presigned GET URL
```

Lihat **Bagian 9** untuk penjelasan lengkap flow upload.

### 8.10 Courses

```
GET    /courses                                                     🔒🏫
POST   /courses                                                     🔒🏫
GET    /courses/{course}                                            🔒🏫
PATCH  /courses/{course}                                            🔒🏫
DELETE /courses/{course}                                            🔒🏫
PATCH  /courses/{course}/publish                                    🔒🏫
PATCH  /courses/{course}/archive                                    🔒🏫

# Enrollments
GET    /courses/{course}/enrollments                                🔒🏫
POST   /courses/{course}/enrollments                                🔒🏫
PATCH  /courses/{course}/enrollments/{enrollment}                   🔒🏫
DELETE /courses/{course}/enrollments/{enrollment}                   🔒🏫
POST   /courses/{course}/enrollments/sync-class                     🔒🏫

# Sections (Modul / Minggu)
GET    /courses/{course}/sections                                   🔒🏫
POST   /courses/{course}/sections                                   🔒🏫
GET    /courses/{course}/sections/{section}                         🔒🏫
PATCH  /courses/{course}/sections/{section}                         🔒🏫
DELETE /courses/{course}/sections/{section}                         🔒🏫
PATCH  /courses/{course}/sections/reorder                           🔒🏫

# Materials
GET    /courses/{course}/sections/{section}/materials               🔒🏫
POST   /courses/{course}/sections/{section}/materials               🔒🏫
GET    /courses/{course}/sections/{section}/materials/{material}    🔒🏫
PATCH  /courses/{course}/sections/{section}/materials/{material}    🔒🏫
DELETE /courses/{course}/sections/{section}/materials/{material}    🔒🏫
PATCH  /courses/{course}/sections/{section}/materials/reorder       🔒🏫
```

### 8.11 Assignments & Submissions

```
GET    /courses/{course}/assignments                                       🔒🏫
POST   /courses/{course}/assignments                                       🔒🏫
GET    /courses/{course}/assignments/{assignment}                           🔒🏫
PATCH  /courses/{course}/assignments/{assignment}                           🔒🏫
DELETE /courses/{course}/assignments/{assignment}                           🔒🏫

# Submissions (Teacher = semua, Student = milik sendiri)
GET    /courses/{course}/assignments/{assignment}/submissions               🔒🏫
POST   /courses/{course}/assignments/{assignment}/submissions               🔒🏫
GET    /courses/{course}/assignments/{assignment}/submissions/{sub}         🔒🏫
PATCH  /courses/{course}/assignments/{assignment}/submissions/{sub}/grade   🔒🏫
PATCH  /courses/{course}/assignments/{assignment}/submissions/{sub}/return  🔒🏫
```

### 8.12 Gradebook

```
# Categories
GET    /courses/{course}/gradebook/categories                           🔒🏫
POST   /courses/{course}/gradebook/categories                           🔒🏫
PATCH  /courses/{course}/gradebook/categories/{category}                🔒🏫
DELETE /courses/{course}/gradebook/categories/{category}                🔒🏫

# Grade Items (kolom nilai)
GET    /courses/{course}/gradebook/items                                🔒🏫
POST   /courses/{course}/gradebook/items                                🔒🏫
PATCH  /courses/{course}/gradebook/items/{item}                         🔒🏫
DELETE /courses/{course}/gradebook/items/{item}                         🔒🏫

# Scores per item
GET    /courses/{course}/gradebook/items/{item}/grades                  🔒🏫
PUT    /courses/{course}/gradebook/items/{item}/grades                  🔒🏫  ← Bulk upsert
PATCH  /courses/{course}/gradebook/items/{item}/grades/{student}        🔒🏫

# Summary Reports
GET    /courses/{course}/gradebook/summary                              🔒🏫
GET    /courses/{course}/gradebook/student/{student}                    🔒🏫
```

### 8.13 Quizzes

```
GET    /courses/{course}/quizzes                                 🔒🏫
POST   /courses/{course}/quizzes                                 🔒🏫
GET    /courses/{course}/quizzes/{quiz}                          🔒🏫
PATCH  /courses/{course}/quizzes/{quiz}                          🔒🏫
DELETE /courses/{course}/quizzes/{quiz}                          🔒🏫
POST   /courses/{course}/quizzes/{quiz}/publish                  🔒🏫

# Question pool
GET    /courses/{course}/quizzes/{quiz}/questions                🔒🏫
POST   /courses/{course}/quizzes/{quiz}/questions                🔒🏫
DELETE /courses/{course}/quizzes/{quiz}/questions/{question}     🔒🏫
PATCH  /courses/{course}/quizzes/{quiz}/questions/reorder        🔒🏫

# Teacher views
GET    /courses/{course}/quizzes/{quiz}/attempts                 🔒🏫
GET    /courses/{course}/quizzes/{quiz}/results                  🔒🏫
```

### 8.14 Quiz Attempts (Student Exam Session)

```
POST   /quizzes/attempts                        🔒🏫  ← Start, snapshots question set
GET    /quizzes/attempts/{attempt}              🔒🏫  ← Fetch soal (tanpa jawaban benar)
PUT    /quizzes/attempts/{attempt}/autosave     🔒🏫  ← Periodic save draft
POST   /quizzes/attempts/{attempt}/submit       🔒🏫  ← Finalize & auto-grade

# Essay grading
PATCH  /quizzes/answers/{answer}/grade          🔒🏫
```

### 8.15 Question Banks

```
GET    /question-banks                                              🔒🏫
POST   /question-banks                                             🔒🏫
GET    /question-banks/{bank}                                      🔒🏫
PATCH  /question-banks/{bank}                                      🔒🏫
DELETE /question-banks/{bank}                                      🔒🏫

GET    /question-banks/{bank}/questions                            🔒🏫
POST   /question-banks/{bank}/questions                            🔒🏫
GET    /question-banks/{bank}/questions/{question}                 🔒🏫
PATCH  /question-banks/{bank}/questions/{question}                 🔒🏫
DELETE /question-banks/{bank}/questions/{question}                 🔒🏫

GET    /question-banks/{bank}/questions/{question}/options         🔒🏫
PUT    /question-banks/{bank}/questions/{question}/options         🔒🏫  ← Atomic replace
```

### 8.16 Attendance

```
GET    /attendance                    🔒🏫  ?class_id=&course_id=&date=&student_id=
POST   /attendance                    🔒🏫  ← Bulk submit satu sesi
PATCH  /attendance/{attendance}       🔒🏫  ← Koreksi satu record
DELETE /attendance/{attendance}       🔒🏫
GET    /attendance/summary            🔒🏫
GET    /attendance/student/{student}  🔒🏫
```

### 8.17 Announcements

```
GET    /announcements                  🔒🏫
POST   /announcements                  🔒🏫
GET    /announcements/{id}             🔒🏫
PATCH  /announcements/{id}             🔒🏫
DELETE /announcements/{id}             🔒🏫
POST   /announcements/{id}/pin         🔒🏫
POST   /announcements/{id}/unpin       🔒🏫
```

### 8.18 Audit Logs & Imports

```
GET    /audit-logs                    🔒🏫
POST   /imports/students              🔒🏫  ← CSV upload, diproses async
POST   /imports/teachers              🔒🏫
POST   /imports/subjects              🔒🏫
GET    /imports/{batchId}/status      🔒🏫  ← Poll status job
```

> **Legend:** 🔒 = Butuh Bearer Token · 🏫 = Butuh `X-School-Id` header

---

## 9. File Upload Flow (Cloudflare R2)

Upload file **tidak** melalui backend PHP (untuk menghindari limit `upload_max_filesize` shared hosting). Flow-nya:

```
FE                          Backend                     Cloudflare R2
│                              │                              │
│  POST /files/upload-request  │                              │
│  { file_name, mime_type,     │                              │
│    file_size }               │                              │
│ ─────────────────────────── ▶│                              │
│                              │  Validasi mime & ukuran      │
│                              │  Buat record 'pending'       │
│                              │  Generate presigned PUT URL  │
│◀──────────────────────────── │                              │
│  { file_id, upload_url }     │                              │
│                              │                              │
│  PUT {upload_url}            │                              │
│  (binary file stream)        │                              │
│ ─────────────────────────────────────────────────────────▶ │
│                              │              Upload complete  │
│◀───────────────────────────────────────────────────────── │
│  HTTP 200                    │                              │
│                              │                              │
│  POST /files/{file_id}/confirm│                             │
│ ─────────────────────────── ▶│                              │
│                              │  Verifikasi objek R2 exist   │
│                              │  Set status = 'confirmed'    │
│◀──────────────────────────── │                              │
│  { file: { id, url, ... } }  │                              │
```

### Contoh Implementasi JS

```js
// Step 1: Request presigned URL
const { data } = await api.post('/files/upload-request', {
  file_name: file.name,
  mime_type: file.type,
  file_size: file.size,
});

const { file_id, upload_url } = data;

// Step 2: Upload langsung ke R2 (tanpa auth header!)
await fetch(upload_url, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type },
});

// Step 3: Konfirmasi ke backend
await api.post(`/files/${file_id}/confirm`);

// Gunakan file_id untuk attach ke course material, assignment, dll.
```

### Mendapatkan URL Download

```http
GET /api/v1/files/{file_id}/download
```

Backend mengembalikan presigned GET URL dengan TTL pendek (misal 15 menit). Jangan simpan URL ini — selalu minta ulang saat butuh.

---

## 10. Enum Values (Penting untuk Form & Filter)

### Course Status
```
draft | published | archived
```

### Assignment Submission Type
```
online_upload | online_text | both | offline
```

### Assignment Submission Status
```
submitted | graded | resubmission_required
```

### Quiz Grading Method
```
highest_score | average_score | first_attempt | last_attempt
```

### Quiz Attempt Status
```
in_progress | submitted | timed_out | graded
```

### Question Type
```
multiple_choice | multiple_response | true_false | short_answer | essay
```

### Attendance Status
```
present | late | excused | unexcused_absent | sick
```

### Announcement Target Type
```
school_wide | grade_level | class | course
```

### Course Enrollment Role
```
student | teacher_assistant | auditor
```

### Course Enrollment Status
```
active | dropped | completed
```

### Class Student Status
```
active | transferred | graduated | dropped
```

### Student Profile Status
```
active | graduated | transferred_out | dropped_out
```

### File Upload Status
```
pending_upload | confirmed | failed | deleted
```

### Guardian Relationship
```
father | mother | guardian
```

### Course Material Type
```
document | video_link | rich_text | external_url
```

---

## 11. Data Shape Utama

### User
```json
{
  "id": 1,
  "name": "Husnu Ahmad",
  "email": "husnu@aliman.sch.id",
  "phone": "08123456789",
  "avatar_url": "https://storage.aliman.sch.id/avatars/1.jpg",
  "is_active": true,
  "is_super_admin": false,
  "last_login_at": "2026-10-09T02:25:00Z"
}
```

### School
```json
{
  "id": 1,
  "name": "SMA Al-Iman",
  "code": "SMA",
  "npsn": "12345678",
  "logo_path": "schools/1/logo.png",
  "is_active": true,
  "settings": { ... }
}
```

### Course
```json
{
  "id": 10,
  "code": "CRS-2026-X-MTK-01",
  "name": "Matematika Wajib Kelas X",
  "status": "published",
  "academic_year_id": 1,
  "term_id": 1,
  "subject_id": 5,
  "class_id": 3,
  "teacher_id": 7,
  "cover_file_id": null,
  "description": "...",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-10-09T00:00:00Z"
}
```

### Quiz Attempt (saat start)
```json
{
  "id": 42,
  "quiz_id": 5,
  "student_id": 99,
  "attempt_number": 1,
  "status": "in_progress",
  "started_at": "2026-10-09T02:30:00Z",
  "question_snapshots": [
    {
      "question_id": 101,
      "content": "Berapakah hasil dari 2+2?",
      "type": "multiple_choice",
      "points": 10,
      "options": [
        { "id": 1, "text": "3" },
        { "id": 2, "text": "4" },
        { "id": 3, "text": "5" }
      ]
    }
  ]
}
```

> ⚠️ `is_correct` tidak pernah dikirim ke student. Hanya dikirim setelah `show_correct_answers = true` dan quiz sudah selesai.

---

## 12. Pagination & Filtering

Semua endpoint list mendukung query params:

```
?page=1
?per_page=15         (default 15, max biasanya 100)
?search=keyword      (full-text search, kalau didukung)
?sort=created_at     (kolom sort)
?order=desc          (asc / desc)
```

Contoh filter spesifik:
```
GET /attendance?class_id=3&date=2026-10-09
GET /courses?status=published&term_id=1
GET /students?status=active
```

---

## 13. Bulk CSV Import (Async)

Import dilakukan secara **async** via queue (bukan real-time). Pollingnya:

```js
// 1. Upload CSV
const { data } = await api.post('/imports/students', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
const { batch_id } = data;

// 2. Poll status setiap 3 detik
const poll = setInterval(async () => {
  const { data: status } = await api.get(`/imports/${batch_id}/status`);
  if (status.finished) {
    clearInterval(poll);
    // Tampilkan hasil: berhasil, gagal, duplikat
  }
}, 3000);
```

---

## 14. Rekomendasi Arsitektur FE

### State Management
- Simpan `token` + `active_school_id` + `user` di global store (Zustand / Pinia / Redux)
- Simpan daftar `schools` dari `/auth/me` untuk school-switcher

### HTTP Client
- Gunakan **Axios** dengan interceptor untuk inject header otomatis:
```js
axios.interceptors.request.use(config => {
  config.headers['Authorization'] = `Bearer ${store.token}`;
  config.headers['X-School-Id']   = store.activeSchoolId;
  return config;
});

// Handle 401 → redirect ke login
axios.interceptors.response.use(null, error => {
  if (error.response?.status === 401) router.push('/login');
  return Promise.reject(error);
});
```

### Route Guards
- Route `/platform/*` → cek `user.is_super_admin`
- Route `/admin/*` → cek role `School Admin`
- Route `/teacher/*` → cek role `Teacher`
- Route `/student/*` → cek role `Student`

---

## 15. Catatan Penting

1. **Jangan hardcode `school_id`** di component — selalu ambil dari store.
2. **File URL dari R2 bersifat presigned** (expire) — jangan cache URL-nya, selalu hit `/files/{id}/download`.
3. **Quiz question snapshots** adalah sumber kebenaran soal, bukan endpoint question bank langsung.
4. **Attendance bisa bulk** — satu `POST /attendance` bisa submit semua siswa sekaligus.
5. **Gradebook bulk upsert** via `PUT` — cocok untuk spreadsheet-like grade entry.
6. Backend masih dalam pengerjaan (controllers belum selesai). Gunakan **`GET /docs/api`** untuk spec terbaru yang selalu up-to-date.

---

*Brief ini dibuat berdasarkan skema database, routes, dan architecture docs dari repo `aliman-lmv-v1`. Update seiring progress backend.*
