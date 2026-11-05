import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker from './index.js';
function fixture(){
 const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('../migrations/0001_notes.sql',import.meta.url),'utf8'));
 const db={prepare(query){let args=[];return {bind(...a){args=a;return this;},async all(){return {results:sql.prepare(query).all(...args)};},async first(){return sql.prepare(query).get(...args)||null;},async run(){return {meta:sql.prepare(query).run(...args)};}};}};
 return {sql,env:{DB:db}};
}
test('latest 30, backfill, deterministic order and browser ownership',async()=>{
 const {sql,env}=fixture();const session='a'.repeat(64);const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(session));const owner=Buffer.from(bytes).toString('hex');
 for(let i=0;i<31;i++){
 sql.prepare('INSERT INTO notes(id,text,name,x,y,owner,submission,status) VALUES(?,?,?,?,?,?,?,?)').run(String(i),'Hello','',0.5,0.5,owner,String(i),'pending');
 sql.prepare("UPDATE notes SET status='published' WHERE id=?").run(String(i));
 }
 const request=(path,options={})=>new Request('https://test.example'+path,options);
 let r=await worker.fetch(request('/api/notes'),env);let notes=await r.json();assert.equal(notes.length,30);assert.equal(notes[0].id,'30');assert.equal(notes[0].canDelete,false);assert.ok(!('owner' in notes[0]));
 r=await worker.fetch(request('/api/notes/30',{method:'DELETE',headers:{Origin:'https://test.example'}}),env);assert.equal(r.status,404);
 r=await worker.fetch(request('/api/notes/30',{method:'DELETE',headers:{Origin:'https://test.example',Cookie:'__Host-notes='+session}}),env);assert.equal(r.status,200);
 notes=await(await worker.fetch(request('/api/notes',{headers:{Cookie:'__Host-notes='+session}}),env)).json();assert.equal(notes.length,30);assert.equal(notes.at(-1).id,'0');assert.equal(notes[0].canDelete,true);
});
test('pending/rejected privacy and cross-origin rejection',async()=>{
 const {sql,env}=fixture();sql.prepare('INSERT INTO notes(id,text,name,x,y,owner,submission,status) VALUES(?,?,?,?,?,?,?,?)').run('p','Hello','',0,0,'owner','s','pending');
 assert.deepEqual(await(await worker.fetch(new Request('https://test.example/api/notes'),env)).json(),[]);
 assert.equal((await worker.fetch(new Request('https://test.example/api/notes/p',{method:'DELETE',headers:{Origin:'https://other.example'}}),env)).status,403);
 assert.equal((await worker.fetch(new Request('https://test.example/api/admin/notes'),env)).status,401);
});
