"""Regression checks against retained assets; no source or evidence is rewritten."""
import contextlib, hashlib, io, json, runpy, subprocess, sys, tempfile, unittest, zipfile
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
        return runpy.run_path(str(root/'validate.py'), run_name='__main__')

class VenueValidation(unittest.TestCase):
    def test_rebuild_receipt_requires_this_archive_and_all_successful_profiles(self):
        check = validate()['verify_rebuild_receipt']
        receipt = {'status': 'REBUILD_VERIFIED', 'archive_sha256': 'a'*64, 'exit_code': 0,
                   'text_matches': [{'file': f'iciit2027-{profile}.pdf', 'page_text_identical': True}
                                    for profile in ['review', 'compact', 'review-anonymous', 'compact-anonymous', 'supplement']]}
        check(receipt, 'a'*64)
        for changes in [{'status': 'REBUILD_FAILED'}, {'status': 'REBUILD_INCOMPLETE'},
                        {'archive_sha256': 'b'*64}, {'exit_code': 1}, {'exit_code': False},
                        {'text_matches': []}, {'text_matches': receipt['text_matches'][:-1]},
                        {'text_matches': receipt['text_matches'] + receipt['text_matches'][:1]},
                        {'text_matches': [{'file': 'iciit2027-review.pdf', 'page_text_identical': False}] + receipt['text_matches'][1:]},
                        {'text_matches': [{'file': 'iciit2027-review.pdf', 'page_text_identical': 1}] + receipt['text_matches'][1:]}]:
            with self.subTest(changes=changes), self.assertRaises(AssertionError):
                check({**receipt, **changes}, 'a'*64)

    def test_rebuild_failures_invalidate_old_success_and_preserve_diagnostics(self):
        # Controlled software fixtures, not research source or experimental results.
        builders = [None,
                    "from pathlib import Path\nPath('review-build.log').write_text('controlled failure', encoding='utf-8')\nraise SystemExit(7)\n",
                    "from pathlib import Path\nPath('validation.json').write_text('{\"pdfs\": []}', encoding='utf-8')\n"]
        for builder, expected_stage in zip(builders, ['extract', 'build', 'validate-and-compare']):
            with self.subTest(stage=expected_stage), tempfile.TemporaryDirectory(prefix='archsync-rebuild-test-') as name:
                temporary = Path(name)
                (temporary/'verify-package-rebuild.py').write_bytes(read_bytes(root/'verify-package-rebuild.py'))
                (temporary/'package-rebuild.json').write_text('{"status": "REBUILD_VERIFIED"}', encoding='utf-8')
                archive = temporary/'archsync-iciit2027-source.zip'
                if builder is None:
                    archive.write_bytes(b'not a ZIP')
                else:
                    with zipfile.ZipFile(archive, 'w') as zipped:
                        zipped.writestr('build.py', builder)
                result = subprocess.run([sys.executable, str(temporary/'verify-package-rebuild.py')], capture_output=True)
                self.assertNotEqual(result.returncode, 0)
                receipt = json.loads((temporary/'package-rebuild.json').read_text(encoding='utf-8'))
                self.assertEqual(receipt['status'], 'REBUILD_FAILED')
                self.assertEqual(receipt['failed_stage'], expected_stage)
                self.assertEqual(receipt['archive_sha256'], hashlib.sha256(archive.read_bytes()).hexdigest())
                self.assertEqual(receipt['text_matches'], [])
                diagnostics = temporary/receipt['diagnostics']
                self.assertTrue(diagnostics.is_dir())
                if expected_stage == 'build':
                    self.assertEqual(receipt['exit_code'], 7)
                    self.assertEqual((diagnostics/'review-build.log').read_text(encoding='utf-8'), 'controlled failure')

    def test_checklist_citation_count_cannot_describe_an_older_candidate(self):
        def transform(path, value):
            return value.replace('| References | 17 citations:', '| References | 25 citations:') if path.name == 'DRAFT-CHECKLIST.md' else value
        with self.assertRaisesRegex(AssertionError, 'checklist citation count drift'):
            validate(transform)

    def test_requirements_citation_count_cannot_describe_an_older_candidate(self):
        def transform(path, value):
            return value.replace('with 17 citations:', 'with 25 citations:') if path.name == 'REQUIREMENTS.md' else value
        with self.assertRaisesRegex(AssertionError, 'requirements citation count drift'):
            validate(transform)

    def test_checklist_abstract_count_matches_the_actual_submission_abstract(self):
        def transform(path, value):
            return value.replace('Motivation-first, 140 words;', 'Motivation-first, 136 words;') if path.name == 'DRAFT-CHECKLIST.md' else value
        with self.assertRaisesRegex(AssertionError, 'checklist abstract word count drift'):
            validate(transform)

    def test_old_nonfoundational_citation_rejected(self):
        def transform(path, value):
            return value.replace('year = {2022}', 'year = {2012}') if path.name == 'references.bib' else value
        with self.assertRaisesRegex(AssertionError, 'undocumented old citation'):
            validate(transform)

    def test_external_context_label_required(self):
        def transform(path, value):
            return value.replace('not an executed baseline comparison', 'baseline comparison') if path.name == 'related-work.tex' else value
        with self.assertRaisesRegex(AssertionError, 'impersonate executed baseline'):
            validate(transform)

    def test_pinned_repo_link_required(self):
        def transform(path, value):
            return value.replace('/archsync-core/tree/', '/archsync-core/blob/') if path.name == 'paper.tex' else value
        with self.assertRaisesRegex(AssertionError, 'pinned artifact link missing'):
            validate(transform)

    def test_real_pdf_email_fonts_reject_serif_fallback(self):
        namespace = validate()
        bad_runs = [(email, 'Times-Bold', 10) for email in namespace['expected_emails']]
        with self.assertRaisesRegex(AssertionError, 'bold monospace'):
            namespace['verify_author_typography'](bad_runs)

    def test_email_font_override_cannot_be_removed(self):
        def transform(path, value):
            return value.replace(r'\def\UrlFont', r'\def\UnusedFont') if path.name == 'author-layout.tex' else value
        with self.assertRaisesRegex(AssertionError, 'explicit email font override'):
            validate(transform)

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
