// OCR has been removed project-wide. These helpers remain only to keep
// compatibility with existing imports. They intentionally return an empty
// string to indicate no text extraction took place.

export async function extractTextFromImage(file: File): Promise<string> {
  console.info('extractTextFromImage: OCR disabled — skipping image text extraction');
  return '';
}

export async function extractTextFromPDF(file: File): Promise<string> {
  console.info('extractTextFromPDF: OCR disabled — skipping PDF text extraction');
  return '';
}


