// OCR helpers (disabled)
// The project no longer performs OCR on uploaded resumes. These helpers are
// intentionally no-ops to keep the API surface stable for callers.

/**
 * extractResumeText
 * Previously used to extract text from uploaded resumes (PDF/image). OCR has
 * been removed; this function returns an empty string to indicate no text was
 * extracted.
 */
export async function extractResumeText(file: File): Promise<string> {
  // OCR / Vision extraction has been removed. Accept the uploaded file but do not
  // send it to any external service. Return an empty string to indicate no
  // extracted text is available.
  return '';
}

/**
 * extractTextFromImage
 * Kept for backward compatibility; returns empty string.
 */
export async function extractTextFromImage(file: File): Promise<string> {
  return '';
}

/**
 * extractTextFromPDF
 * Kept for backward compatibility; returns empty string.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  return '';
}
