"""Download the unmodified public BotW map reference in verified byte ranges.

The upstream server closes large responses early on some connections. No image
pixels are changed. Run explicitly; this is not part of the prototype runtime.
"""
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path
import subprocess
import tempfile
from PIL import Image

URL = 'https://objmap.zeldamods.org/game_files/maptex/base.png'
TOTAL = 1204518
CHUNK = 65536
DEST = Path(__file__).resolve().parents[1] / 'assets/raw/05_world/maps/botw-map-base.webp'
CACHE = Path(tempfile.gettempdir()) / 'sheikah-map-reference'

def fetch(start):
    end = min(TOTAL - 1, start + CHUNK - 1)
    CACHE.mkdir(exist_ok=True)
    part = CACHE / f'{start}-{end}.bin'
    if part.exists() and part.stat().st_size == end - start + 1:
        return part.read_bytes()
    for attempt in range(5):
        try:
            response = subprocess.run([
                'curl.exe', '--http1.1', '--fail', '--silent', '--show-error',
                '--location', '--max-time', '40', '--range', f'{start}-{end}',
                '--header', 'Accept-Encoding: identity', URL,
            ], check=True, capture_output=True)
            data = response.stdout
            if len(data) != end - start + 1:
                raise ValueError('Incomplete byte range')
            part.write_bytes(data)
            print(f'Fetched range {start}-{end}', flush=True)
            return data
        except Exception:
            if attempt == 4:
                raise

if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=4) as pool:
        data = b''.join(pool.map(fetch, range(0, TOTAL, CHUNK)))
    with Image.open(BytesIO(data)) as image:
        image.verify()
    DEST.write_bytes(data)
    print(f'Saved {len(data)} unmodified source bytes to {DEST.name}')
