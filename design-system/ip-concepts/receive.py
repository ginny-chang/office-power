"""Receives avatar images from the concept page (?export) and writes them to public/bot-avatars/. Local use only."""
import base64, pathlib, re
from http.server import BaseHTTPRequestHandler, HTTPServer
OUT = pathlib.Path(__file__).resolve().parents[2] / 'public' / 'bot-avatars'
class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:4173')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()
    def do_POST(self):
        name = self.path.lstrip('/')
        body = self.rfile.read(int(self.headers.get('Content-Length', 0))).decode()
        if not re.fullmatch(r'[a-z]+\.png', name) or not body.startswith('data:image/png;base64,'):
            self.send_response(400); self._cors(); self.end_headers(); return
        (OUT / name).write_bytes(base64.b64decode(body.split(',', 1)[1]))
        self.send_response(200); self._cors(); self.end_headers()
    def log_message(self, *args): pass
HTTPServer(('127.0.0.1', 4199), Handler).serve_forever()
