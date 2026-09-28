"""Validate the draft package; does not authorize submission."""
import hashlib, json, re, sys, zipfile
from pathlib import Path
from pypdf import PdfReader
root = Path(__file__).resolve().parent
expected_authors = ['Vo Duc Hieu', 'Tran Minh Hoang', 'Le Van Kiet', 'Ha Hoang Bach', 'Hoang Nguyen-The', 'Minh Tam Phan']
expected_emails = ['voduchieu42@gmail.com', 'andyjobs2023@gmail.com', 'levankiet1212.2004@gmail.com', 'hahoangbach2005@gmail.com', 'hoangnt20@fe.edu.vn', 'tampm@fe.edu.vn']
expected_orcids = ['0009-0007-5389-5177', '0009-0000-0302-1841', '0009-0007-8434-882X', '0009-0000-5118-0660', None, None]
expected_affiliations = [
    {'department': 'Software Engineering', 'institution': 'FPT University', 'city': 'Ho Chi Minh City', 'postcode': '70000', 'country': 'Vietnam'},
    {'department': 'Computer Science and Engineering', 'institution': 'VNUK Institute for Research and Executive Education, The University of Danang', 'city': 'Da Nang', 'postcode': None, 'country': 'Vietnam'},
    {'department': 'Software Engineering', 'institution': 'VNUK Institute for Research and Executive Education, The University of Danang', 'city': 'Da Nang', 'postcode': None, 'country': 'Vietnam'},
    {'department': 'Information Assurance', 'institution': 'FPT University', 'city': 'Ho Chi Minh City', 'postcode': '70000', 'country': 'Vietnam'},
    {'department': 'Faculty of Software Engineering', 'institution': 'FPT University HCMC', 'city': 'Ho Chi Minh City', 'postcode': '70000', 'country': 'Vietnam'},
    {'department': 'Faculty of Software Engineering', 'institution': 'FPT University HCMC', 'city': 'Ho Chi Minh City', 'postcode': '70000', 'country': 'Vietnam'},
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
    assert r'\documentclass[sigconf,anonymous]{acmart}' in active, 'compact anonymous class option missing'
    assert r'\documentclass[manuscript,screen,review,anonymous]{acmart}' in active, 'review anonymous class option missing'

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
metadata = json.loads((root/'submission-metadata.json').read_text(encoding='utf-8'))
assert [a['name'] for a in metadata['authors']] == expected_authors, 'owner-confirmed author order drift'
assert [a['email'] for a in metadata['authors']] == expected_emails, 'owner-supplied email drift'
assert [a['orcid'] for a in metadata['authors']] == expected_orcids, 'supplied ORCID mapping drift'
assert [a['name'] for a in metadata['authors'] if a['corresponding_author']] == ['Minh Tam Phan'], 'corresponding author drift'
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
blocks = re.findall(r'\\author\{([^}]+)\}(.*?)(?=\\author\{|\\renewcommand\{\\shortauthors)', paper_source, re.S)
assert [name for name, _ in blocks] == [a['name'] for a in metadata['authors']], 'author order drift'
for (name, block), author in zip(blocks, metadata['authors']):
    for field, macro in [('email','email'),('department','department'),('institution','institution'),('city','city'),('postcode','postcode'),('country','country')]:
        value = author.get(field)
        if value:
            assert '\\' + macro + '{' + value + '}' in block, (name, field)
        else:
            assert not re.search(r'\\' + macro + r'\{[^}]*\}', block), (name, field)
    orcids = re.findall(r'\\orcid\{([^}]+)\}', block)
    assert orcids == ([author['orcid']] if author['orcid'] else []), (name, 'orcid')
    assert re.findall(r'\\authornote\{([^}]+)\}', block) == (['Corresponding author.'] if author['corresponding_author'] else []), (name, 'correspondence')
    assert name in (root/'SUBMISSION-METADATA.md').read_text(encoding='utf-8'), name
    assert author['email'] in (root/'SUBMISSION-METADATA.md').read_text(encoding='utf-8'), name
verify_standard_author_source(paper_source)
assert 'Author Information and Contributions' not in paper_source, 'optional author contribution section restored'
assert 'printacmref=false' not in paper_source, 'required ACM reference block suppressed'
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
for profile in ['review','compact','review-anonymous','compact-anonymous','supplement']:
    path=root/f'iciit2027-{profile}.pdf'
    pdf=PdfReader(path); text='\n'.join(p.extract_text() or '' for p in pdf.pages)
    log=(root/f'{profile}-build.log').read_text(encoding='utf-8')
    assert not re.search(r'Overfull|There were undefined|Citation .* undefined|Reference .* undefined|error:',log), profile
    if profile != 'supplement':
        minimum,maximum=(4,5) if profile.startswith('compact') else (8,10)
        assert minimum <= len(pdf.pages) <= maximum, (profile,len(pdf.pages))
        assert '786,432' in text and '315' in text and '126' in text
        assert 'codex' in text.lower() and 'references' in text.lower()
        assert 'acm reference format' in text.lower(), (profile, 'missing ACM reference block')
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

        # The native single-column review renderer omits visible emails.
        # Structured source retains them; compact rendering must display them.
        marker_fields = ('name', 'email') if 'anonymous' in profile or profile.startswith('compact') else ('name',)
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
    rows.append({'file':path.name,'pages':len(pdf.pages),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size})
report={'status':'LOCAL_DRAFT_VALIDATED_NOT_SUBMITTED','citations':len(keys),'abstract_metadata_matches':True,'all_six_authors_and_order_match':True,'per_author_affiliations_and_email_order_match':True,'standard_author_renderer_source_verified':True,'author_layout':'standard-acm','default_acm_author_renderer':True,'correspondence_in_author_footnote':True,'evidence_hashes_verified':evidence_checked,'class_matches_official_archive':True,'bibliography_style_matches_official_archive':True,'pdfs':rows,'visual_review':'separate review required','submission_authorization':False}
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
