"""Simple test client for the OCR service."""
import requests
import sys


def run(file_path: str, url: str = "http://localhost:8000/ocr"):
    with open(file_path, "rb") as fh:
        files = {"file": (file_path, fh)}
        resp = requests.post(url, files=files)
        print('Status:', resp.status_code)
        try:
            print(resp.json())
        except Exception:
            print(resp.text)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python test_client.py /path/to/file.pdf')
        sys.exit(1)
    run(sys.argv[1])
