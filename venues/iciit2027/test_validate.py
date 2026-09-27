"""Regression checks against retained assets; no source or evidence is rewritten."""
import contextlib, io, json, runpy, sys, unittest
from pathlib import Path
from unittest.mock import patch

root = Path(__file__).resolve().parent
read_text = Path.read_text
read_bytes = Path.read_bytes

def validate(transform=None, byte_transform=None):
    def text(path, *args, **kwargs):
        # A locale-dependent read must fail this test even on UTF-8 Linux.
        assert kwargs.get('encoding') == 'utf-8', 'text encoding must be explicit'
        value = read_text(path, *args, **kwargs)
        return transform(path, value) if transform else value
    def binary(path):
        value = read_bytes(path)
        return byte_transform(path, value) if byte_transform else value
    with patch.object(sys, 'argv', ['validate.py', '--fresh']), patch.object(Path, 'read_text', text), patch.object(Path, 'read_bytes', binary), contextlib.redirect_stdout(io.StringIO()):
        runpy.run_path(str(root/'validate.py'), run_name='__main__')

class VenueValidation(unittest.TestCase):
    def test_current_assets_and_explicit_utf8(self):
        validate()

    def test_owner_order_cannot_change_even_if_metadata_is_self_consistent(self):
        def transform(path, value):
            if path.name == 'submission-metadata.json':
                data = json.loads(value)
                data['authors'][1], data['authors'][2] = data['authors'][2], data['authors'][1]
                return json.dumps(data)
            return value
        with self.assertRaisesRegex(AssertionError, 'owner-confirmed author order'):
            validate(transform)

    def test_display_order_must_match(self):
        def transform(path, value):
            if path.name == 'paper.tex':
                return value.replace('Tran Minh Hoang', 'SWAP-NAME').replace('Ha Hoang Bach', 'Tran Minh Hoang').replace('SWAP-NAME', 'Ha Hoang Bach')
            return value
        with self.assertRaisesRegex(AssertionError, 'author order drift'):
            validate(transform)

    def test_visible_author_order_drift_rejected(self):
        def transform(path, value):
            return value.replace('Le Van Kiet, Ha Hoang Bach', 'Ha Hoang Bach, Le Van Kiet') if path.name == 'author-layout.tex' else value
        with self.assertRaisesRegex(AssertionError, 'visible author order drift'):
            validate(transform)

    def test_shared_affiliation_drift_rejected(self):
        def transform(path, value):
            return value.replace('70000', '99999') if path.name == 'submission-metadata.json' else value
        with self.assertRaisesRegex(AssertionError, 'shared affiliation drift'):
            validate(transform)

    def test_visible_correspondence_star_drift_rejected(self):
        def transform(path, value):
            return value.replace(r'Minh Tam Phan\textsuperscript{*}', 'Minh Tam Phan') if path.name == 'author-layout.tex' else value
        with self.assertRaisesRegex(AssertionError, 'correspondence star drift'):
            validate(transform)

    def test_visible_email_order_drift_rejected(self):
        def transform(path, value):
            return value.replace('voduchieu42@gmail.com', 'SWAP').replace('andyjobs2023@gmail.com', 'voduchieu42@gmail.com').replace('SWAP', 'andyjobs2023@gmail.com') if path.name == 'author-layout.tex' else value
        with self.assertRaisesRegex(AssertionError, 'visible email order drift'):
            validate(transform)

    def test_anonymous_guard_required(self):
        def transform(path, value):
            return value.replace(r'\ifdefined\blindprofile\else', '') if path.name == 'author-layout.tex' else value
        with self.assertRaisesRegex(AssertionError, 'preserve anonymous renderer'):
            validate(transform)

    def test_optional_contribution_heading_rejected(self):
        def transform(path, value):
            return value + '\n' + r'\section*{Author Information and Contributions}' if path.name == 'paper.tex' else value
        with self.assertRaisesRegex(AssertionError, 'optional author contribution'):
            validate(transform)

    def test_source_email_drift_still_rejected_in_shared_review_layout(self):
        def transform(path, value):
            return value.replace('voduchieu42@gmail.com', 'wrong@example.org') if path.name == 'paper.tex' else value
        with self.assertRaises(AssertionError):
            validate(transform)

    def test_required_acm_reference_block_cannot_be_suppressed(self):
        def transform(path, value):
            return value + '\n' + r'\settopmatter{printacmref=false}' if path.name == 'paper.tex' else value
        with self.assertRaisesRegex(AssertionError, 'required ACM reference block'):
            validate(transform)

    def test_abstract_metadata_drift_rejected(self):
        def transform(path, value):
            return value.replace('Service changes can introduce', 'Changed abstract can introduce') if path.name == 'SUBMISSION-METADATA.md' else value
        with self.assertRaisesRegex(AssertionError, 'copyable abstract drift'):
            validate(transform)

    def test_changed_evidence_bytes_rejected(self):
        def transform(path, value):
            return value + b'tampered' if path == root/'evidence/guardian-0.4/before.log' else value
        with self.assertRaises(AssertionError):
            validate(byte_transform=transform)

if __name__ == '__main__':
    unittest.main()
