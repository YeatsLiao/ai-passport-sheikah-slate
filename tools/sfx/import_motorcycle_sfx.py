"""Import motorcycle cues from an extracted GameROMMotorcycle directory.

Usage: python -B tools/sfx/import_motorcycle_sfx.py SOURCE_DIRECTORY
Preserves original WAV bytes and existing mappings. Derives the engine loop
using the sample boundaries supplied in MotorcycleEngine_LOOP.txt.
"""
import hashlib
import io
import json
from pathlib import Path
import re
import sys
import wave

ROOT = Path(__file__).resolve().parents[2]
FILES = {'bike_engine': 'MotorcycleEngine.wav',
         'bike_start': 'Motorcycle_EngineStart.wav',
         'bike_jump': 'Motorcycle_EngineJump00.wav',
         'bike_land': 'Motorcycle_BodyLand00.wav'}

def main():
    src = Path(sys.argv[1])
    dest = ROOT / 'assets/audio/botw'
    manifest_path = dest / 'manifest.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    mapping_path = ROOT / 'prototype/js/sound-files.js'
    mapping = json.loads(mapping_path.read_text(encoding='utf-8').split('const BOTW_SFX_FILES=', 1)[1].strip().removesuffix(';'))
    loop = (src / 'MotorcycleEngine_LOOP.txt').read_text(encoding='utf-8')
    start = int(re.search(r'loop start:\s*(\d+)', loop).group(1))
    end = int(re.search(r'loop end:\s*(\d+)', loop).group(1))
    payloads, records = {}, []
    for kind, name in FILES.items():
        data = (src / name).read_bytes()
        with wave.open(io.BytesIO(data)) as w:
            if w.getframerate() != 48000 or w.getsampwidth() != 2:
                raise ValueError('Expected PCM16 48kHz: ' + name)
            duration = w.getnframes() / w.getframerate()
            if kind == 'bike_engine':
                if not 0 <= start < end <= w.getnframes():
                    raise ValueError('Invalid loop sample boundaries')
                params = w.getparams()
                w.setpos(start)
                frames = w.readframes(end - start)
        payloads[name] = data
        record = dict(kind=kind, file=name, archive_path='Equipment/GameROMMotorcycle/' + name,
                      source='User-provided Equipment archive', sha256=hashlib.sha256(data).hexdigest(),
                      bytes=len(data), seconds=duration)
        if kind == 'bike_engine':
            records.append(dict(record, kind='bike_engine_source'))
            buf = io.BytesIO()
            with wave.open(buf, 'wb') as w:
                w.setparams(params)
                w.writeframes(frames)
            data = buf.getvalue()
            name = 'MotorcycleEngine-loop.wav'
            payloads[name] = data
            record.update(file=name, source_sha256=record['sha256'],
                          sha256=hashlib.sha256(data).hexdigest(), bytes=len(data),
                          seconds=(end-start)/48000,
                          derivation=f'PCM frames [{start},{end}), from original LOOP.txt; no normalization or resampling')
        mapping[kind] = name
        records.append(record)
    # Validate every source and destination before writing anything.
    for name, data in payloads.items():
        target = dest / name
        if target.exists() and target.read_bytes() != data:
            raise ValueError('Existing different file: ' + name)
    kinds = set(FILES) | {'bike_engine_source'}
    manifest['files'] = [r for r in manifest['files'] if r['kind'] not in kinds] + records
    for name, data in payloads.items():
        (dest / name).write_bytes(data)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    mapping_path.write_text('/* Generated from imported WAVs; see tools/sfx/ importers. */\nconst BOTW_SFX_FILES='+json.dumps(mapping, indent=2)+';\n', encoding='utf-8')
    print('Imported four motorcycle cues and the source-defined engine loop.')

if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main()
