from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import io
from typing import List

app = FastAPI(title="OCR Service (Keras-OCR)")

# Allow local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
_pipeline = None

def get_pipeline():
    global _pipeline
    if _pipeline is None:
        try:
            import keras_ocr
        except Exception as e:
            raise RuntimeError(f"Keras-OCR import failed: {e}")
        _pipeline = keras_ocr.pipeline.Pipeline()
    return _pipeline



def images_from_pdf_bytes(pdf_bytes: bytes, dpi: int = 200) -> List[bytes]:
    """Convert PDF bytes into list of PNG bytes (one per page) using pdf2image."""
    try:
        from pdf2image import convert_from_bytes
    except Exception as e:
        raise RuntimeError("pdf2image not available: " + str(e))

    pil_images = convert_from_bytes(pdf_bytes, dpi=dpi)
    images = []
    for im in pil_images:
        buf = io.BytesIO()
        im.save(buf, format='PNG')
        images.append(buf.getvalue())
    return images


@app.post('/ocr')
async def ocr_file(file: UploadFile = File(...)):
    """Accept an uploaded PDF or image file and return extracted text using Keras-OCR."""
    try:
        contents = await file.read()
        # Determine if PDF
        content_type = file.content_type or ''

        # Lazy import keras_ocr pipeline
        try:
            import keras_ocr
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Keras-OCR import failed: {e}")

        pipeline = keras_ocr.pipeline.Pipeline()

        images = []
        if content_type == 'application/pdf' or file.filename.lower().endswith('.pdf'):
            images = images_from_pdf_bytes(contents, dpi=200)
        else:
            # treat as image
            images = [contents]

        all_text = []

        for idx, img_bytes in enumerate(images):
            try:
                # keras-ocr expects RGB images as numpy arrays; use PIL
                from PIL import Image
                import numpy as np

                img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
                img_np = np.array(img)

                predictions = pipeline.recognize([img_np])
                # predictions is list for each image
                page_text = []
                for p in predictions[0]:
                    # p is (word, box)
                    page_text.append(p[0])
                all_text.append(' '.join(page_text))
            except Exception as e:
                # continue on per-page errors
                all_text.append('')

        result_text = '\n\n'.join([t for t in all_text if t.strip()])
        return JSONResponse({"text": result_text})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/health')
async def health():
    return {"status": "ok"}
