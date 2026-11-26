import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker from './index.js';

function fixture(env={}){
 const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('../migrations/0002_feud.sql',import.meta.url),'utf8'));
 const db={prepare(query){let args=[];return {bind(...a){args=a;return this;},async first(){return sql.prepare(query).get(...args)||null;},async run(){return {meta:sql.prepare(query).run(...args)};}};}};
 return {DB:db,FEUD_PASSWORD:'hunter2',...env};
}
const call=(env,method,body,origin='https://test.example')=>worker.fetch(new Request('https://test.example/api/feud',{method,headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(body)}),env);

test('password gates reading and saving; answers come back sorted',async()=>{
 const env=fixture();
 assert.equal((await call(env,'POST',{password:'nope'})).status,401);
 assert.equal((await call(env,'PUT',{password:'nope',rounds:[]})).status,401);
 assert.deepEqual(await(await call(env,'POST',{password:'hunter2'})).json(),{rounds:[]});
 const rounds=[{question:' Q? ',answers:[{text:'low',points:3},{text:' high ',points:40}]}];
 const saved=await call(env,'PUT',{password:'hunter2',rounds});
 assert.equal(saved.status,200);
 const expected={rounds:[{question:'Q?',answers:[{text:'high',points:40},{text:'low',points:3}]}]};
 assert.deepEqual(await saved.json(),expected);
 assert.deepEqual(await(await call(env,'POST',{password:'hunter2'})).json(),expected);
});

test('rejects bad rounds, other origins, and an unset password',async()=>{
 const env=fixture();
 for(const rounds of [null,[{question:'',answers:[{text:'a',points:1}]}],[{question:'Q',answers:[]}],[{question:'Q',answers:[{text:'a',points:101}]}],[{question:'Q',answers:[{text:'a',points:1.5}]}],[{question:'Q',answers:Array(9).fill({text:'a',points:1})}]])
  assert.equal((await call(env,'PUT',{password:'hunter2',rounds})).status,400);
 assert.equal((await call(env,'POST',{password:'hunter2'},'https://other.example')).status,403);
 assert.equal((await call(fixture({FEUD_PASSWORD:''}),'POST',{password:''})).status,503);
});
