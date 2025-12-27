"""
Vision proxy (DEPRECATED)

OCR-based PDF text extraction has been removed from this project. This
file remains for historical reference only and should not be started or
used. If you see this file in your repository, it means OCR artifacts
still exist and should be removed or ignored.

To accept uploaded resumes without extracting text, the frontend now
simply stores/uploads the file and shows a "Resume uploaded
successfully" message to the user. No server-side vision service is
required for that flow.
"""

from fastapi import FastAPI

app = FastAPI(title="Vision Proxy (DEPRECATED)")


@app.get("/health")
async def health():
    return {"status": "deprecated"}
