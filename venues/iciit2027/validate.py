"""Validate the draft package; does not authorize submission."""
import hashlib, json, re, sys, zipfile
from pathlib import Path
from pypdf import PdfReader
root = Path(__file__).resolve().parent
expected_authors = ['Vo Duc Hieu', 'Tran Minh Hoang', 'Le Van Kiet', 'Ha Hoang Bach', 'Hoang Nguyen-The', 'Minh Tam Phan']
expected_emails = ['voduchieu42@gmail.com', 'andyjobs2023@gmail.com', 'levankiet1212.2004@gmail.com', 'hahoangbach2005@gmail.com', 'hoangnt20@fe.edu.vn', 'tampm@fe.edu.vn']
expected_orcids = ['0009-0007-5389-5177', '0009-0000-0302-1841', '0009-0007-8434-882X', '0009-0000-5118-0660', None, None]
shared_affiliation = {'department': 'Faculty of Software Engineering', 'institution': 'FPT University HCMC', 'city': 'Ho Chi Minh City', 'postcode': '70000', 'country': 'Vietnam'}

def verify_author_typography(runs):
    # Inspect emitted PDF fonts, not only LaTeX declarations: urlstyle{rm}
    # can silently override ttfamily and an unavailable encoding can fall back.
    for email in expected_emails:
        matches = [(font, size) for text, font, size in runs if email in re.sub(r'\s+', '', text)]
        assert matches, ('missing email font run', email)
        assert all(re.search(r'NimbusMon|Courier|TeXGyreCursor', font, re.I) and 'bold' in font.lower() and abs(size - 10) < .1 for font, size in matches), ('email must render in 10pt bold monospace', email, matches)
    for marker in ['Vo Duc Hieu,', 'Faculty of Software Engineering']:
        matches = [(font, size) for text, font, size in runs if re.sub(r'\s+', '', marker) in re.sub(r'\s+', '', text)]
        assert any(re.search(r'NimbusRom|Times|TeXGyreTermes', font, re.I) and abs(size - 12) < .1 for font, size in matches), ('names and affiliation must render in 12pt Times-style serif', marker)
assert set(sys.argv[1:]) <= {'--check', '--fresh'}, 'unknown validation option'
assert not ('--check' in sys.argv and '--fresh' in sys.argv), 'choose retained or fresh validation'
source = (root/'paper.tex').read_text(encoding='utf-8') + (root/'related-work.tex').read_text(encoding='utf-8')
keys = set(k.strip() for group in re.findall(r'\\cite\{([^}]+)\}', source) for k in group.split(','))
bibkeys = set(re.findall(r'@\w+\{([^,]+),', (root/'references.bib').read_text(encoding='utf-8')))
assert len(keys) == 25 and keys <= bibkeys
for name in ['acmart.cls', 'ACM-Reference-Format.bst']:
    assert (root/name).read_bytes() == (root/'template/LaTeX-Templates'/name).read_bytes()
metadata = json.loads((root/'submission-metadata.json').read_text(encoding='utf-8'))
assert [a['name'] for a in metadata['authors']] == expected_authors, 'owner-confirmed author order drift'
assert [a['email'] for a in metadata['authors']] == expected_emails, 'owner-supplied email drift'
assert [a['orcid'] for a in metadata['authors']] == expected_orcids, 'supplied ORCID mapping drift'
assert [a['name'] for a in metadata['authors'] if a['corresponding_author']] == ['Minh Tam Phan'], 'corresponding author drift'
assert all(all(a[field] == value for field, value in shared_affiliation.items()) for a in metadata['authors']), 'shared affiliation drift'
abstract = re.search(r'\\begin\{abstract\}\s*(.*?)\s*\\end\{abstract\}', (root/'paper.tex').read_text(encoding='utf-8'), re.S).group(1)
assert metadata['abstract'] == abstract.replace('--', '–'), 'abstract metadata drift'
assert metadata['abstract'] in (root/'SUBMISSION-METADATA.md').read_text(encoding='utf-8'), 'copyable abstract drift'
# Verify the complete ordered author block against the copyable submission data.
paper_source = (root/'paper.tex').read_text(encoding='utf-8')
blocks = re.findall(r'\\author\{([^}]+)\}(.*?)(?=\\author\{|\\renewcommand\{\\shortauthors)', paper_source, re.S)
assert [name for name, _ in blocks] == [a['name'] for a in metadata['authors']], 'author order drift'
for (name, block), author in zip(blocks, metadata['authors']):
    for field, macro in [('email','email'),('department','department'),('institution','institution'),('city','city'),('postcode','postcode'),('country','country')]:
        assert '\\' + macro + '{' + author[field] + '}' in block, (name, field)
    orcids = re.findall(r'\\orcid\{([^}]+)\}', block)
    assert orcids == ([author['orcid']] if author['orcid'] else []), (name, 'orcid')
    assert re.findall(r'\\thanks\{Corresponding author: ([^}]+)\.\}', block) == ([name] if author['corresponding_author'] else []), (name, 'correspondence')
    assert name in (root/'SUBMISSION-METADATA.md').read_text(encoding='utf-8'), name
    assert author['email'] in (root/'SUBMISSION-METADATA.md').read_text(encoding='utf-8'), name
assert paper_source.count('\\input{author-layout}') == 1, 'shared author renderer must be included once'
layout = (root/'author-layout.tex').read_text(encoding='utf-8')
assert '\\ifdefined\\blindprofile\\else' in layout and layout.rstrip().endswith('\\fi'), 'custom layout must preserve anonymous renderer'
assert re.findall(r'\\nolinkurl\{([^}]+)\}', layout) == expected_emails, 'visible email order drift'
assert layout.count('\\textsuperscript{*}') == 1 and 'Minh Tam Phan\\textsuperscript{*}' in layout, 'correspondence star drift'
for field in shared_affiliation.values():
    assert field in layout, ('visible affiliation drift', field)
positions = [layout.index(name) for name in expected_authors]
assert positions == sorted(positions), 'visible author order drift'
assert 'VNUK' not in layout and 'ORCID:' not in layout, 'visible block differs from requested shared layout'
assert r'\def\UrlFont{\fontencoding{T1}\fontfamily{pcr}\fontseries{b}\fontsize{10}{12}\selectfont}' in layout, 'explicit email font override required'
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
            for author in metadata['authors']:
                for field in ['name','email','institution','orcid']:
                    if author.get(field):
                        assert re.sub(r'\s+', '', author[field].lower()) not in identity_text, (profile, field)

        for marker in [value for author in metadata['authors'] for value in (author['name'], author['email'])]:
            if 'anonymous' in profile: assert re.sub(r'\s+', '', marker.lower()) not in re.sub(r'\s+', '', text.lower()),(profile,marker)
            else:
                assert re.sub(r'\s+', '', marker.lower()) in re.sub(r'\s+', '', text.lower()),(profile,marker)
        if 'anonymous' not in profile:
            runs = []
            pdf.pages[0].extract_text(visitor_text=lambda text, cm, tm, font, size: runs.append((text, str(font.get('/BaseFont', '')) if font else '', size)))
            verify_author_typography(runs)
            positions = [re.sub(r'\s+', '', text.lower()).index(re.sub(r'\s+', '', name.lower())) for name in expected_authors]
            assert positions == sorted(positions), (profile, 'PDF author order drift')
            first_page = re.sub(r'\s+', '', (pdf.pages[0].extract_text() or '').lower())
            email_positions = [first_page.index(email.lower()) for email in expected_emails]
            assert email_positions == sorted(email_positions), (profile, 'PDF email order drift')
            assert 'minhtamphan*' in first_page, (profile, 'missing corresponding-author star')
            assert 'correspondingauthor:minhtamphan.' in first_page, (profile, 'correspondence footnote drift')
            assert all(re.sub(r'\s+', '', value.lower()) in first_page for value in shared_affiliation.values()), (profile, 'shared affiliation missing')
            assert 'vnuk' not in first_page, (profile, 'old affiliation leaked into new block')
    rows.append({'file':path.name,'pages':len(pdf.pages),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size})
report={'status':'LOCAL_DRAFT_VALIDATED_NOT_SUBMITTED','citations':len(keys),'abstract_metadata_matches':True,'all_six_authors_and_order_match':True,'shared_affiliation_and_email_order_match':True,'author_block_pdf_fonts_verified':True,'author_layout':'owner-requested-centered-shared-affiliation','default_acm_author_renderer':False,'correspondence_in_author_footnote':True,'evidence_hashes_verified':evidence_checked,'class_matches_official_archive':True,'bibliography_style_matches_official_archive':True,'pdfs':rows,'visual_review':'separate review required','submission_authorization':False}
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
elif '--fresh' not in sys.argv:
    (root/'validation.json').write_text(json.dumps(report,indent=2)+'\n', encoding='utf-8', newline='\n')
print(json.dumps(report,indent=2))
