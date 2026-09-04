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
