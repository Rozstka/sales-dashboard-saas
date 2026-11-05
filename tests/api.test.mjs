import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
if (!process.env.TEST_DATABASE_URL) throw new Error('TEST_DATABASE_URL must point to a disposable test database');
process.env.DATABASE_URL=process.env.TEST_DATABASE_URL;
process.env.JWT_SECRET=randomBytes(32).toString('hex');
const { app } = await import('../apps/api/src/app.js');
const { pool, runSchemaFromFile } = await import('../apps/api/src/db.js');
let server, base;
const users=[];
before(async()=>{
  await runSchemaFromFile(new URL('../apps/api/sql/init.sql',import.meta.url));
  server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
  base=`http://127.0.0.1:${server.address().port}/api`;
});
after(async()=>{
  for(const id of users) await pool.query('DELETE FROM users WHERE id=$1',[id]);
  if(server) await new Promise(resolve=>server.close(resolve));
  await pool.end();
});
async function call(path, method='GET', body, token){
 const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});
 return {status:r.status,body:r.status===204?null:await r.text()};
}
test('register/login, isolated CRUD, filters, CSV and validation',async()=>{
 const suffix=randomBytes(6).toString('hex');
 async function register(n){
  const body={fullName:'Test User',email:`${suffix}-${n}@example.invalid`,password:'Strong-test-password'};
  const r=await call('/auth/register','POST',body); assert.equal(r.status,201,r.body);
  const data=JSON.parse(r.body);users.push(data.user.id);
  assert.equal((await call('/auth/login','POST',body)).status,200);
  assert.equal((await call('/auth/register','POST',body)).status,409);
  return data.token;
 }
 const a=await register('a'), b=await register('b');
 assert.equal((await call('/leads')).status,401);
 assert.deepEqual(JSON.parse((await call('/leads','GET',undefined,a)).body),[]);
 const lead={companyName:'=HYPERLINK("bad")',contactName:'Test Contact',status:'new',value:150};
 const created=await call('/leads','POST',lead,a);assert.equal(created.status,201,created.body);
 const id=JSON.parse(created.body).id;
 assert.equal((await call(`/leads/${id}`,'PUT',lead,b)).status,404);
 assert.equal((await call(`/leads/${id}`,'DELETE',undefined,b)).status,404);
 assert.deepEqual(JSON.parse((await call('/leads','GET',undefined,b)).body),[]);
 assert.equal((await call(`/leads/${id}/status`,'PATCH',{status:'won'},a)).status,200);
 assert.equal(JSON.parse((await call('/leads/stats/summary','GET',undefined,a)).body).won_count,1);
 assert.equal(JSON.parse((await call('/leads?status=lost','GET',undefined,a)).body).length,0);
 const csv=await call('/leads/export.csv','GET',undefined,a);assert.equal(csv.status,200);assert.ok(csv.body.includes("'=HYPERLINK"));
 for(const bad of ['1.5','-1','Infinity','2147483648']) assert.equal((await call(`/leads/${bad}`,'DELETE',undefined,a)).status,400);
 assert.equal((await call('/leads','POST',{...lead,value:-1},a)).status,400);
 assert.equal((await call(`/leads/${id}`,'DELETE',undefined,a)).status,204);
 assert.equal((await call('/leads/seed-demo','POST',{},a)).status,201);
 assert.equal((await call('/leads/seed-demo','POST',{},b)).status,201);
 assert.equal((await call('/leads/seed-demo','POST',{replace:true},a)).status,201);
 assert.equal(JSON.parse((await call('/leads','GET',undefined,a)).body).length,6);
 assert.equal(JSON.parse((await call('/leads','GET',undefined,b)).body).length,6);
});
