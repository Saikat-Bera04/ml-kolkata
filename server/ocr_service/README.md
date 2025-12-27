OCR Service (Keras-OCR)
=======================

This directory contains a small FastAPI application that exposes a single endpoint:

- POST /ocr — accepts a file upload (PDF or image) and returns JSON { "text": "..." } containing recognized text.

Quick start (macOS / Linux):

1. Create and activate a Python virtual environment

   python3 -m venv .venv
   source .venv/bin/activate

2. Install dependencies

   pip install -r requirements.txt

3. Run the server locally

   uvicorn main:app --host 0.0.0.0 --port 8000

Example curl request:

  curl -F "file=@/path/to/resume.pdf" http://localhost:8000/ocr

Notes:
- The implementation uses keras-ocr which can be GPU accelerated if available. For development, CPU-only is fine but slower on large PDFs.
- The service converts PDFs to images using pdf2image and then runs the keras-ocr pipeline per page.
- CORS is enabled for local development to allow the frontend (Vite) to call this service.
