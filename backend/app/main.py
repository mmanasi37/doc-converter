from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.convert import router as convert_router
import os

app = FastAPI(
    title="Doc Converter API",
    description="Convert between Word, Excel, PDF, JPG, and PNG formats",
    version="1.0.0",
)

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(convert_router)


@app.get("/")
async def root():
    return {"message": "Doc Converter API is running"}
