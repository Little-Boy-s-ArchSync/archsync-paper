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
    def local_template_fixture(self):
        reference = root/'template/LaTeX-Templates'
        return (read_bytes(root/'official/2026-11-05/local-template-provenance.json'),
                {path.relative_to(reference).as_posix(): read_bytes(path) for path in reference.rglob('*') if path.is_file()},
                {name: read_bytes(root/name) for name in ['acmart.cls', 'acmart.dtx', 'acmart.ins', 'ACM-Reference-Format.bst']})

    def test_local_template_receipt_binds_every_reference_file_and_active_copy(self):
        check = source_guard('verify_local_template')
        provenance, reference, active = self.local_template_fixture()
        check(provenance, reference, active)
        for name in reference:
            with self.subTest(reference=name), self.assertRaisesRegex(AssertionError, 'supplied template file drift'):
                check(provenance, {**reference, name: reference[name] + b'changed'}, active)
        for name in active:
            with self.subTest(active=name), self.assertRaisesRegex(AssertionError, 'active template differs'):
                check(provenance, reference, {**active, name: active[name] + b'changed'})
        for changed in [{k: v for k, v in reference.items() if k != 'README'}, {**reference, 'unexpected-file': b'extra'}]:
            with self.assertRaisesRegex(AssertionError, 'file inventory drift'):
                check(provenance, changed, active)

    def test_editing_both_template_copies_cannot_impersonate_the_supplied_folder(self):
        check = source_guard('verify_local_template')
        provenance, reference, active = self.local_template_fixture()
        for name in ['acmart.cls', 'ACM-Reference-Format.bst']:
            changed = active[name] + b'changed'
            with self.subTest(name=name), self.assertRaisesRegex(AssertionError, 'supplied template file drift'):
                check(provenance, {**reference, name: changed}, {**active, name: changed})

    def test_local_receipt_cannot_relabel_version_archive_or_edited_source(self):
        check = source_guard('verify_local_template')
        provenance, reference, active = self.local_template_fixture()
        for field, replacement in [('version', '2.21'), ('class_release_date', '2026-11-01')]:
            data = json.loads(provenance)
            data[field] = replacement
            with self.subTest(field=field), self.assertRaisesRegex(AssertionError, 'version drift'):
                check(json.dumps(data).encode('utf-8'), reference, active)
        data = json.loads(provenance)
        data['source_archive']['sha256'] = '0'*64
        with self.assertRaisesRegex(AssertionError, 'archive identity drift'):
            check(json.dumps(data).encode('utf-8'), reference, active)
        data = json.loads(provenance)
        changed = active['acmart.cls'] + b'changed'
        data['files']['acmart.cls'] = {'sha256': hashlib.sha256(changed).hexdigest(), 'bytes': len(changed)}
        with self.assertRaisesRegex(AssertionError, 'provenance receipt drift'):
            check(json.dumps(data).encode('utf-8'), {**reference, 'acmart.cls': changed}, {**active, 'acmart.cls': changed})

    def test_only_exact_reviewed_native_output_diagnostics_are_allowed(self):
        check = source_guard('verify_layout_diagnostics')
        reviewed = {
            'compact': (r'Overfull \hbox (4.18721pt too wide) has occurred while \output is active', 'hbox', 4.18721),
            'compact-anonymous': (r'Overfull \vbox (1.152pt too high) has occurred while \output is active []', 'vbox', 1.152),
        }
        for profile in ['review', 'compact', 'review-anonymous', 'compact-anonymous', 'supplement']:
            self.assertEqual(check(profile, 'No overfull diagnostics'), [])
            for expected_profile, (warning, kind, points) in reviewed.items():
                if profile == expected_profile:
                    self.assertEqual(check(profile, warning), [{'kind': kind, 'points': points, 'context': 'output routine'}])
                    with self.subTest(profile=profile, duplicate=True), self.assertRaisesRegex(AssertionError, 'unexpected overfull'):
                        check(profile, warning + '\n' + warning)
                else:
                    with self.subTest(profile=profile, warning=warning), self.assertRaisesRegex(AssertionError, 'unexpected overfull'):
                        check(profile, warning)

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
        for profile, kind, dimension, sizes in [('compact', 'hbox', 'wide', ['4.1872', '4.18722']),
                                               ('compact-anonymous', 'vbox', 'high', ['1.1519', '1.1521'])]:
            for size in sizes:
                warning = 'Overfull \\' + kind + ' (' + size + 'pt too ' + dimension + r') has occurred while \output is active'
                if kind == 'vbox':
                    warning += ' []'
                with self.subTest(profile=profile, size=size), self.assertRaisesRegex(AssertionError, 'unexpected overfull'):
                    check(profile, warning)

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

    def test_shared_author_source_rejects_custom_renderers_and_class_selection(self):
        check = source_guard('verify_standard_author_source')
        source = r'\author{Example}'
        check(source)
        check(source + '\n' + r'% Historical \input{author-layout} is not executed')
        for override in [r'\input{author-layout}', r'\include{author-layout.tex}', r'\def\@mkauthors{}', r'\fontsize{12}{14}', r'\fontfamily{ptm}', r'\def\UrlFont{}']:
            with self.subTest(override=override), self.assertRaises(AssertionError):
                check(source + '\n' + override)
        with self.assertRaisesRegex(AssertionError, 'profile entry files'):
            check(r'\documentclass[sigconf]{acmart}' + '\n' + source)
        for override in [r'\balance', r'\nobalance', r'\def\@BAdblcol{}']:
            with self.subTest(override=override), self.assertRaisesRegex(AssertionError, 'documented class balancing option'):
                check(source + '\n' + override)

    def test_supplied_class_is_first_command_and_preserves_each_profile(self):
        check = source_guard('verify_profile_entry_source')
        profiles = {'review': 'manuscript,screen,review', 'compact': 'sigconf',
                    'review-anonymous': 'manuscript,screen,review,anonymous',
                    'compact-anonymous': 'sigconf,anonymous', 'supplement': 'manuscript,screen'}
        for profile, options in profiles.items():
            source = r'\documentclass[' + options + ']{acmart}\n' + r'\input{paper}'
            check(profile, source)
            check(profile, '% Opening comment\n' + source)
            for prefix in [r'\input{texlive-compat}', r'\RequirePackage{hyperref}']:
                with self.subTest(profile=profile, prefix=prefix), self.assertRaisesRegex(AssertionError, 'first command'):
                    check(profile, prefix + '\n' + source)
            with self.subTest(profile=profile), self.assertRaisesRegex(AssertionError, 'exactly one class'):
                check(profile, source + '\n' + r'\documentclass[sigconf]{acmart}')
            for changed in [options + ',pbalance', options.replace(',anonymous', '') if 'anonymous' in options else options + ',anonymous']:
                with self.subTest(profile=profile, options=changed), self.assertRaisesRegex(AssertionError, 'first command'):
                    check(profile, source.replace('[' + options + ']', '[' + changed + ']'))

    def test_preload_hook_only_registers_the_package_order_fix(self):
        check = source_guard('verify_preload_hook_source')
        source = read_text(root/'acmart-preload-hook.tex', encoding='utf-8')
        check(source)
        for changed in [source + '\n' + r'\setlength{\textwidth}{6in}',
                        source.replace('hyperxmp/before', 'hyperxmp/after'),
                        source.replace('bookmarksnumbered,unicode', 'unicode')]:
            with self.assertRaisesRegex(AssertionError, 'package-order compatibility'):
                check(changed)

    def test_native_layout_rejects_table_font_and_spacing_overrides(self):
        check = source_guard('verify_standard_layout_source')
        check(r'\begin{table}\centering\begin{tabular}{lr}A&B\end{tabular}\end{table}')
        for override in [r'\emergencystretch=3em', r'\setlength{\tabcolsep}{3pt}', r'\fontsize{8}{9}', r'\geometry{margin=1in}']:
            with self.subTest(override=override), self.assertRaisesRegex(AssertionError, 'layout override'):
                check(override)
        for size in ['small', 'footnotesize', 'scriptsize', 'tiny']:
            with self.subTest(size=size), self.assertRaisesRegex(AssertionError, 'class font size'):
                check(r'\begin{table*}\centering' + '\\' + size + r' Text\end{table*}')

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
