"""Validate the draft package; does not authorize submission."""
import hashlib, json, re
from pathlib import Path
from pypdf import PdfReader
root = Path(__file__).resolve().parent
source = (root/'paper.tex').read_text() + (root/'related-work.tex').read_text()
keys = set(k.strip() for group in re.findall(r'\\cite\{([^}]+)\}', source) for k in group.split(','))
bibkeys = set(re.findall(r'@\w+\{([^,]+),', (root/'references.bib').read_text()))
assert len(keys) == 25 and keys <= bibkeys
for name in ['acmart.cls', 'ACM-Reference-Format.bst']:
    assert (root/name).read_bytes() == (root/'template/LaTeX-Templates'/name).read_bytes()
metadata = json.loads((root/'submission-metadata.json').read_text())
abstract = re.search(r'\\begin\{abstract\}\s*(.*?)\s*\\end\{abstract\}', (root/'paper.tex').read_text(), re.S).group(1)
assert metadata['abstract'] == abstract.replace('--', '–'), 'abstract metadata drift'
assert metadata['abstract'] in (root/'SUBMISSION-METADATA.md').read_text(), 'copyable abstract drift'
# Verify the complete ordered author block against the copyable submission data.
paper_source = (root/'paper.tex').read_text()
blocks = re.findall(r'\\author\{([^}]+)\}(.*?)(?=\\author\{|\\renewcommand\{\\shortauthors)', paper_source, re.S)
assert [name for name, _ in blocks] == [a['name'] for a in metadata['authors']], 'author order drift'
for (name, block), author in zip(blocks, metadata['authors']):
    for field, macro in [('email','email'),('institution','institution'),('city','city'),('country','country')]:
        assert '\\' + macro + '{' + author[field] + '}' in block, (name, field)
    orcids = re.findall(r'\\orcid\{([^}]+)\}', block)
    assert orcids == ([author['orcid']] if author['orcid'] else []), (name, 'orcid')
    assert ('\\thanks{Corresponding author: Vo Duc Hieu.}' in block) == author['corresponding_author'], (name, 'correspondence')
    assert name in (root/'SUBMISSION-METADATA.md').read_text(), name
    assert author['email'] in (root/'SUBMISSION-METADATA.md').read_text(), name
layout = (root/'author-layout.tex').read_text()
institutions = [author['institution'] for author in metadata['authors']]
assert institutions == [institutions[0]] * 4 + [institutions[-1]] * 2, 'authors are not grouped by university in metadata order'
assert '\\textsuperscript{1}FPT University' in layout
assert '\\textsuperscript{2}VNUK Institute for Research and Executive Education' in layout
assert layout.count('\\textit{Email:}') == 2, 'expected one grouped email line per university'
for author in metadata['authors']:
    for value in [author['name'], author['email']]:
        if value: assert value in layout, ('display metadata drift', value)
evidence_checked = False
if (root/'evidence').is_dir():
    manifest = json.loads((root/'evidence-manifest.json').read_text())
    for item in manifest['files']:
        assert hashlib.sha256((root/item['path']).read_bytes()).hexdigest() == item['sha256'], item['path']
    for claim in json.loads((root/'CLAIM-EVIDENCE.json').read_text())['claims']:
        for artifact in claim['artifacts']:
            assert any(item['path'] == artifact for item in manifest['files']), artifact
    evidence_checked = True
rows=[]
for profile in ['review','compact','review-anonymous','compact-anonymous','supplement']:
    path=root/f'iciit2027-{profile}.pdf'
    pdf=PdfReader(path); text='\n'.join(p.extract_text() or '' for p in pdf.pages)
    log=(root/f'{profile}-build.log').read_text()
    assert not re.search(r'Overfull|There were undefined|Citation .* undefined|Reference .* undefined|error:',log), profile
    if profile != 'supplement':
        minimum,maximum=(4,5) if profile.startswith('compact') else (8,10)
        assert minimum <= len(pdf.pages) <= maximum, (profile,len(pdf.pages))
        assert '786,432' in text and '315' in text and '126' in text
        assert 'codex' in text.lower() and 'references' in text.lower()
        if 'anonymous' in profile:
            identity_text = re.sub(r'\s+', '', (text + str(pdf.metadata)).lower())
            for author in metadata['authors']:
                for field in ['name','email','institution','orcid']:
                    if author.get(field):
                        assert re.sub(r'\s+', '', author[field].lower()) not in identity_text, (profile, field)

        for marker in [value for author in metadata['authors'] for value in (author['name'], author['email'])]:
            if 'anonymous' in profile: assert re.sub(r'\s+', '', marker.lower()) not in re.sub(r'\s+', '', text.lower()),(profile,marker)
            else: assert re.sub(r'\s+', '', marker.lower()) in re.sub(r'\s+', '', text.lower()),(profile,marker)
    rows.append({'file':path.name,'pages':len(pdf.pages),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size})
report={'status':'LOCAL_DRAFT_VALIDATED_NOT_SUBMITTED','citations':len(keys),'abstract_metadata_matches':True,'all_six_authors_and_order_match':True,'correspondence_in_author_footnote':True,'evidence_hashes_verified':evidence_checked,'class_matches_official_archive':True,'bibliography_style_matches_official_archive':True,'pdfs':rows,'visual_review':'separate review required','submission_authorization':False}
(root/'validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
