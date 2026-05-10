# doc-converter

A full-stack document conversion app built with **FastAPI** and **React**. Users can upload a file, choose a supported target format, and download the converted result from the browser.

## Features

- Clean drag-and-drop style upload flow
- Fast format selection based on the uploaded file type
- Downloadable converted output
- Health-check and supported-formats API endpoints
- Docker support for running frontend and backend together

## Supported Conversions

| Source | Target formats |
|--------|----------------|
| `.docx` | PDF |
| `.xlsx` | CSV, PDF |
| `.pdf` | JPG, PNG |
| `.jpg` / `.jpeg` | PNG, PDF |
| `.png` | JPG, PDF |

## Project Structure

```text
doc-converter/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── .env.example
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker and Docker Compose, if running with containers
- `poppler-utils` for PDF to image conversion support

Install Poppler on Ubuntu or Debian:

```bash
sudo apt-get update
sudo apt-get install -y poppler-utils
```

### Local Development

#### 1. Start the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python main.py
```

Backend runs on http://localhost:8000.

#### 2. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on http://localhost:5173.

## Run with Docker

```bash
docker compose up --build
```

Services:

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

> Make sure the Docker daemon is running before starting the containers.

## API Endpoints

### GET /api/health
Returns the backend health status.

### GET /api/supported-formats
Returns the currently supported conversion matrix.

### POST /api/convert
Converts the uploaded file to the selected format.

Form fields:

| Field | Type | Description |
|-------|------|-------------|
| `file` | UploadFile | Source file to convert |
| `target_format` | string | Desired output format such as `pdf`, `jpg`, or `png` |

## Environment Variables

### Backend

Create a file named `.env` inside the backend folder:

| Variable | Default | Description |
|----------|---------|-------------|
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Allowed frontend origins for CORS |
| `TEMP_DIR` | system temp directory | Temporary storage for uploads and generated files |

### Frontend

Create a file named `.env` inside the frontend folder:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Base URL for the backend API |

## Troubleshooting

- If `python3 -m venv` fails, install the system venv package first.
- If Docker cannot connect, start Docker Desktop or the Docker service.
- If PDF to JPG or PNG fails, verify that Poppler is installed.
- If the frontend cannot reach the API, confirm that the backend is running on port 8000.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | FastAPI, Uvicorn |
| Conversion libraries | Pillow, pypdf, openpyxl, python-docx, reportlab, pdf2image |
| Containerization | Docker, Docker Compose |
