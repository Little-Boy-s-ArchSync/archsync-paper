"""Validate the draft package; does not authorize submission."""
import hashlib, json, re, sys, zipfile
from pathlib import Path
from pypdf import PdfReader
root = Path(__file__).resolve().parent
expected_authors = ['Vo Duc Hieu', 'Tran Minh Hoang', 'Le Van Kiet', 'Ha Hoang Bach']
expected_emails = ['voduchieu42@gmail.com', 'andyjobs2023@gmail.com', 'levankiet1212.2004@gmail.com', 'hahoangbach2005@gmail.com']
expected_orcids = ['0009-0007-5389-5177', '0009-0000-0302-1841', '0009-0007-8434-882X', '0009-0000-5118-0660']
expected_affiliations = [
    {'department': 'Software Engineering', 'institution': 'FPT University', 'city': 'Ho Chi Minh City', 'postcode': None, 'country': 'Vietnam'},
    {'department': 'Computer Science and Engineering', 'institution': 'VNUK Institute for Research and Executive Education, The University of Danang', 'city': 'Da Nang', 'postcode': None, 'country': 'Vietnam'},
    {'department': 'Software Engineering', 'institution': 'VNUK Institute for Research and Executive Education, The University of Danang', 'city': 'Da Nang', 'postcode': None, 'country': 'Vietnam'},
    {'department': 'Information Assurance', 'institution': 'FPT University', 'city': 'Ho Chi Minh City', 'postcode': None, 'country': 'Vietnam'},
]

def verify_rebuild_receipt(receipt, archive_sha256):
    assert receipt.get('status') == 'REBUILD_VERIFIED', 'source package rebuild is not verified'
    assert receipt.get('archive_sha256') == archive_sha256, 'rebuild receipt belongs to a different archive'
    assert type(receipt.get('exit_code')) is int and receipt['exit_code'] == 0, 'rebuild command failed'
    expected = [{'file': f'iciit2027-{profile}.pdf', 'page_text_identical': True}
                for profile in ['review', 'compact', 'review-anonymous', 'compact-anonymous', 'supplement']]
    assert receipt.get('text_matches') == expected, 'rebuild must match all five profiles exactly'
    assert all(row['page_text_identical'] is True for row in receipt['text_matches']), 'rebuild matches must be actual booleans'

def verify_standard_author_source(source):
    # The official class renders author metadata. Do not replace it with a
    # hand-built block or impose the former custom font/spacing contract.
    active = re.sub(r'(?m)(?<!\\)%.*$', '', source)
    assert not re.search(r'\\(?:input|include)\s*\{author-layout(?:\.tex)?\}', active), 'custom author renderer must not be loaded'
    assert not re.search(r'@mkauthors|\\(?:fontsize|fontfamily|UrlFont)\b', active), 'standard ACM author renderer must not be overridden'
    assert r'\documentclass[sigconf,pbalance]{acmart}' in active, 'compact named class option missing'
    assert r'\documentclass[sigconf,anonymous,pbalance]{acmart}' in active, 'compact anonymous class option missing'
    assert r'\documentclass[manuscript,screen,review,anonymous]{acmart}' in active, 'review anonymous class option missing'
    assert not re.search(r'\\(?:balance|nobalance|balancecols)\b|@BAdblcol', active), 'use the documented class balancing option without output overrides'

def verify_author_records_source(source, authors):
    blocks = re.findall(r'\\author\{([^}]+)\}(.*?)(?=\\author\{|\\renewcommand\{\\shortauthors)', source, re.S)
    assert [name for name, _ in blocks] == [a['name'] for a in authors], 'author order drift'
    assert all(name not in source for name in ('Hoang Nguyen-The', 'Minh Tam Phan')), 'removed author still in paper source'
    for (name, block), author in zip(blocks, authors):
        for field, macro in [('email','email'),('department','department'),('institution','institution'),('city','city'),('postcode','postcode'),('country','country')]:
            value = author.get(field)
            if value:
                assert '\\' + macro + '{' + value + '}' in block, (name, field)
            else:
                assert not re.search(r'\\' + macro + r'\{[^}]*\}', block), (name, field)
        assert re.findall(r'\\orcid\{([^}]+)\}', block) == ([author['orcid']] if author['orcid'] else []), (name, 'orcid')
        assert re.findall(r'\\authornote\{([^}]+)\}', block) == (['Corresponding author.'] if author['corresponding_author'] else []), (name, 'correspondence')

def verify_supplement_source(source):
    active = re.sub(r'(?m)(?<!\\)%.*$', '', source)
    assert r'\documentclass[manuscript,screen]{acmart}' in active, 'supplement standard manuscript class missing'
    assert not re.search(r'@mkauthors|\\(?:fontsize|fontfamily|UrlFont)\b', active), 'supplement author renderer must not be overridden'
    assert re.search(r'\\begin\{abstract\}\s*\S.*?\\end\{abstract\}', active, re.S), 'supplement abstract missing'
    assert all(marker in active for marker in [r'\begin{CCSXML}', r'\end{CCSXML}', r'\ccsdesc', r'\keywords{', r'\maketitle']), 'supplement CCS/keywords/title metadata missing'

def verify_native_acm_citation_source(source):
    active = re.sub(r'(?m)(?<!\\)%.*$', '', source)
    assert '@mkbibcitation' not in active, 'native ACM citation renderer must not be overridden'
    assert not re.search(r'printacmref\s*=\s*(?:false|\{false\})', active), 'required ACM reference block suppressed'

def verify_native_acm_citation_text(text):
    assert re.search(r'\bACM,\s*New\s+York,\s*NY,\s*USA\b', text), 'native ACM publisher/address phrase missing from first page'

def verify_standard_sectioning_source(source):
    active = re.sub(r'(?m)(?<!\\)%.*$', '', source)
    assert not re.search(r'(?m)^\s*\\textbf\{[^{}\n]+\.\}', active), 'lead-in headings must use standard paragraph sectioning'

def verify_accessible_floats(source):
    # Each main-paper visual needs its own plain-text description. A total
    # count alone would miss a description copied onto the wrong float.
    active = re.sub(r'(?m)(?<!\\)%.*$', '', source)
    expected = {'fig:workflow': 'figure', 'tab:external': 'table', 'tab:historic': 'table'}
    found = {}
    for match in re.finditer(r'\\begin\{(figure|table)(\*?)\}(.*?)\\end\{\1\2\}', active, re.S):
        kind, _, body = match.groups()
        labels = re.findall(r'\\label\{([^{}]+)\}', body)
        assert len(labels) == 1 and labels[0] not in found, 'each visual must have one unique label'
        label = labels[0]
        descriptions = re.findall(r'\\Description(?:\[[^\]]*\])?\{([^{}]*)\}', body)
        assert len(descriptions) == 1 and 0 < len(descriptions[0].strip()) < 2000, ('visual needs one nonempty plain-text description under 2000 characters', label)
        found[label] = kind
    assert found == expected, 'main-paper figure/table inventory drift'

def verify_production_template(provenance_bytes, files):
    provenance = json.loads(provenance_bytes.decode('utf-8'))
    assert provenance.get('version') == '2.21' and provenance.get('class_release_date') == '2026-11-01', 'production template version drift'
    assert provenance.get('status') == 'PRODUCTION_CLASS_GENERATED_UNMODIFIED', 'production class generation status missing'
    assert provenance.get('archive_sha256') == '81977a834f5cfd5302c37181ede34d2663eeea60604d1d89230e3c5e74b9a4bb', 'production template archive identity drift'
    # Pin the reviewed receipt itself, so replacing both a file and its claimed
    # hash cannot make an edited template appear to be the production release.
    assert hashlib.sha256(provenance_bytes).hexdigest() == 'a2ead7f16d065dcc38e90c3ed149d76580b2bb04e87d50bc6de570d94c6481a1', 'production provenance receipt drift'
    paths = {'acmart.cls': 'acmart.cls', 'acmart.dtx': 'acmart.dtx', 'acmart.ins': 'acmart.ins',
             'ACM-Reference-Format.bst': 'ACM-Reference-Format.bst',
             'README': 'official/2026-11-05/acmart-README'}
    for member, path in paths.items():
        content = files[path]
        record = provenance['files'][member]
        assert len(content) == record['bytes'] and hashlib.sha256(content).hexdigest() == record['sha256'], ('production template file drift', path)
    for name in ['acmart.cls', 'ACM-Reference-Format.bst']:
        assert files[name] == files['template/LaTeX-Templates/' + name], ('template pair copy drift', name)
    assert re.search(rb'\\ProvidesClass\{acmart\}\s*\[2026/11/01 v2\.21\b', files['acmart.cls']), 'generated class version header drift'
    return provenance

def verify_layout_diagnostics(profile, log):
    warnings = [line.strip() for line in re.findall(r'(?m)^[ \t]*Overfull[^\n]*', log)]
    if not warnings:
        return []
    # The unmodified production class/pbalance output has one inspected
    # final-column warning in the anonymous compact profile. Bound its kind,
    # context, count and size; horizontal and all other overflows fail.
    match = re.fullmatch(r'Overfull \\vbox \(([0-9.]+)pt too high\) has occurred while \\output is active(?: \[\])?', warnings[0])
    assert profile == 'compact-anonymous' and len(warnings) == 1 and match and 1 < float(match.group(1)) < 1.2, ('unexpected overfull layout diagnostic', profile, warnings)
    return [{'kind': 'vbox', 'points': float(match.group(1)), 'context': 'output routine'}]

assert set(sys.argv[1:]) <= {'--check', '--fresh'}, 'unknown validation option'
assert not ('--check' in sys.argv and '--fresh' in sys.argv), 'choose retained or fresh validation'
source = (root/'paper.tex').read_text(encoding='utf-8') + (root/'related-work.tex').read_text(encoding='utf-8')
keys = set(k.strip() for group in re.findall(r'\\cite\{([^}]+)\}', source) for k in group.split(','))
bibkeys = set(re.findall(r'@\w+\{([^,]+),', (root/'references.bib').read_text(encoding='utf-8')))
scope = json.loads((root/'reference-scope.json').read_text(encoding='utf-8'))
assert keys == set(scope['citation_keys']) == bibkeys, 'venue citation membership drift'
bibliography = (root/'references.bib').read_text(encoding='utf-8')
entries = {re.search(r'@\w+\{([^,]+),', entry).group(1): entry
           for entry in re.split(r'(?m)(?=^\s*@\w+\{)', bibliography)
           if re.search(r'@\w+\{([^,]+),', entry)}
field_evidence = json.loads((root/'bibliography-field-evidence.json').read_text(encoding='utf-8'))
for record in field_evidence['publisher_checks']:
    entry = entries[record['key']]
    for field, value in record['verified_bibtex_fields'].items():
        found = re.search(r'\b' + re.escape(field) + r'\s*=\s*\{([^}]+)\}', entry, re.I)
        assert found and found.group(1) == value, ('verified bibliographic field drift', record['key'], field)
assert not re.search(r'\b(?:pages|numpages)\s*=', entries['schneider2025comparison'], re.I), 'article identifier must not become unverified pagination'
for entry in re.split(r'(?m)(?=^\s*@\w+\{)', (root/'references.bib').read_text(encoding='utf-8')):
    match = re.search(r'@\w+\{([^,]+),', entry)
    if not match:
        continue
    key = match.group(1)
    year = int(re.search(r'\byear\s*=\s*\{(\d{4})\}', entry, re.I).group(1))
    if not scope['recency_window'][0] <= year <= scope['recency_window'][1]:
        exception = scope['foundational_exceptions'].get(key)
        assert exception and exception['year'] == year and exception['role'], ('undocumented old citation', key)
        doi = re.search(r'\bdoi\s*=\s*\{([^}]+)\}', entry, re.I).group(1)
        assert doi.lower() == exception['doi'].lower(), ('foundation DOI drift', key)
assert 'not an executed baseline comparison' in source, 'published context must not impersonate executed baseline'
assert 'regression-oracle agreement' in source and 'not an external baseline' in source, 'development evidence boundary missing'
for repo in ['core', 'guardian', 'benchmark']:
    assert re.search(r'https://github.com/Little-Boy-s-ArchSync/archsync-' + repo + r'/tree/[a-f0-9]{40}', source), ('pinned artifact link missing', repo)
for name in ['acmart.cls', 'ACM-Reference-Format.bst']:
    assert (root/name).read_bytes() == (root/'template/LaTeX-Templates'/name).read_bytes()
template_paths = ['acmart.cls', 'acmart.dtx', 'acmart.ins', 'ACM-Reference-Format.bst',
                  'official/2026-11-05/acmart-README', 'template/LaTeX-Templates/acmart.cls',
                  'template/LaTeX-Templates/ACM-Reference-Format.bst']
template_provenance = verify_production_template(
    (root/'official/2026-11-05/production-template-provenance.json').read_bytes(),
    {name: (root/name).read_bytes() for name in template_paths})
metadata = json.loads((root/'submission-metadata.json').read_text(encoding='utf-8'))
assert [a['name'] for a in metadata['authors']] == expected_authors, 'owner-confirmed author order drift'
assert [a['email'] for a in metadata['authors']] == expected_emails, 'owner-supplied email drift'
assert [a['orcid'] for a in metadata['authors']] == expected_orcids, 'supplied ORCID mapping drift'
assert [a['name'] for a in metadata['authors'] if a['corresponding_author']] == ['Vo Duc Hieu'], 'corresponding author drift'
assert [{field: a.get(field) for field in ('department', 'institution', 'city', 'postcode', 'country')}
        for a in metadata['authors']] == expected_affiliations, 'author affiliation drift'
abstract = re.search(r'\\begin\{abstract\}\s*(.*?)\s*\\end\{abstract\}', (root/'paper.tex').read_text(encoding='utf-8'), re.S).group(1)
assert metadata['abstract'] == abstract.replace('--', '–'), 'abstract metadata drift'
assert metadata['abstract'] in (root/'SUBMISSION-METADATA.md').read_text(encoding='utf-8'), 'copyable abstract drift'
checklist = (root/'DRAFT-CHECKLIST.md').read_text(encoding='utf-8')
requirements = (root/'REQUIREMENTS.md').read_text(encoding='utf-8')
assert f'| References | {len(keys)} citations:' in checklist, 'checklist citation count drift'
assert f'with {len(keys)} citations:' in requirements, 'requirements citation count drift'
assert f'Motivation-first, {len(metadata["abstract"].split())} words;' in checklist, 'checklist abstract word count drift'
# Verify the complete ordered author block against the copyable submission data.
paper_source = (root/'paper.tex').read_text(encoding='utf-8')
supplement_source = (root/'iciit2027-supplement.tex').read_text(encoding='utf-8')
verify_author_records_source(paper_source, metadata['authors'])
verify_author_records_source(supplement_source, metadata['authors'])
verify_supplement_source(supplement_source)
verify_native_acm_citation_source(supplement_source)
for author in metadata['authors']:
    assert author['name'] in (root/'SUBMISSION-METADATA.md').read_text(encoding='utf-8'), author['name']
    assert author['email'] in (root/'SUBMISSION-METADATA.md').read_text(encoding='utf-8'), author['name']
verify_standard_author_source(paper_source)
verify_native_acm_citation_source(paper_source)
verify_standard_sectioning_source(source)
verify_accessible_floats(source)
assert 'Author Information and Contributions' not in paper_source, 'optional author contribution section restored'
evidence_checked = False
if (root/'evidence').is_dir():
    manifest = json.loads((root/'evidence-manifest.json').read_text(encoding='utf-8'))
    for item in manifest['files']:
        assert hashlib.sha256((root/item['path']).read_bytes()).hexdigest() == item['sha256'], item['path']
    for claim in json.loads((root/'CLAIM-EVIDENCE.json').read_text(encoding='utf-8'))['claims']:
        for artifact in claim['artifacts']:
            assert any(item['path'] == artifact for item in manifest['files']), artifact
    evidence_checked = True
rows=[]
layout_diagnostics = {}
for profile in ['review','compact','review-anonymous','compact-anonymous','supplement']:
    path=root/f'iciit2027-{profile}.pdf'
    pdf=PdfReader(path); text='\n'.join(p.extract_text() or '' for p in pdf.pages)
    log=(root/f'{profile}-build.log').read_text(encoding='utf-8')
    assert not re.search(r'There were undefined|Citation .* undefined|Reference .* undefined|error:',log), profile
    layout_diagnostics[profile] = verify_layout_diagnostics(profile, log)
    if profile != 'supplement':
        minimum,maximum=(4,5) if profile.startswith('compact') else (8,10)
        assert minimum <= len(pdf.pages) <= maximum, (profile,len(pdf.pages))
        assert '786,432' in text and '315' in text and '126' in text
        assert 'codex' in text.lower() and 'references' in text.lower()
        assert 'acm reference format' in text.lower(), (profile, 'missing ACM reference block')
        first_page_text = pdf.pages[0].extract_text() or ''
        if 'anonymous' not in profile:
            assert all(name not in first_page_text for name in ('Hoang Nguyen-The', 'Minh Tam Phan')), (profile, 'removed author still displayed')
        verify_native_acm_citation_text(first_page_text)
        assert 'author information and contributions' not in text.lower(), 'optional contribution section in PDF'
        if 'anonymous' in profile:
            identity_text = re.sub(r'\s+', '', (text + str(pdf.metadata)).lower())
            assert 'little-boy-s-archsync' not in identity_text, 'repository identity leaked into anonymous text'
            for page in pdf.pages:
                for annotation in page.get('/Annots', []):
                    assert 'little-boy-s-archsync' not in str(annotation.get_object()).lower(), 'repository identity leaked into anonymous link'
            for author in metadata['authors']:
                for field in ['name','email','institution','orcid']:
                    if author.get(field):
                        assert re.sub(r'\s+', '', author[field].lower()) not in identity_text, (profile, field)

        # ACM 2.21 includes emails in the named review contact-information block.
        marker_fields = ('name', 'email')
        for marker in [author[field] for author in metadata['authors'] for field in marker_fields]:
            if 'anonymous' in profile: assert re.sub(r'\s+', '', marker.lower()) not in re.sub(r'\s+', '', text.lower()),(profile,marker)
            else:
                assert re.sub(r'\s+', '', marker.lower()) in re.sub(r'\s+', '', text.lower()),(profile,marker)
        if 'anonymous' not in profile:
            positions = [re.sub(r'\s+', '', text.lower()).index(re.sub(r'\s+', '', name.lower())) for name in expected_authors]
            assert positions == sorted(positions), (profile, 'PDF author order drift')
            first_page = re.sub(r'\s+', '', (pdf.pages[0].extract_text() or '').lower())
            if profile.startswith('compact'):
                email_positions = [first_page.index(email.lower()) for email in expected_emails]
                assert email_positions == sorted(email_positions), (profile, 'PDF email order drift')
            assert 'correspondingauthor.' in first_page, (profile, 'correspondence footnote drift')
            # ACM's manuscript author renderer prints institution/country only;
            # sigconf prints department and city as well. Exact per-author
            # values are checked above in the structured source and metadata.
            rendered_values = ['FPT University', 'VNUK Institute for Research and Executive Education',
                               'The University of Danang', 'Vietnam']
            if profile.startswith('compact'):
                rendered_values += ['Software Engineering', 'Computer Science and Engineering',
                                    'Information Assurance', 'Ho Chi Minh City', 'Da Nang']
            assert all(re.sub(r'\s+', '', value.lower()) in first_page for value in rendered_values), (profile, 'author affiliation missing')
    else:
        first_page_text = pdf.pages[0].extract_text() or ''
        first_page = re.sub(r'\s+', '', first_page_text.lower())
        assert 'acmreferenceformat' in first_page, 'supplement ACM reference block missing'
        verify_native_acm_citation_text(first_page_text)
        positions = [first_page.index(re.sub(r'\s+', '', name.lower())) for name in expected_authors]
        assert positions == sorted(positions), 'supplement PDF author order drift'
        assert 'correspondingauthor.' in first_page, 'supplement correspondence footnote missing'
        assert all(email.lower() in first_page for email in expected_emails), 'supplement author email missing'
        for value in ['FPT University', 'VNUK Institute for Research and Executive Education', 'The University of Danang', 'Vietnam']:
            assert re.sub(r'\s+', '', value.lower()) in first_page, ('supplement affiliation missing', value)
        assert all(re.sub(r'\s+', '', name.lower()) not in first_page for name in ('Hoang Nguyen-The', 'Minh Tam Phan')), 'removed author in supplement'
    rows.append({'file':path.name,'pages':len(pdf.pages),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size})
report={'status':'LOCAL_DRAFT_VALIDATED_NOT_SUBMITTED','citations':len(keys),'abstract_metadata_matches':True,'all_four_authors_and_order_match':True,'per_author_affiliations_and_email_order_match':True,'standard_author_renderer_source_verified':True,'native_acm_reference_format':True,'standard_paragraph_sectioning_verified':True,'figure_and_table_descriptions_verified':True,'supplement_metadata_verified':True,'author_layout':'standard-acm','default_acm_author_renderer':True,'correspondence_in_author_footnote':True,'evidence_hashes_verified':evidence_checked,'production_template_version':template_provenance['version'],'class_matches_production_generation_receipt':True,'production_template_sources_verified':True,'bibliography_style_matches_production_archive':True,'layout_diagnostics':layout_diagnostics,'pdfs':rows,'visual_review':'separate review required','submission_authorization':False}
if '--check' in sys.argv:
    assert report == json.loads((root/'validation.json').read_text(encoding='utf-8')), 'retained PDF validation receipt drift'
    package = json.loads((root/'package-manifest.json').read_text(encoding='utf-8'))
    for item in package['archives']:
        assert hashlib.sha256((root/item['file']).read_bytes()).hexdigest() == item['sha256'], item['file']
    for item in package['source_files']:
        assert hashlib.sha256((root/item['path']).read_bytes()).hexdigest() == item['sha256'], item['path']
    with zipfile.ZipFile(root/'archsync-iciit2027-source.zip') as archive:
        for item in package['source_files']:
            assert hashlib.sha256(archive.read(item['path'])).hexdigest() == item['sha256'], item['path']
    verify_rebuild_receipt(json.loads((root/'package-rebuild.json').read_text(encoding='utf-8')),
                           hashlib.sha256((root/'archsync-iciit2027-source.zip').read_bytes()).hexdigest())
elif '--fresh' not in sys.argv:
    (root/'validation.json').write_text(json.dumps(report,indent=2)+'\n', encoding='utf-8', newline='\n')
print(json.dumps(report,indent=2))
