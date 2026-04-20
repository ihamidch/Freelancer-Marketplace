# Deployment Guide (Vercel + Atlas)

This project deploys as **two separate Vercel projects** from **this repository only**:

- `frontend` (React client) — root directory **`frontend`**
- `backend` (Express API) — root directory **`backend`**

**Do not** attach this GitHub repo to an existing Vercel project that was created for ecommerce or another app. If an old URL shows the wrong site, create **new** Vercel projects (or remove the wrong Git connection and redeploy) so each URL serves only the job portal and API from this repo.

## 1) MongoDB Atlas setup

1. Create an Atlas cluster.
2. Create a DB user with read/write permissions.
3. In Network Access, allow Vercel IPs (or `0.0.0.0/0` for quick start).
4. Copy connection URI and place it in backend `MONGO_URI`.

## 2) Backend deployment (Vercel)

Create a new Vercel project from this repository with:

- **Root Directory:** `backend`
- **Framework Preset:** Other
- **Install Command:** `npm install`
- **Build Command:** leave empty (or `echo "build step not required"`)
- **Output Directory:** leave empty

Environment variables:

- `MONGO_URI`
- `JWT_SECRET`
- `SMTP_HOST` (optional)
- `SMTP_PORT` (optional)
- `SMTP_USER` (optional)
- `SMTP_PASS` (optional)
- `SMTP_FROM` (optional)

After deployment:

1. Open the backend URL (example: `https://your-api.vercel.app/`).
2. Confirm it returns `Freelance marketplace API running`.
3. Save this URL for frontend `VITE_API_URL`.

## 3) Frontend deployment (Vercel)

Create a second Vercel project from the same repository with:

- **Root Directory:** `frontend`
- **Framework Preset:** Vite
- **Install Command:** `npm install`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

Environment variables:

- `VITE_API_URL=https://your-api.vercel.app`

The included `frontend/vercel.json` handles React Router rewrites.

## 4) Post-deploy checks

1. Signup/login works for both employer and job seeker.
2. Employer can post jobs and see applications.
3. Job seeker can browse/search/apply/save jobs.
4. Job seeker dashboard shows application statuses.
5. Resume upload is tested.
6. Email notifications are verified (only if SMTP set).

## 5) Production caveat for resume files

Vercel serverless filesystem is ephemeral, so local disk uploads are not persistent in production.
For production-grade resume handling, move file storage to S3/Cloudinary/Firebase Storage.
