# NotesMonitor — Notes Distribution System

A full-stack web application for distributing educational notes to students. Admins upload materials to date-organized folders and assign them to student groups. Students view and download their assigned materials.

## Tech Stack

| Layer      | Technology                                         |
|------------|----------------------------------------------------|
| Frontend   | React 18 + TypeScript + Vite + Tailwind CSS        |
| State      | TanStack Query v5 + React Context                  |
| Routing    | React Router v6                                    |
| Backend    | Node.js + Express + TypeScript                     |
| Database   | MongoDB + Mongoose                                 |
| Auth       | JWT + bcrypt                                       |
| Uploads    | Multer (local storage, organized by folder ID)     |
| Validation | Zod (backend) + HTML5 (frontend)                   |
| Logging    | Winston                                            |
| Downloads  | Archiver (ZIP streaming)                           |

---

## Project Structure

```
NotesMonitor/
├── backend/          Express API
│   └── src/
│       ├── config/         database.ts, logger.ts
│       ├── models/         User, Group, Folder, Download
│       ├── schemas/        Zod validation schemas
│       ├── utils/          jwt, response, seed, asyncHandler
│       ├── middleware/      auth, upload, validate
│       ├── controllers/    auth, admin, student
│       ├── routes/         auth, admin, student
│       ├── app.ts          Express app setup
│       └── server.ts       Entry point
└── frontend/         React SPA
    └── src/
        ├── api/            axios client + API modules
        ├── contexts/       AuthContext
        ├── hooks/          useToast
        ├── components/
        │   ├── ui/         Button, Input, Modal, Badge, Spinner
        │   ├── layout/     AdminLayout, StudentLayout
        │   └── shared/     ProtectedRoute, FilePreview
        └── pages/
            ├── auth/       AdminLogin, StudentAuth
            ├── admin/      Dashboard, Students, Groups, Folders, Reports
            └── student/    Dashboard, FolderView, Profile
```

---

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

---

## Setup Instructions

### 1. Clone and install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure environment variables

**Backend** — create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/notes-monitor
JWT_SECRET=change-this-to-a-long-random-secret
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@notesmonitor.com
ADMIN_PASSWORD=Admin@123
ADMIN_MOBILE=9000000000
CLIENT_URL=http://localhost:5173
```

**Frontend** — create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 3. Start MongoDB

```bash
# Local MongoDB (if installed)
mongod

# Or use MongoDB Atlas — update MONGODB_URI accordingly
```

### 4. Run the application

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## Default Credentials

On first run, the backend automatically creates an admin account:

| Role  | Login field | Value                     |
|-------|-------------|---------------------------|
| Admin | Email       | admin@notesmonitor.com    |
| Admin | Password    | Admin@123                 |

> **Change the admin password** immediately by updating `ADMIN_PASSWORD` in `backend/.env` and deleting the `users` collection to trigger re-seeding, or update directly in MongoDB.

---

## Features

### Admin
- **Dashboard** — stats overview, recent downloads, top folders
- **Students** — search/filter students, approve or reject registrations
- **Groups** — create groups, manage student assignments
- **Folders** — create date-labeled folders, drag-and-drop file upload (images + videos), file thumbnail preview, assign to multiple groups, download as ZIP
- **Reports** — download statistics, students per group, recent activity

### Student
- **Registration** — mobile number as primary identifier
- **Dashboard** — see only folders from assigned groups, organized by date
- **Folder view** — image grid, video list, click to preview full-screen
- **Downloads** — individual file or entire folder as ZIP (all tracked)
- **Profile** — personal info and assigned groups

---

## API Endpoints

### Auth
```
POST /api/auth/admin/login
POST /api/auth/student/register
POST /api/auth/student/login
GET  /api/auth/me
```

### Admin (requires admin JWT)
```
GET    /api/admin/students
PATCH  /api/admin/students/:id/status
GET    /api/admin/groups
POST   /api/admin/groups
PUT    /api/admin/groups/:id
DELETE /api/admin/groups/:id
POST   /api/admin/groups/:id/students
DELETE /api/admin/groups/:id/students/:studentId
GET    /api/admin/folders
POST   /api/admin/folders
PUT    /api/admin/folders/:id
DELETE /api/admin/folders/:id
POST   /api/admin/folders/:folderId/upload
DELETE /api/admin/folders/:folderId/files/:fileId
POST   /api/admin/folders/:folderId/assign
GET    /api/admin/reports
GET    /api/admin/files/:folderId/:filename
GET    /api/admin/folders/:folderId/download-zip
```

### Student (requires student JWT)
```
GET  /api/student/folders
GET  /api/student/folders/:folderId
POST /api/student/folders/:folderId/track-download
GET  /api/student/files/:folderId/:filename
GET  /api/student/folders/:folderId/download-zip
GET  /api/student/profile
```

---

## File Upload Rules

- **Accepted types:** JPG, PNG, WEBP, MP4, MOV
- **Max file size:** 100 MB per file
- **Max files per upload:** 20
- **Storage:** `backend/uploads/{folderId}/{unique-filename}`
- Files are served through authenticated API endpoints

---

## Production Deployment Notes

1. Set `NODE_ENV=production` and use a strong `JWT_SECRET`
2. Use MongoDB Atlas for hosted database
3. Consider Cloudinary or S3 for file storage instead of local disk
4. Build the frontend: `cd frontend && npm run build`
5. Serve the frontend `dist/` folder via Nginx or a CDN
6. Use PM2 or similar for the backend process
7. Set up HTTPS

---

## Development Scripts

```bash
# Backend
npm run dev      # Start with hot reload (ts-node-dev)
npm run build    # Compile TypeScript to dist/
npm run start    # Run compiled output

# Frontend
npm run dev      # Vite dev server with HMR
npm run build    # Production build
npm run preview  # Preview production build locally
```
