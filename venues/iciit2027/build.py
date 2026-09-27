"""Build all venue profiles on Windows/Linux/macOS; no submission authorization."""
import os, subprocess, sys
from pathlib import Path

root = Path(__file__).resolve().parent
assert set(sys.argv[1:]) <= {'--check'}, 'unknown build option'
for profile in ['review', 'compact', 'review-anonymous', 'compact-anonymous', 'supplement']:
    source = f'iciit2027-{profile}.tex'
    if os.environ.get('TECTONIC'):
        command = [os.environ['TECTONIC'], '--keep-logs', source]
    else:
        command = ['latexmk', '-pdf', '-file-line-error', '-halt-on-error', '-interaction=nonstopmode', source]
    result = subprocess.run(command, cwd=root, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    (root/f'{profile}-build.log').write_bytes(result.stdout)
    print(f'{profile}: exit {result.returncode}', flush=True)
    if result.returncode:
        sys.stdout.buffer.write(result.stdout)
        raise SystemExit(result.returncode)
command = [sys.executable, str(root/'validate.py')]
if '--check' in sys.argv:
    command.append('--fresh')
raise SystemExit(subprocess.call(command, cwd=root))
