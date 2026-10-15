import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateMarks} from '../src/utils/grading';
import {csvCell} from '../src/utils/csv';
import {StudentService} from '../src/services/studentService';
import {apiClient, ApiError} from '../src/services/apiClient';

test('grading boundaries match Flask rules',()=>{
  for(const [marks,grade] of [[0,'Fail'],[39.99,'Fail'],[40,'Pass'],[50,'B'],[60,'B+'],[70,'A'],[80,'A+'],[90,'O'],[100,'O']] as const){
    assert.equal(evaluateMarks(marks).grade,grade);
    assert.equal(evaluateMarks(marks).isPass,marks>=40);
    assert.equal(evaluateMarks(marks).isDistinction,marks>=80);
  }
});
test('CSV escapes quotes, commas, newlines and neutralizes formulas',()=>{
  assert.equal(csvCell('A "quoted", name\nline'),'"A ""quoted"", name\nline"');
  for(const text of ['=SUM(A1:A2)','+cmd','-cmd','@cmd','  =cmd','\tcmd','\rcmd'])assert.equal(csvCell(text),'"\''+text+'"');
  assert.equal(csvCell(88.5),'"88.5"');
});
test('getAll traverses every backend page instead of silently truncating',async()=>{
  const original = globalThis.fetch;
  const pages:number[]=[];
  globalThis.fetch = async (input)=>{
    const page = Number(new URL(String(input)).searchParams.get('page'));pages.push(page);
    return new Response(JSON.stringify({students:[{id:page}],total:3,page,page_size:1,total_pages:3}),{headers:{'Content-Type':'application/json'}});
  };
  try{assert.deepEqual((await StudentService.getAll()).map(s=>s.id),[1,2,3]);assert.deepEqual(pages,[1,2,3]);}finally{globalThis.fetch=original;}
});
test('roll availability uses exact roll query even for numeric rolls; failures propagate',async()=>{
  const original=globalThis.fetch;
  globalThis.fetch=async input=>{
    assert.equal(new URL(String(input)).searchParams.get('roll_number'),'123');
    return new Response(JSON.stringify({students:[{id:7}]}),{headers:{'Content-Type':'application/json'}});
  };
  try{
    assert.equal(await StudentService.checkRollNumberExists('123'),true);
    assert.equal(await StudentService.checkRollNumberExists('123',7),false);
    globalThis.fetch=async()=>new Response(JSON.stringify({message:'Unavailable'}),{status:503,headers:{'Content-Type':'application/json'}});
    await assert.rejects(StudentService.checkRollNumberExists('123'), /Unavailable/);
  }finally{globalThis.fetch=original;}
});
test('HTTP 404 alone means missing; server failures are not empty records',async()=>{
  const original=globalThis.fetch;
  try{
    globalThis.fetch=async()=>new Response(JSON.stringify({message:'Student not found'}),{status:404,headers:{'Content-Type':'application/json'}});
    assert.equal(await StudentService.getById(9),null);
    globalThis.fetch=async()=>new Response(JSON.stringify({message:'Database unavailable'}),{status:503,headers:{'Content-Type':'application/json'}});
    await assert.rejects(StudentService.getById(9),error=>error instanceof ApiError&&error.status===503);
  }finally{globalThis.fetch=original;}
});
test('in-flight mutation lock prevents duplicates and releases after failure',async()=>{
  const original=globalThis.fetch;
  let release:()=>void;
  const gate=new Promise<void>(resolve=>release=resolve);
  globalThis.fetch=async()=>{await gate;return new Response(JSON.stringify({message:'Rejected'}),{status:409,headers:{'Content-Type':'application/json'}});};
  try{
    const pending=apiClient.post('/students',{name:'Synthetic'});
    const rejection=assert.rejects(pending,/Rejected/);
    await assert.rejects(apiClient.post('/students',{name:'Synthetic'}),/already in progress/);
    release!();await rejection;
    globalThis.fetch=async()=>new Response('{}',{headers:{'Content-Type':'application/json'}});
    assert.deepEqual(await apiClient.post('/students',{}),{});
  }finally{globalThis.fetch=original;}
});
