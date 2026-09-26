"""Package exact local draft assets without diagnostic or download-cache files."""
from pathlib import Path
import hashlib,json,zipfile
root=Path(__file__).resolve().parent
source_names=['paper.tex','related-work.tex','appendix.tex','references.bib','acmart.cls','acmart.dtx','ACM-Reference-Format.bst','build.sh','validate.py','README.md','REQUIREMENTS.md','SUBMISSION-METADATA.md','submission-metadata.json','validation.json','evidence-manifest.json','VISUAL-REVIEW.md','visual-inputs.json','official/retrieval.json','template/LaTeX-Templates/acmart.cls','template/LaTeX-Templates/ACM-Reference-Format.bst']
profiles=['review','compact','review-anonymous','compact-anonymous','supplement']
for profile in profiles:source_names += [f'iciit2027-{profile}.tex',f'iciit2027-{profile}.pdf',f'{profile}-build.log']
artifacts=[]
for name,files in [('archsync-iciit2027-source.zip',[root/p for p in source_names]),('archsync-iciit2027-evidence.zip',sorted((root/'evidence').rglob('*'))+[root/'evidence-manifest.json'])]:
 with zipfile.ZipFile(root/name,'w',zipfile.ZIP_DEFLATED) as z:
  for path in files:
   if path.is_file():z.write(path,path.relative_to(root))
 with zipfile.ZipFile(root/name) as z:assert z.testzip() is None
 artifacts.append({'file':name,'sha256':hashlib.sha256((root/name).read_bytes()).hexdigest(),'bytes':(root/name).stat().st_size})
manifest={'status':'draft-package-not-submitted','archives':artifacts,'source_files':[{'path':p,'sha256':hashlib.sha256((root/p).read_bytes()).hexdigest()} for p in source_names]}
(root/'package-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(artifacts,indent=2))
