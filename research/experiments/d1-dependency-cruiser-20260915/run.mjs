import {readFile,writeFile,readdir,cp,mkdir,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
const hash=b=>createHash('sha256').update(b).digest('hex');
async function files(dir){let out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await files(p));else out.push(p);}return out.sort();}
const freeze=JSON.parse(await readFile(path.join(root,'frozen-manifest.json'),'utf8'));
for(const [p,h] of Object.entries(freeze.file_sha256))if(hash(await readFile(path.join(root,p)))!==h)throw Error('Frozen input changed: '+p);
const out=path.resolve(process.argv[2]||path.join(root,'results'));
try{await mkdir(out);}catch(e){throw Error('Output directory must be new: '+out);}
const manifest=JSON.parse(await readFile(path.join(root,'inputs/order-platform/ground-truth.json'),'utf8'));
const run=(program,args,cwd)=>{const start=performance.now();const r=spawnSync(program,args,{cwd,encoding:'utf8',timeout:60000,maxBuffer:20*1024*1024});return {program,args,cwd,elapsed_ms:performance.now()-start,exit_code:r.status,signal:r.signal,error:r.error?.message||null,stdout:r.stdout||'',stderr:r.stderr||''};};
const rows=[];
for(const scenario of [{id:'baseline'},...manifest.cases]){
 const work=path.join(root,'work',scenario.id);await rm(work,{recursive:true,force:true});await mkdir(path.dirname(work),{recursive:true});
 await cp(path.join(root,'inputs/order-platform/repository'),work,{recursive:true});
 if(scenario.patch){const patch=run('git',['apply','--unsafe-paths',path.join(root,'inputs/order-platform',scenario.patch)],work);await writeFile(path.join(out,scenario.id+'-patch.json'),JSON.stringify(patch,null,2)+'\n');if(patch.exit_code!==0)throw Error('Patch failed '+scenario.id);}
 const before=Object.fromEntries(await Promise.all((await files(work)).map(async p=>[path.relative(work,p),hash(await readFile(p))])));
 const tools={
  'dependency-cruiser':[path.join(root,'node_modules/dependency-cruiser/bin/dependency-cruiser.mjs'),'--config',path.join(root,'dependency-cruiser.cjs'),'--output-type','json','.'],
  'guardian':[path.join(root,'node_modules/@archsync/guardian/dist/bin.js'),'scan',path.join(root,'inputs/order-platform/architecture.yaml'),work]
 };
 const row={id:scenario.id,source_files:Object.keys(before).length,common_labeled_units:0};
 for(const [name,args]of Object.entries(tools)){
  const result=run(process.execPath,args,work);await writeFile(path.join(out,scenario.id+'-'+name+'.run.json'),JSON.stringify({...result,stdout:undefined,stderr:undefined},null,2)+'\n');
  await writeFile(path.join(out,scenario.id+'-'+name+'.stdout.json'),result.stdout);await writeFile(path.join(out,scenario.id+'-'+name+'.stderr.txt'),result.stderr);
  row[name]={exit_code:result.exit_code,error:result.error};
  if(result.exit_code===0){try{const data=JSON.parse(result.stdout);if(name==='dependency-cruiser'){const deps=data.modules.flatMap(m=>m.dependencies||[]);Object.assign(row[name],{modules:data.modules.length,dependencies:deps.length,unresolved_dependencies:deps.filter(d=>d.couldNotResolve).length});}else Object.assign(row[name],{components:data.components.length,relationships:data.relationships.length});}catch(e){row[name].parse_error=e.message;}}
 }
 for(const [p,h]of Object.entries(before))if(hash(await readFile(path.join(work,p)))!==h)throw Error('Tool mutated input '+scenario.id+'/'+p);
 rows.push(row);await rm(work,{recursive:true,force:true});
}
const summary={protocol:'D1 external-tool capability/inventory amendment v1',frozen_manifest_sha256:hash(await readFile(path.join(root,'frozen-manifest.json'))),created_at:new Date().toISOString(),environment:{node:process.version,platform:process.platform,arch:process.arch},common_labeled_units:0,comparative_metrics:{precision:null,recall:null,f1:null,agreement:null,confidence_interval:null,reason:'No shared labeled module dependency units in D1; unsupported service relations excluded, not scored as false negatives.'},rows};
await writeFile(path.join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({output:out,variants:rows.length,tool_failures:rows.flatMap(r=>[r['dependency-cruiser'],r.guardian]).filter(x=>x.exit_code!==0||x.parse_error).length,common_labeled_units:0},null,2));
