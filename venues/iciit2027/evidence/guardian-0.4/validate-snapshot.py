from pathlib import Path
import subprocess,os,tempfile,shutil,json,hashlib
root=Path(__file__).resolve().parents[2]; repo=root/'archsync-guardian'; out=Path(__file__).resolve().parent
env=dict(os.environ);env['PATH']='/Users/andytran/.npm/_npx/2ad0c2d1aba2dd61/node_modules/node/bin:'+env['PATH'];env['CI']='true'
snapshot=Path(tempfile.mkdtemp(prefix='archsync-write-target-validation-'))/'guardian'
subprocess.run(['git','clone','--quiet','--no-hardlinks',str(repo),str(snapshot)],check=True)
patch=subprocess.check_output(['git','diff','--binary','HEAD'],cwd=repo)
subprocess.run(['git','apply','--binary'],cwd=snapshot,input=patch,check=True)
subprocess.run(['git','add','-A'],cwd=snapshot,check=True)
subprocess.run(['git','-c','user.name=Local validation','-c','user.email=validation@archsync.invalid','commit','--quiet','-m','Validate binding-write invalidation candidate'],cwd=snapshot,check=True)
receipt={'snapshot':str(snapshot),'commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=snapshot).decode().strip(),'checks':[]}
for name,cmd in [('install',['pnpm','install','--frozen-lockfile','--ignore-scripts']),('verify',['pnpm','verify'])]:
 with (out/f'snapshot-{name}.log').open('w') as log: r=subprocess.run(cmd,cwd=snapshot,env=env,stdout=log,stderr=subprocess.STDOUT)
 receipt['checks'].append({'name':name,'exit_code':r.returncode})
 (out/'snapshot-validation.json').write_text(json.dumps(receipt,indent=2)+'\n')
 if r.returncode: raise SystemExit(r.returncode)
files=subprocess.check_output(['git','ls-files','-z'],cwd=repo).decode().split('\0');mismatches=[]
for name in files:
 if name and (repo/name).is_file() and (repo/name).read_bytes()!=(snapshot/name).read_bytes(): mismatches.append(name)
receipt['source_mismatches']=mismatches
receipt['files_compared']=len([n for n in files if n])
(out/'snapshot-validation.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt))
if mismatches: raise SystemExit(1)
