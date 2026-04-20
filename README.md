# MERN Job Portal / Freelance Marketplace

Role-based freelance marketplace built with the MERN stack, organized as a simple monorepo (`frontend` + `backend`).

## Live Demo

- Frontend: `https://frontend-kappa-amber-29.vercel.app`
- Backend API: `https://backend-pi-khaki-68.vercel.app`
- GitHub: `https://github.com/ihamidch/Freelancer-Marketplace`

## Tech Stack

- Frontend: React + Vite + React Router + Axios
- Backend: Node.js + Express + JWT auth + Multer + Nodemailer
- Database: MongoDB Atlas (Mongoose)
- Deployment targets:
  - Frontend: Vercel
  - Backend: Vercel (serverless function)
  - Database: MongoDB Atlas

## Project Structure

```
Freelancer Marketplace/
  frontend/       # React UI (Vite)
  backend/        # Express REST API
  package.json    # Monorepo scripts
  DEPLOYMENT.md   # Exact Vercel + Atlas setup steps
```

## Core Features

- Role-based users (`employer`, `job_seeker`)
- Authentication with JWT
- Employers:
  - Post jobs
  - View applicants
  - Update application status
- Job Seekers:
  - Browse jobs
  - Search/filter jobs
  - Apply to jobs
  - Upload resume
  - Save jobs
  - Track application status
- Email notifications for:
  - New application submitted to employer
  - Application status updates sent to job seeker

## Backend API Overview

Base URL: `/api`

- Auth
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
- Jobs
  - `GET /jobs` (supports `search`, `location`, `skill`, `minBudget`)
  - `GET /jobs/:id`
  - `POST /jobs` (employer only)
  - `GET /jobs/dashboard/employer` (employer only)
  - `PUT /jobs/:id/save` (job seeker only)
- Applications
  - `POST /applications/:jobId` (job seeker only)
  - `GET /applications/me` (job seeker only)
  - `GET /applications/employer/applicants` (employer only)
  - `PUT /applications/:applicationId/status` (employer only)
  - `POST /applications/resume/upload` (job seeker only)

## Monorepo Scripts (Root)

```bash
npm install
npm run dev           # starts backend + frontend together
npm run lint          # frontend lint
npm run build         # frontend build
```

If you prefer running services independently:

- `npm run dev:backend`
- `npm run dev:frontend`

## Local Setup (Per App)

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Required `backend/.env` variables:

- `MONGO_URI`
- `JWT_SECRET`
- Optional SMTP values for email notifications

### 2) Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend env:

- `VITE_API_URL` (default: `http://localhost:5000`)

## Deployment

Use the complete guide in `DEPLOYMENT.md` for:

- exact Vercel project settings (root directory, build/output commands)
- backend + frontend env variable checklists
- Atlas setup and verification checklist
- production caveat for resume storage persistence

Quick summary:

1. Deploy `backend` on Vercel (`Root Directory = backend`)
2. Configure backend env vars (`MONGO_URI`, `JWT_SECRET`, SMTP optional)
3. Deploy `frontend` on Vercel (`Root Directory = frontend`)
4. Set `VITE_API_URL` to your backend URL
5. Verify both role workflows end-to-end

## GitHub + Live Demo Deliverable

1. Create a new GitHub repository
2. Push this project:
   - `git init`
   - `git add .`
   - `git commit -m "Initial MERN freelance marketplace"`
   - `git branch -M main`
   - `git remote add origin <your-github-repo-url>`
   - `git push -u origin main`
3. Deploy both apps on Vercel using the same GitHub repo with different root directories
4. Share:
   - Frontend URL (live demo)
   - Backend URL
   - GitHub repository URL

## Notes

- Resume uploads are stored in `backend/uploads` in local development.
- For production, prefer cloud storage (S3/Cloudinary) for persistent file handling.
