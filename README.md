# IMPACTX

IMPACTX is a Societal Challenge and Innovation Platform that connects citizens, government administrators, educational institutions, industries, implementation teams, and impact measurement.

## Architecture

```text
React Frontend
        |
        v
FastAPI REST API
        |
        v
MongoDB Atlas
```

AI analysis uses a Retrieval-Augmented Generation flow:

```text
Challenge
  -> Embedding
  -> Vector Retrieval
  -> Knowledge Context
  -> Hugging Face LLM
  -> Structured Analysis
```

## Project Structure

```text
impactx/
  frontend/   React + JavaScript + Tailwind frontend
  backend/    FastAPI + MongoDB + RAG backend
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Optional frontend environment:

```bash
cp .env.example .env
```

## Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend URL:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

Copy `backend/.env.example` to `backend/.env` and set your MongoDB Atlas URI and JWT secret.

For Render, create a Web Service with `backend` as the root directory, use `pip install -r requirements.txt` as the build command, and use `python run.py` as the start command. Render provides the `PORT` environment variable; `run.py` binds to `0.0.0.0` and uses that port automatically. Set `APP_ENV=production` and set `FRONTEND_URL` to the deployed frontend URL.

## Fresh Production Deployment

Deploy in this order:

1. Create the backend service on Render.
2. Seed the database after the backend is live.
3. Create the frontend project on Vercel.
4. Update backend CORS with the final Vercel URL.

### Render Backend

Create a new Render Web Service from this repository.

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: python run.py
```

Set these environment variables in Render:

```text
APP_ENV=production
MONGODB_URI=<your MongoDB Atlas connection string>
MONGODB_DATABASE=impactx
JWT_SECRET_KEY=<long random production secret>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
FRONTEND_URL=<temporary Vercel URL first, then final Vercel URL>
CORS_ORIGINS_CSV=http://localhost:5173,http://127.0.0.1:5173,<final Vercel URL>
HUGGINGFACE_TOKEN=<optional>
HF_GENERATION_MODEL=google/flan-t5-base
HF_EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

After Render deploys, verify:

```text
https://<render-service>.onrender.com/api/health
```

Seed sample database records from your local machine after setting `backend/.env` to the same MongoDB Atlas database:

```bash
cd backend
python -m app.seed.seed_data
```

### Vercel Frontend

Create a new Vercel project from this repository.

```text
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

Set this environment variable in Vercel:

```text
API_URL=https://<render-service>.onrender.com/api
```

The frontend includes `frontend/vercel.json`, so React Router pages such as `/login`, `/admin`, `/institute`, and `/industry` work after refresh.

After Vercel deploys, copy the final Vercel URL back into Render:

```text
FRONTEND_URL=https://<vercel-app>.vercel.app
CORS_ORIGINS_CSV=https://<vercel-app>.vercel.app
```

Then redeploy/restart the Render backend.

## Demo Users

Seed hashed demo accounts with:

```bash
cd backend
python -m app.seed.seed_data
```

Credentials:

```text
Admin: admin@impactx.in / admin123
Institute: institute@impactx.in / institute123
Industry: industry@impactx.in / industry123
```

## Backend Endpoints

Core endpoints currently scaffolded:

```text
GET  /api/health
POST /api/auth/login
POST /api/challenges
GET  /api/challenges
GET  /api/challenges/{challenge_id}
GET  /api/admin/challenges/pending
PUT  /api/admin/challenges/{challenge_id}/approve
PUT  /api/admin/challenges/{challenge_id}/reject
POST /api/ai/analyze/{challenge_id}
GET  /api/ai/analysis/{challenge_id}
```

## RAG Notes

The first backend slice includes:

- Document loading from `backend/knowledge_base`
- Chunking with overlap
- Sentence-transformer embeddings
- FAISS vector index in `backend/vector_store`
- Retriever returning text, metadata, and similarity scores
- Hugging Face Inference API generation when `HUGGINGFACE_TOKEN` is configured
- Deterministic priority scoring and embedding-based duplicate checks

The frontend still keeps its existing mock/localStorage behavior until API migration is performed route by route.
