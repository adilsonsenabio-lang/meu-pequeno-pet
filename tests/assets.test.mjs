import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat,readdir} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const web=resolve(import.meta.dirname,'../web');
test('HTML, CSS e JS principais existem',async()=>{
 for(const name of ['index.html','app.js','core.js','storage.js','atelier.js','world.js','pixel-pet.js','game.css','retro.css'])assert.ok((await stat(join(web,name))).isFile(),name);
});
test('importacoes JS locais resolvem dentro de web/',async()=>{
 const files=(await readdir(web)).filter(x=>x.endsWith('.js'));
 for(const name of files){
  const txt=await readFile(join(web,name),'utf8');
  for(const m of txt.matchAll(/\bfrom\s+['"](\.\/[^'"?]+)(?:\?[^'"]*)?['"]/g))assert.ok((await stat(resolve(web,m[1]))).isFile(),`${name} -> ${m[1]}`);
 }
});
test('inventario da V54: 3 de 14 arquivos de vozes listados presentes',async()=>{
 const txt=await readFile(join(web,'need-audio.js'),'utf8');
 const voices=[...txt.matchAll(/['"](\.\/assets\/voice-[^'"]+\.mp3)['"]/g)].map(m=>m[1]);
 let present=0;for(const v of voices)try{await stat(resolve(web,v));present++;}catch{}
 assert.equal(voices.length,14);assert.equal(present,3);
});
