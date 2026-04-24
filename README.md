# SRM Full Stack Engineering Challenge - Round 1

## Tech Stack
- Backend: Node.js, Express.js, JavaScript, CORS, dotenv
- Frontend: React (Vite), JavaScript, plain CSS

## Backend Setup
1. Open terminal in `backend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create environment file:
   - Copy `.env.example` to `.env`
4. Run backend:
   ```bash
   npm start
   ```

## Frontend Setup
1. Open terminal in `frontend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create environment file:
   - Copy `.env.example` to `.env`
4. Run frontend:
   ```bash
   npm run dev
   ```

## Environment Variables
### Backend (`backend/.env`)
- `USER_ID=fullname_ddmmyyyy`
- `EMAIL_ID=your_college_email@example.edu`
- `COLLEGE_ROLL_NUMBER=your_college_roll_number`
- `PORT=5000`

### Frontend (`frontend/.env`)
- `VITE_API_BASE_URL=http://localhost:5000`

## Local Testing Steps
1. Start backend.
2. Send POST request to:
   - `http://localhost:5000/bfhl`
3. Example `curl` format:
   ```bash
   curl -X POST http://localhost:5000/bfhl \
   -H "Content-Type: application/json" \
   -d '{"data":["A->B","A->C","B->D"]}'
   ```
4. Start frontend and test through UI.

### Required Test Inputs
1.
```json
{
  "data": ["A->B", "A->C", "B->D"]
}
```

2.
```json
{
  "data": ["X->Y", "Y->Z", "Z->X"]
}
```

3.
```json
{
  "data": ["A->B", "A->B", "A->B"]
}
```

4.
```json
{
  "data": ["hello", "1->2", "AB->C", "A-B", "A->", "A->A", ""]
}
```

5.
```json
{
  "data": ["A->D", "B->D", "A->C"]
}
```

6.
```json
{
  "data": [
    "A->B", "A->C", "B->D", "C->E", "E->F",
    "X->Y", "Y->Z", "Z->X",
    "P->Q", "Q->R",
    "G->H", "G->H", "G->I",
    "hello", "1->2", "A->"
  ]
}
```

## Deployment Steps for Render Backend
1. Push repository to GitHub.
2. Create a new Web Service on Render and connect the repository.
3. Set Root Directory to `backend`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add environment variables in Render:
   - `USER_ID`
   - `EMAIL_ID`
   - `COLLEGE_ROLL_NUMBER`
   - `PORT` (optional on Render; Render can inject PORT)
7. Deploy and copy backend base URL.

## Deployment Steps for Vercel Frontend
1. Import the same repository in Vercel.
2. Set Root Directory to `frontend`.
3. Framework preset: Vite.
4. Add environment variable:
   - `VITE_API_BASE_URL=<your_render_backend_base_url>`
5. Deploy and copy frontend URL.

## Final Submission Fields
1. GitHub Repository URL
2. Frontend URL
3. Backend API Base URL without `/bfhl`
4. Resume link

Backend API Base URL must be submitted without `/bfhl`.

Correct:
- `https://your-backend.onrender.com`

Wrong:
- `https://your-backend.onrender.com/bfhl`
