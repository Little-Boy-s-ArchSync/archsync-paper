"""Rebuild the exact source ZIP in isolation and compare page text, not PDF timestamps."""
import hashlib, io, json, os, shutil, subprocess, sys, tempfile, zipfile
from datetime import datetime, timezone
from pathlib import Path
from pypdf import PdfReader

root = Path(__file__).resolve().parent
archive = root/'archsync-iciit2027-source.zip'
archive_bytes = archive.read_bytes()
profiles = ['review', 'compact', 'review-anonymous', 'compact-anonymous', 'supplement']
expected_files = [f'iciit2027-{profile}.pdf' for profile in profiles]
report = {'archive_sha256': hashlib.sha256(archive_bytes).hexdigest(),
          'status': 'REBUILD_INCOMPLETE', 'exit_code': None, 'text_matches': [],
          'method': 'extract exact source ZIP into fresh directory and rebuild all five profiles'}

def write_report():
    (root/'package-rebuild.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8', newline='\n')

# Invalidate any prior success before extraction or execution of this archive.
write_report()
with tempfile.TemporaryDirectory(prefix='archsync-iciit-rebuild-') as name:
    temporary = Path(name).resolve()
    stage = 'extract'
    try:
        with zipfile.ZipFile(io.BytesIO(archive_bytes)) as zipped:
            for member in zipped.namelist():
                assert (temporary/member).resolve().is_relative_to(temporary), 'unsafe archive path'
            zipped.extractall(temporary)
        stage = 'build'
        result = subprocess.run([sys.executable, str(temporary/'build.py')], cwd=temporary,
                                stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=os.environ)
        (root/'package-rebuild.log').write_bytes(result.stdout)
        report['exit_code'] = result.returncode
        assert result.returncode == 0, result.stdout.decode('utf-8', errors='replace')
        stage = 'validate-and-compare'
        validation = json.loads((temporary/'validation.json').read_text(encoding='utf-8'))
        assert [row['file'] for row in validation['pdfs']] == expected_files, 'all five profiles must be rebuilt'
        report['validation'] = validation
        for row in validation['pdfs']:
            original = PdfReader(root/row['file'])
            rebuilt = PdfReader(temporary/row['file'])
            same = [p.extract_text() for p in original.pages] == [p.extract_text() for p in rebuilt.pages]
            report['text_matches'].append({'file': row['file'], 'page_text_identical': same})
            assert same, row['file']
    except Exception as error:
        diagnostics = root/('diagnostic-rebuild-' + datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ'))
        diagnostics.mkdir()
        for path in temporary.glob('*.log'):
            shutil.copyfile(path, diagnostics/path.name)
        report.update(status='REBUILD_FAILED', failed_stage=stage,
                      error_class=type(error).__name__, diagnostics=diagnostics.name)
        write_report()
        print('Retained failed build logs: ' + str(diagnostics), flush=True)
        raise
    report['status'] = 'REBUILD_VERIFIED'
    write_report()
    print(json.dumps(report, indent=2))
