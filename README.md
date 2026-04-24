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

