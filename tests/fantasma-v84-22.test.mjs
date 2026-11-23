import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = n => readFileSync(new URL(`../web/${n}`, import.meta.url),'utf8');
test('Halloween: ciclo de 15 segundos igual no CSS e no JavaScript',()=>{
 const js=read('scene-v63-player.js'), css=read('scene-v64.css');
 assert.match(js,/const GHOST_CYCLE_MS=15000/);
 assert.match(css,/v64-ghost-minute 15s ease-in-out infinite/);
 assert.match(js,/Math\.floor\(Math\.max\(0,elapsed\)\/GHOST_CYCLE_MS\)/);
 assert.match(js,/ghostPhase/);
 assert.doesNotMatch(js,/ghostAge>=7200/);
});
