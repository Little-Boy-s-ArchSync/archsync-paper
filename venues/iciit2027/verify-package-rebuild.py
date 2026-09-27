"""Rebuild the exact source ZIP in isolation and compare page text, not PDF timestamps."""
import hashlib, json, os, subprocess, sys, tempfile, zipfile
from pathlib import Path
from pypdf import PdfReader

root = Path(__file__).resolve().parent
archive = root/'archsync-iciit2027-source.zip'
with tempfile.TemporaryDirectory(prefix='archsync-iciit-rebuild-') as name:
    temporary = Path(name).resolve()
    with zipfile.ZipFile(archive) as zipped:
        for member in zipped.namelist():
            assert (temporary/member).resolve().is_relative_to(temporary), 'unsafe archive path'
        zipped.extractall(temporary)
    result = subprocess.run([sys.executable, str(temporary/'build.py')], cwd=temporary,
                            stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=os.environ)
    (root/'package-rebuild.log').write_bytes(result.stdout)
    assert result.returncode == 0, result.stdout.decode('utf-8', errors='replace')
    validation = json.loads((temporary/'validation.json').read_text(encoding='utf-8'))
    matches = []
    for row in validation['pdfs']:
        original = PdfReader(root/row['file'])
        rebuilt = PdfReader(temporary/row['file'])
        same = [p.extract_text() for p in original.pages] == [p.extract_text() for p in rebuilt.pages]
        matches.append({'file': row['file'], 'page_text_identical': same})
        assert same, row['file']
    report = {'archive_sha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
              'method': 'extract exact source ZIP into fresh directory and rebuild all five profiles',
              'exit_code': result.returncode, 'validation': validation, 'text_matches': matches}
    (root/'package-rebuild.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8', newline='\n')
    print(json.dumps(report, indent=2))
