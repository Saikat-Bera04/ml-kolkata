// Google Vision API service for resume text extraction

// Google Vision API credentials (from service account)
const GOOGLE_VISION_CREDENTIALS = {
  type: "service_account",
  project_id: "mediops-478511",
  private_key_id: "011dda287751c52f58c9882c48b508789f9c6d76",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQChOYApE7j+TEMw\n9TeR7RPjHA+qCmdH/pxP7d1Ssjp95e51jEQ6M+uKHSO5OpXJtE30XoBZ839xl1EL\n5enYVXa890ak6jWo1sTtGP1KJZ1IKqMJgJM7mBHeNprSMtx89lUifz7BawgqlMK4\nxZfB7CA3Ka5BR8VyiWc1W879Jf2LPG05Y9DwWc7SZem0aqQ9WU22qJX7DJJ3vNZf\nzUBQADTIs+PIInYVD34W22302befUJazOFErQPTk5fhF+SY6JkznH0QCw+fd5dN+\nbIap8BA10CDz0Bc3TZLP0/0gm+Od4HeoOeIX6G9f4du7JBsFGxZt8ODzywY8pUFw\n9VOznzAbAgMBAAECggEAAIBvFSd7UbrxoCt4gpNbjoRJG36bA+zQTStPDOBJvYvS\nxCvkNBxytcrOoKKlJXEfx+WvEVOCrraJk2xYz7fX65Jst2BPZFddGVKStjA6keRA\n1gHoi8MeZYcyKXjX7y8rZm3Lou1uBQMjx7oUqj3yHb/sV9hsQAsu8G6dh80mdnr9\nucQu/W6DoBo5ljwp9R/73sMYiS4tqzaKWmk1OxEySrNM0rf0dGNt7tLe2fP3WHFa\nZi0Th26ZIa8Mpt20IYpfJZwWk9x/s5S4VHy4WgOEMVBr4yLyE1cq+l/MV01OTKQX\nbyIB7TuqZhSR+peGosYTsPI0JS3t39lyYj4LMGRGgQKBgQDQG0BIX6oMGAPUX5rk\nfo8SlAymRNriPSb4/hO6+kPFdWen5fDFy4CWuWNo1q1cT02OJY66o3AdU6dV/ki/\n5HDLwfLogTTLWSdkgeeRlTMvH52V+XaoUlIa5oD4bTIIibiPPjiByCd/fVYUksa8\nXB/5+CWIfnemnaLeoecy2NueZwKBgQDGVCurhNX3J4/xXdoHIjYDUxcURD3QHbXF\njWTZjW3RP4ax7/ZQIqZzXHXWalZnJx/76fotZ38ogjFrq92S9bcxJg3Blj7DeNFG\natzFakNvRF7c6F4Mdoy47LGQCDhsZpgcy4DX3C5FXU4D021c4594EU24tvIhX59N\nwmduDnHoLQKBgAJxH2r5/GPR8FGQoZ+mwIUGSbO1wR/AefGYAaFDCIKLoyC8OPwJ\nLEQYfssfIb+gipdtZ2RXQJyHe8Itjqr5wj0R1IjX40ezjxvFznLN3mDiLRYybCsD\ndEUuiTrhBSJGg2zi3QTg1V3Qma76Hezd494qBD66xSqmVN/p5G2bT9BnAoGBAIHQ\nvFjjdO323lgdl0WOFg6tB3FDjbY4jC9H8pgX46bQTwkPSYmAdLUT8ymqpu2UBXJt\n30xy7x+DwHd6omi8HvGzt9Nb1a862Lif3+v0NzmQZgtwqYa83jV48GyXhN8ndC98\n4NPqEftjLFqCvJXNhCciJF5gmTJRFcPfGLZIDDTtAoGARYBlSAJLdB1faZEIBOip\nRqCA4xg81scvNMp3BLJMjaYT3pW6E9twodu/OHv0RRv8QWHT6cBmkxACPNjB+i0+\nQe01+8Qk5MYn2FuUeAJkCFkPp2Bz7/196p0iugZqobfia5dd1v/rxwrvhublM07V\nm/3L22VI9sI+Py3EAGq+nMs=\n-----END PRIVATE KEY-----\n",
  client_email: "mediops-vision@mediops-478511.iam.gserviceaccount.com",
  client_id: "106728889768193440041",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/mediops-vision%40mediops-478511.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

const GOOGLE_VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

// Dynamic tesseract import is declared in src/types/tesseract.d.ts

/**
 * Get OAuth2 access token for Google Vision API
 */
async function getAccessToken(): Promise<string> {
  try {
    // Create JWT for service account authentication
    const jwt = await createJWT();
    
    // Exchange JWT for access token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get access token: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

/**
 * Create JWT for service account
 */
async function createJWT(): Promise<string> {
  // For browser environment, we'll need to use a library or create JWT manually
  // Since we can't use Node.js crypto in browser, we'll use a simpler approach
  // by making the request directly with the service account key
  
  // Note: In production, this should be done on a backend server for security
  // For now, we'll use a workaround with the API key or direct authentication
  
  // This is a simplified version - in production, use a backend proxy
  throw new Error('JWT creation requires backend. Use backend API endpoint instead.');
}

/**
 * Convert file to base64
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Extract text from image using Google Vision API
 */
export async function extractTextFromImage(file: File): Promise<string> {
  try {
    const base64Image = await fileToBase64(file);
    
    // For browser environment, we need to use a backend proxy
    // Since we can't securely use service account credentials in browser,
    // we'll create a simpler approach using a backend endpoint
    
    // Alternative: Use Google Vision API with API key (limited functionality)
    // Or use a backend proxy that handles authentication
    
    // For now, let's use a workaround with PDF.js for PDFs
    if (file.type === 'application/pdf') {
      return await extractTextFromPDF(file);
    }
    
    // For images, we'll need backend support
    throw new Error('Image text extraction requires backend API. Please use PDF format or implement backend endpoint.');
  } catch (error) {
    console.error('Error extracting text from image:', error);
    throw error;
  }
}

/**
 * Extract text from PDF using PDF.js (fallback method)
 */
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Use PDF.js library for PDF text extraction
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => {
          const it = item as unknown as { str?: string };
          return typeof it.str === 'string' ? it.str : '';
        })
        .join(' ');
      // If PDF page has no selectable text (scanned image), fallback to OCR using tesseract.js
      if (!pageText || pageText.trim().length < 20) {
        try {
          // Render page to canvas
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Render page to the canvas element
            await page.render({ canvas, viewport }).promise;
            const dataUrl = canvas.toDataURL('image/png');

            // Lazy-load tesseract and run OCR
            try {
            const tesseract = await import('tesseract.js');
            const { createWorker } = tesseract as typeof import('tesseract.js');
            const worker = createWorker({ logger: () => {} });
              await worker.load();
              await worker.loadLanguage('eng');
              await worker.initialize('eng');
              const { data: ocrData } = await worker.recognize(dataUrl);
              await worker.terminate();
              const ocrText = ocrData?.text?.trim() || '';
              fullText += ocrText + '\n';
              // continue to next page
              continue;
            } catch (ocrError) {
              console.warn('OCR fallback failed for page', i, ocrError);
              // fallback to pageText (even if empty)
            }
          }
        } catch (renderError) {
          console.warn('Failed to render PDF page for OCR:', renderError);
        }
      }

      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF.');
  }
}

/**
 * Extract text from resume (PDF or image) - Main function
 */
export async function extractResumeText(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    return await extractTextFromPDF(file);
  } else if (file.type.startsWith('image/')) {
    // For images, try to use Google Vision API via backend
    // For now, return error message suggesting PDF upload
    throw new Error('Image upload requires backend API. Please upload a PDF resume or implement backend endpoint.');
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or image file.');
  }
}


