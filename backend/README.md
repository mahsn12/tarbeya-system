# Tarbeya Backend

Install dependencies and run the server:

```bash
cd tarbeya_system/backend
npm install
npm run start
```

Environment variables (optional):
- `MONGO_URI` or `MONGODB_URI` : MongoDB connection string
- `PORT` : server port (defaults to 4000)

OCR route:
- POST `/api/ocr/upload` with multipart form field `pdf` (PDF file)
