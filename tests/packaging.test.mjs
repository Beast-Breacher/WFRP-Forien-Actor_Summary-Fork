import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {inflateRawSync} from 'node:zlib';
const root=fileURLToPath(new URL('..',import.meta.url));
const run=(out,args=[],env={})=>spawnSync(process.execPath,['tools/release.mjs','--out',out,...args],{cwd:root,encoding:'utf8',env:{...process.env,GITHUB_REF_TYPE:'',GITHUB_REF_NAME:'',...env}});
function crc32(bytes){let crc=0xffffffff;for(const b of bytes){crc^=b;for(let n=0;n<8;n++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
function unzip(bytes){
  const files=new Map();let offset=0;
  while(bytes.readUInt32LE(offset)===0x04034b50){
    const method=bytes.readUInt16LE(offset+8),crc=bytes.readUInt32LE(offset+14),size=bytes.readUInt32LE(offset+18),rawSize=bytes.readUInt32LE(offset+22);
    const length=bytes.readUInt16LE(offset+26),extra=bytes.readUInt16LE(offset+28),name=bytes.subarray(offset+30,offset+30+length).toString();
    assert.equal(method,8);assert.ok(!name.includes('..')&&!name.startsWith('/'));
    const start=offset+30+length+extra,raw=inflateRawSync(bytes.subarray(start,start+size));
    assert.equal(raw.length,rawSize);assert.equal(crc32(raw),crc);assert.ok(!files.has(name));
    files.set(name,raw);offset=start+size;
  }
  assert.equal(bytes.readUInt32LE(offset),0x02014b50);
  assert.equal(bytes.readUInt32LE(bytes.length-22),0x06054b50);
  assert.equal(bytes.readUInt16LE(bytes.length-12),files.size);
  return files;
}
test('release ZIP is reproducible, valid and contains all manifest resources and preserved data',async()=>{
  const out=await fs.mkdtemp(path.join(os.tmpdir(),'actors-summary-package-'));
  try{
    let result=run(out);assert.equal(result.status,0,result.stderr);
    const zipPath=path.join(out,'forien-actors-summary.zip'),bytes=await fs.readFile(zipPath),files=unzip(bytes);
    const outside=await fs.readFile(path.join(out,'module.json'));
    assert.deepEqual(files.get('module.json'),outside);
    const manifest=JSON.parse(outside);
    for(const file of [...manifest.esmodules,...manifest.styles,...manifest.languages.map(l=>l.path),'compatibility.js','LICENSE']) assert.ok(files.has(file),file);
    for(const file of ['000003.log','CURRENT','MANIFEST-000002']){
      const relative='packs/filter-presets/'+file;
      assert.deepEqual(files.get(relative),await fs.readFile(path.join(root,relative)));
    }
    assert.ok(![...files.keys()].some(name=>/(?:^|\/)(?:LOCK|LOG|LOG.old)$|^tests\/|^tools\/|\.js\.map$/.test(name)));
    assert.equal(manifest.download,`https://github.com/Beast-Breacher/WFRP-Forien-Actor_Summary-Fork/releases/download/v${manifest.version}/forien-actors-summary.zip`);
    assert.equal(manifest.compatibility.minimum,'11');assert.equal(manifest.compatibility.maximum,'14');
    result=run(out);assert.equal(result.status,0,result.stderr);
    assert.deepEqual(await fs.readFile(zipPath),bytes);
  }finally{await fs.rm(out,{recursive:true,force:true});}
});
test('repository override updates both manifests; tag mismatch and invalid repo fail',async()=>{
  const out=await fs.mkdtemp(path.join(os.tmpdir(),'actors-summary-repo-'));
  try{
    const result=run(out,['--repo','test-owner/test-repo']);assert.equal(result.status,0,result.stderr);
    const files=unzip(await fs.readFile(path.join(out,'forien-actors-summary.zip'))),outside=await fs.readFile(path.join(out,'module.json'));
    assert.deepEqual(files.get('module.json'),outside);
    const manifest=JSON.parse(outside);
    for(const key of ['url','manifest','download','bugs','readme','changelog']) assert.ok(manifest[key].startsWith('https://github.com/test-owner/test-repo'),key);
    assert.notEqual(run(out,[],{GITHUB_REF_TYPE:'tag',GITHUB_REF_NAME:'v999.0.0'}).status,0);
    assert.notEqual(run(out,['--repo','not a repository']).status,0);
  }finally{await fs.rm(out,{recursive:true,force:true});}
});
