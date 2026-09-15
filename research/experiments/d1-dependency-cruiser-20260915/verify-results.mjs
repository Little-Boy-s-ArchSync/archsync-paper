import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
const directory=path.resolve(process.argv[2]||path.join(root,'results'));
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const freeze=await read(path.join(root,'frozen-manifest.json'));
for(const [p,h]of Object.entries(freeze.file_sha256))assert.equal(createHash('sha256').update(await readFile(path.join(root,p))).digest('hex'),h,p);
const s=await read(path.join(directory,'summary.json'));
assert.equal(s.rows.length,21);assert.equal(s.common_labeled_units,0);
for (const metric of ['precision','recall','f1','agreement','confidence_interval']) assert.equal(s.comparative_metrics[metric],null,metric+' must remain undefined');
const labels = (await read(path.join(root,'inputs/order-platform/ground-truth.json'))).cases;
assert.deepEqual(s.rows.map(r=>r.id).sort(),['baseline',...labels.map(c=>c.id)].sort());
if(directory===path.join(root,'results')) {
 const integrity=await read(path.join(root,'output-integrity.json'));
 for(const [p,h] of Object.entries(integrity)) assert.equal(createHash('sha256').update(await readFile(path.join(root,p))).digest('hex'),h,p);
}

let deps=0,unresolved=0,relationships=0,files=0;
const table=['| Variant | Source files | Cruiser graph nodes | Import dependencies | Unresolved imports | Guardian service relationships |','|---|---:|---:|---:|---:|---:|'];
for(const row of s.rows){
 const dc=await read(path.join(directory,row.id+'-dependency-cruiser.stdout.json'));
 const guardian=await read(path.join(directory,row.id+'-guardian.stdout.json'));
 const nativeDeps=dc.modules.flatMap(m=>m.dependencies||[]);
 assert.equal(dc.modules.length,row['dependency-cruiser'].modules);
 assert.equal(row.common_labeled_units,0);
 assert.equal(nativeDeps.length,row['dependency-cruiser'].dependencies);
 assert.equal(nativeDeps.filter(d=>d.couldNotResolve).length,row['dependency-cruiser'].unresolved_dependencies);
 assert.equal(guardian.relationships.length,row.guardian.relationships);
 for(const tool of ['dependency-cruiser','guardian']) {const run=await read(path.join(directory,row.id+'-'+tool+'.run.json'));assert.equal(run.exit_code,0);assert.equal(run.error,null);assert.equal(run.signal,null);}
 const inputs=await read(path.join(directory,row.id+'-input-hashes.json'));assert.equal(Object.keys(inputs.file_sha256).length,row.source_files);
 if(row.id!=='baseline'){const labels=(await read(path.join(root,'inputs/order-platform/ground-truth.json'))).cases.find(c=>c.id===row.id);assert.deepEqual(inputs.changed_files,[...labels.changed_files].sort());deps+=nativeDeps.length;unresolved+=nativeDeps.filter(d=>d.couldNotResolve).length;relationships+=guardian.relationships.length;files+=row.source_files;}
 table.push(`| ${row.id} | ${row.source_files} | ${dc.modules.length} | ${nativeDeps.length} | ${nativeDeps.filter(d=>d.couldNotResolve).length} | ${guardian.relationships.length} |`);
}
if(process.argv.includes('--write-table')) await writeFile(path.join(directory,'inventory-table.md'),table.join('\n')+'\n');
else assert.equal(await readFile(path.join(directory,'inventory-table.md'),'utf8'),table.join('\n')+'\n','inventory table must match native output');
console.log(JSON.stringify({verified_variants:s.rows.length,successful_tool_executions:42,patched_source_file_instances:files,patched_import_dependencies:deps,patched_unresolved_imports:unresolved,patched_guardian_service_relationships:relationships,shared_labeled_units:0,comparative_metrics:'not estimable'},null,2));
