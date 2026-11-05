"""Regression checks against retained assets; no source or evidence is rewritten."""
import ast, contextlib, hashlib, io, json, runpy, subprocess, sys, tempfile, unittest, zipfile
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

def source_guard(name):
    # Source/PDF-text guards can be tested before a manuscript rebuild.
    tree = ast.parse(read_text(root/'validate.py', encoding='utf-8'))
    function = next(node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name == name)
    namespace = {'re': __import__('re'), 'json': json, 'hashlib': hashlib}
    exec(compile(ast.Module(body=[function], type_ignores=[]), str(root/'validate.py'), 'exec'), namespace)
    return namespace[name]

class VenueValidation(unittest.TestCase):
    def production_template_fixture(self):
        paths = ['acmart.cls', 'acmart.dtx', 'acmart.ins', 'ACM-Reference-Format.bst',
                 'official/2026-11-05/acmart-README', 'template/LaTeX-Templates/acmart.cls',
                 'template/LaTeX-Templates/ACM-Reference-Format.bst']
        return (read_bytes(root/'official/2026-11-05/production-template-provenance.json'),
                {path: read_bytes(root/path) for path in paths})

    def test_production_template_receipt_binds_every_retained_source_and_copy(self):
        check = source_guard('verify_production_template')
        provenance, files = self.production_template_fixture()
        check(provenance, files)
        for path in files:
            with self.subTest(path=path), self.assertRaisesRegex(AssertionError, 'production template file drift|template pair copy drift'):
                check(provenance, {**files, path: files[path] + b'changed'})

    def test_editing_both_template_copies_cannot_impersonate_a_production_release(self):
        check = source_guard('verify_production_template')
        provenance, files = self.production_template_fixture()
        for name in ['acmart.cls', 'ACM-Reference-Format.bst']:
            changed = {**files, name: files[name] + b'changed',
                       'template/LaTeX-Templates/' + name: files[name] + b'changed'}
            with self.subTest(name=name), self.assertRaisesRegex(AssertionError, 'production template file drift'):
                check(provenance, changed)

    def test_production_receipt_cannot_relabel_version_archive_or_edited_source(self):
        check = source_guard('verify_production_template')
        provenance, files = self.production_template_fixture()
        for field, replacement, error in [('version', '1.90', 'version drift'),
                                           ('class_release_date', '2023-06-11', 'version drift'),
                                           ('archive_sha256', '0'*64, 'archive identity drift')]:
            data = json.loads(provenance)
            data[field] = replacement
            with self.subTest(field=field), self.assertRaisesRegex(AssertionError, error):
                check(json.dumps(data).encode('utf-8'), files)
        data = json.loads(provenance)
        changed = files['acmart.cls'] + b'changed'
        data['files']['acmart.cls'] = {'sha256': hashlib.sha256(changed).hexdigest(), 'bytes': len(changed)}
        with self.assertRaisesRegex(AssertionError, 'provenance receipt drift'):
            check(json.dumps(data).encode('utf-8'), {**files, 'acmart.cls': changed,
                  'template/LaTeX-Templates/acmart.cls': changed})

    def test_only_the_inspected_anonymous_compact_output_warning_is_allowed(self):
        check = source_guard('verify_layout_diagnostics')
        warning = r'Overfull \vbox (1.1135pt too high) has occurred while \output is active []'
        self.assertEqual(check('compact-anonymous', warning),
                         [{'kind': 'vbox', 'points': 1.1135, 'context': 'output routine'}])
        for profile in ['review', 'compact', 'review-anonymous', 'supplement']:
            self.assertEqual(check(profile, 'No overfull diagnostics'), [])
            with self.subTest(profile=profile), self.assertRaisesRegex(AssertionError, 'unexpected overfull'):
                check(profile, warning)
        with self.assertRaisesRegex(AssertionError, 'unexpected overfull'):
            check('compact-anonymous', warning + '\n' + warning)

    def test_horizontal_unknown_and_out_of_bound_vertical_overflows_fail(self):
        check = source_guard('verify_layout_diagnostics')
        warnings = [r'Overfull \hbox (4.18721pt too wide) has occurred while \output is active',
                    r'Overfull \hbox (0.0001pt too wide) in paragraph at lines 1--2',
                    r'Overfull \vbox (1.1135pt too high) detected at line 1',
                    r'Overfull unknown box warning']
        warnings += [r'Overfull \vbox (' + size + r'pt too high) has occurred while \output is active []'
                     for size in ['0.1', '1', '1.2', '2']]
        for warning in warnings:
            with self.subTest(warning=warning), self.assertRaisesRegex(AssertionError, 'unexpected overfull'):
                check('compact-anonymous', warning)

    def test_verified_issue_year_cannot_revert_to_online_year(self):
        def transform(path, value):
            return value.replace('year = {2025},\n  volume = {55}', 'year = {2024},\n  volume = {55}') if path.name == 'references.bib' else value
        with self.assertRaisesRegex(AssertionError, 'verified bibliographic field drift'):
            validate(transform)

    def test_article_number_is_not_a_page_number_or_invented_length(self):
        for field in ['pages', 'numpages']:
            def transform(path, value):
                return value.replace('articleno={128}', 'articleno={128}, ' + field + '={128}') if path.name == 'references.bib' else value
            with self.subTest(field=field), self.assertRaisesRegex(AssertionError, 'unverified pagination'):
                validate(transform)

    def test_publisher_location_cannot_be_replaced_with_conference_city(self):
        def transform(path, value):
            return value.replace('address={Porto Alegre}', 'address={Recife}') if path.name == 'references.bib' else value
        with self.assertRaisesRegex(AssertionError, 'verified bibliographic field drift'):
            validate(transform)

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
            return value.replace('Motivation-first, 131 words;', 'Motivation-first, 136 words;') if path.name == 'DRAFT-CHECKLIST.md' else value
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

    def test_standard_author_source_rejects_custom_renderers_and_preserves_anonymity(self):
        # Exercise renderer guards independently of PDFs being rebuilt.
        tree = ast.parse(read_text(root/'validate.py', encoding='utf-8'))
        function = next(node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name == 'verify_standard_author_source')
        namespace = {'re': __import__('re')}
        exec(compile(ast.Module(body=[function], type_ignores=[]), str(root/'validate.py'), 'exec'), namespace)
        check = namespace['verify_standard_author_source']
        source = r'\documentclass[sigconf,pbalance]{acmart}' + '\n' + r'\documentclass[sigconf,anonymous,pbalance]{acmart}' + '\n' + r'\documentclass[manuscript,screen,review,anonymous]{acmart}'
        check(source)
        check(source + '\n' + r'% Historical \input{author-layout} is not executed')
        for override in [r'\input{author-layout}', r'\include{author-layout.tex}', r'\def\@mkauthors{}', r'\fontsize{12}{14}', r'\fontfamily{ptm}', r'\def\UrlFont{}']:
            with self.subTest(override=override), self.assertRaises(AssertionError):
                check(source + '\n' + override)
        for options in ['sigconf,anonymous,pbalance', 'manuscript,screen,review,anonymous']:
            with self.subTest(options=options), self.assertRaisesRegex(AssertionError, 'anonymous class option'):
                check(source.replace(options, options.replace(',anonymous', '')))
        for options in ['sigconf,pbalance', 'sigconf,anonymous,pbalance']:
            with self.subTest(options=options), self.assertRaisesRegex(AssertionError, 'class option missing'):
                check(source.replace(options, options.replace(',pbalance', '')))
        for override in [r'\balance', r'\nobalance', r'\def\@BAdblcol{}']:
            with self.subTest(override=override), self.assertRaisesRegex(AssertionError, 'documented class balancing option'):
                check(source + '\n' + override)

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

    def test_author_affiliation_drift_rejected(self):
        def transform(path, value):
            return value.replace('Ho Chi Minh City', 'Wrong City') if path.name == 'submission-metadata.json' else value
        with self.assertRaisesRegex(AssertionError, 'author affiliation drift'):
            validate(transform)

    def test_supplement_author_records_match_the_same_four_author_contract(self):
        check = source_guard('verify_author_records_source')
        source = read_text(root/'iciit2027-supplement.tex', encoding='utf-8')
        authors = json.loads(read_text(root/'submission-metadata.json', encoding='utf-8'))['authors']
        check(source, authors)
        for old, new in [('Vo Duc Hieu', 'Generic Team'), ('voduchieu42@gmail.com', 'wrong@example.org'),
                         ('0009-0007-5389-5177', '0000-0000-0000-0000'), ('Corresponding author.', 'Other note.')]:
            with self.subTest(field=old), self.assertRaises(AssertionError):
                check(source.replace(old, new), authors)

    def test_supplement_uses_native_abstract_class_and_ccs_metadata(self):
        check = source_guard('verify_supplement_source')
        source = read_text(root/'iciit2027-supplement.tex', encoding='utf-8')
        check(source)
        for marker in [r'\begin{abstract}', r'\end{abstract}', r'\ccsdesc', r'\keywords{', r'\maketitle']:
            with self.subTest(marker=marker), self.assertRaises(AssertionError):
                check(source.replace(marker, 'removed'))
        with self.assertRaisesRegex(AssertionError, 'renderer must not be overridden'):
            check(source + '\n' + r'\def\@mkauthors{}')

    def test_correspondence_owner_cannot_change(self):
        def transform(path, value):
            return value.replace(r'\authornote{Corresponding author.}', r'\authornote{Other note.}') if path.name == 'paper.tex' else value
        with self.assertRaisesRegex(AssertionError, 'correspondence'):
            validate(transform)

    def test_removed_authors_cannot_reappear_in_active_source(self):
        def transform(path, value):
            return value + '\n' + r'\author{Minh Tam Phan}' if path.name == 'paper.tex' else value
        with self.assertRaisesRegex(AssertionError, 'removed author still in paper source'):
            validate(transform)

    def test_supplied_orcid_mapping_cannot_change(self):
        def transform(path, value):
            return value.replace('0009-0007-5389-5177', '0000-0000-0000-0000') if path.name == 'paper.tex' else value
        with self.assertRaisesRegex(AssertionError, 'orcid'):
            validate(transform)

    def test_optional_contribution_heading_rejected(self):
        def transform(path, value):
            return value + '\n' + r'\section*{Author Information and Contributions}' if path.name == 'paper.tex' else value
        with self.assertRaisesRegex(AssertionError, 'optional author contribution'):
            validate(transform)

    def test_source_email_drift_rejected_in_standard_review_layout(self):
        def transform(path, value):
            return value.replace('voduchieu42@gmail.com', 'wrong@example.org') if path.name == 'paper.tex' else value
        with self.assertRaises(AssertionError):
            validate(transform)

    def test_required_acm_reference_block_cannot_be_suppressed(self):
        def transform(path, value):
            return value + '\n' + r'\settopmatter{printacmref=false}' if path.name == 'paper.tex' else value
        with self.assertRaisesRegex(AssertionError, 'required ACM reference block'):
            validate(transform)

    def test_native_acm_citation_rejects_renderer_overrides(self):
        check = source_guard('verify_native_acm_citation_source')
        check(r'\documentclass[sigconf]{acmart}')
        check('% Historical \\patchcmd{\\@mkbibcitation}{ACM}{} is inactive\n')
        for override in [r'\patchcmd{\@mkbibcitation}{ACM, New York, NY, USA}{}{}{}',
                         r'\renewcommand{\@mkbibcitation}{}', r'\let\@mkbibcitation\relax']:
            with self.subTest(override=override), self.assertRaisesRegex(AssertionError, 'native ACM citation renderer'):
                check(override)

    def test_native_acm_citation_rejects_reference_block_suppression(self):
        check = source_guard('verify_native_acm_citation_source')
        for setting in ['printacmref=false', 'printacmref = false', 'printacmref={false}']:
            with self.subTest(setting=setting), self.assertRaisesRegex(AssertionError, 'required ACM reference block'):
                check(r'\settopmatter{' + setting + '}')

    def test_native_acm_publisher_phrase_required_in_first_page_text(self):
        check = source_guard('verify_native_acm_citation_text')
        check('ACM Reference Format: Title. ACM, New\nYork, NY, USA, 5 pages.')
        for text in ['ACM Reference Format: Title. 5 pages.',
                     'ACM Reference Format: Title. ACM, 5 pages.',
                     'ACM Reference Format: Title. ACM, Ho Chi Minh City, Vietnam, 5 pages.']:
            with self.subTest(text=text), self.assertRaisesRegex(AssertionError, 'publisher/address phrase missing'):
                check(text)

    def test_lead_in_headings_use_native_paragraph_sectioning(self):
        check = source_guard('verify_standard_sectioning_source')
        check(r'\paragraph{Methods} Text with inline \textbf{emphasis}.')
        check('% \\textbf{Historical heading.} Inactive\n')
        with self.assertRaisesRegex(AssertionError, 'standard paragraph sectioning'):
            check(r'\textbf{Methods.} Text')

    def test_each_figure_and_table_needs_its_own_description(self):
        check = source_guard('verify_accessible_floats')
        source = '\n'.join(r'\begin{' + kind + '}\n' + r'\caption{Visible caption}' + '\n' +
                           r'\label{' + label + '}\n' + r'\Description{Details for ' + label + '}' + '\n' +
                           r'\end{' + kind + '}'
                           for kind, label in [('figure', 'fig:workflow'), ('table', 'tab:external'), ('table', 'tab:historic')])
        check(source)
        for label in ['fig:workflow', 'tab:external', 'tab:historic']:
            description = r'\Description{Details for ' + label + '}'
            for replacement in ['', r'\Description{   }', description + description,
                                r'\Description{' + 'x'*2000 + '}']:
                with self.subTest(label=label, replacement_length=len(replacement)), self.assertRaisesRegex(AssertionError, 'visual needs one nonempty'):
                    check(source.replace(description, replacement))
        with self.assertRaisesRegex(AssertionError, 'unique label'):
            check(source.replace('tab:historic', 'tab:external'))
        with self.assertRaisesRegex(AssertionError, 'inventory drift'):
            check(source.replace('tab:historic', 'tab:other'))

    def test_comment_cannot_supply_a_missing_float_description(self):
        check = source_guard('verify_accessible_floats')
        source = r'\begin{figure}' + '\n' + r'\label{fig:workflow}' + '\n' + r'% \Description{Comment only}' + '\n' + r'\end{figure}'
        with self.assertRaisesRegex(AssertionError, 'visual needs one nonempty'):
            check(source)

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
