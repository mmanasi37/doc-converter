# doc-converter

A full-stack online document conversion application built with **FastAPI** (Python) and **React** (Tailwind CSS).

## Supported Conversions

| Source | Target Formats |
|--------|---------------|
| `.docx` | PDF |
| `.xlsx` | CSV, PDF |
| `.pdf` | JPG, PNG |
| `.jpg` / `.jpeg` | PNG, PDF |
| `.png` | JPG, PDF |

---

## Project Structure

```
doc-converter/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI app + CORS
│   │   ├── routes/
│   │   │   └── convert.py     # API endpoints
│   │   ├── services/
│   │   │   └── conversion.py  # Conversion logic
│   │   └── utils/
│   │       └── file_handler.py
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── main.py                # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.jsx
│   │   │   ├── FormatSelector.jsx
│   │   │   └── ConversionResult.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Quick Start (Local Development)

### Prerequisites

- Python 3.11+
- Node.js 20+
- `poppler-utils` (for PDF → image conversion):
  - **Ubuntu/Debian**: `sudo apt-get install poppler-utils`
  - **macOS**: `brew install poppler`
  - **Windows**: download from [poppler releases](https://github.com/oschwartz10612/poppler-windows/releases)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python main.py
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The UI will be available at `http://localhost:5173`.

---

## Docker Compose

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

---

## API Reference

### `GET /api/health`
Returns the health status of the API.

### `GET /api/supported-formats`
Returns a JSON object listing all supported source → target conversions.

### `POST /api/convert`
Converts a file to the requested format.

**Form fields:**
| Field | Type | Description |
|-------|------|-------------|
| `file` | `UploadFile` | The source file |
| `target_format` | `string` | Desired output format (e.g. `pdf`, `jpg`) |

**Response:** The converted file (binary) with appropriate `Content-Type` header.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Comma-separated CORS origins |
| `TEMP_DIR` | system temp | Directory for temporary file storage |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `` (empty, uses Vite proxy) | Backend API URL |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, Uvicorn |
| Conversion | pypdf, Pillow, openpyxl, python-docx, reportlab, pdf2image |
| Frontend | React 18, Vite, Tailwind CSS |
| HTTP Client | Axios |
| Containerisation | Docker, Docker Compose |
