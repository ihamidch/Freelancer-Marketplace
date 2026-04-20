# Freelancer Marketplace (MERN)

Full-stack **job and freelance hiring** platform built with MERN: employers post roles, job seekers apply, save jobs, upload resumes, and track application status.

## What this project is (and is not)

| This repo **is** | This repo **is not** |
|------------------|----------------------|
| A job portal / freelance hiring app | An ecommerce store |
| Jobs, applications, resumes, employer & seeker dashboards | Products, cart, checkout, orders, inventory |
| Separate codebase in its own repository | Part of or mixed with any ecommerce project |

Keep this repository **only** for hiring and job workflows. Do not merge ecommerce features or shared storefront code here.

## Live demo

Official production URLs for **this repository only** (Vercel projects `freelancer-marketplace-web` + `freelancer-marketplace-api`, roots **`frontend`** / **`backend`**):

- **App (Frontend):** [https://frontend-kappa-amber-29.vercel.app](https://frontend-kappa-amber-29.vercel.app)
- **API (Backend):** [https://backend-pi-khaki-68.vercel.app](https://backend-pi-khaki-68.vercel.app)
- **Repository:** [https://github.com/ihamidch/Freelancer-Marketplace](https://github.com/ihamidch/Freelancer-Marketplace)

The frontend build uses `VITE_API_URL` set to the backend URL above. Details: `DEPLOYMENT.md`.

**Do not reuse these URLs in other repos** (for example ecommerce). Each app needs its own Vercel projects and URLs.

## Features

- Authentication with JWT
- Role-based access (`employer`, `job_seeker`)
- Employers can:
  - Post jobs
  - View applicants
  - Update application status
- Job seekers can:
  - Browse and search jobs
  - Save jobs
  - Apply with cover letter
  - Upload resume
  - Track application status
- Email notifications via Nodemailer

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, Mongoose, JWT, Multer, Nodemailer
- Database: MongoDB Atlas
- Deployment: Vercel (frontend + backend)

## Repository Layout

```
Freelancer Marketplace/
├── frontend/          # React + Vite client
├── backend/           # Express + MongoDB API
├── DEPLOYMENT.md      # Vercel + Atlas deployment steps
└── package.json       # Monorepo scripts
```

## API Overview

Base path: `/api`

- Auth
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
- Jobs
  - `GET /jobs`
  - `GET /jobs/:id`
  - `POST /jobs` (employer)
  - `GET /jobs/dashboard/employer` (employer)
  - `PUT /jobs/:id/save` (job_seeker)
- Applications
  - `POST /applications/:jobId` (job_seeker)
  - `GET /applications/me` (job_seeker)
  - `GET /applications/employer/applicants` (employer)
  - `PUT /applications/:applicationId/status` (employer)
  - `POST /applications/resume/upload` (job_seeker)

## Environment Variables

### Backend (`backend/.env`)

- `PORT=5000`
- `MONGO_URI=<mongodb atlas uri>`
- `JWT_SECRET=<strong random secret>`
- `SMTP_HOST=<optional>`
- `SMTP_PORT=<optional>`
- `SMTP_USER=<optional>`
- `SMTP_PASS=<optional>`
- `SMTP_FROM=<optional>`

### Frontend (`frontend/.env`)

- `VITE_API_URL=http://localhost:5000` (or deployed backend URL)

## Local Development

Install and run both apps:

```bash
npm install
npm run dev
```

Useful scripts:

- `npm run dev:backend`
- `npm run dev:frontend`
- `npm run lint`
- `npm run build`

## Deployment

Quick deploy summary:

1. Deploy `backend` on Vercel (root directory: `backend`)
2. Add backend envs (`MONGO_URI`, `JWT_SECRET`, optional SMTP)
3. Deploy `frontend` on Vercel (root directory: `frontend`)
4. Add `VITE_API_URL=<backend-url>`
5. Redeploy frontend

Detailed steps are in `DEPLOYMENT.md`.

## Notes

- Resume uploads are local filesystem-based in development.
- For production-grade persistence, use cloud storage (S3/Cloudinary).
