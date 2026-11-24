# StartX

A startup incubation portal with three kinds of users:

| Who | Where | What they do |
|---|---|---|
| Startup | `/register`, `/login` | Company details, EIR and grant applications, monthly progress reports, chat with admin |
| Admin | `/admin/login` | Review everything, accept/reject/shortlist, assign reviewers, chat, charts, PDF report |
| Reviewer | `/reviewer/login`, `/reviewer/register` | Rate and comment on applications assigned to them |

## Run it on your computer

You need **Node.js 18+** and **MongoDB** running locally (or a MongoDB Atlas connection string).

```bash
# Terminal 1 - backend (http://localhost:4000)
cd backend
npm install
npm start

# Terminal 2 - frontend (http://localhost:3000)
cd frontend
npm install
npm start
```

Admin login: `admin` / `12345` (change it with `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `backend/.env`).

### Settings (optional)
- `backend/.env`: copy `backend/.env.example`. Everything has a default, so you can skip this locally.
- `frontend/.env`: copy `frontend/.env.example`. Only needed to point at another backend or to enable Google sign-in.

## Deploying (free)

- **Database:** MongoDB Atlas free cluster → put its connection string in `MONGO_URI`.
- **Backend:** Render web service, root directory `backend`, build `npm install`, start `npm start`, env vars from `backend/.env.example`.
- **Frontend:** Vercel project, root directory `frontend`, env `REACT_APP_API_URL=https://<your-render-backend>.onrender.com`.

Note: Render's free plan sleeps after 15 minutes without traffic, so the first request after that takes about a minute.
