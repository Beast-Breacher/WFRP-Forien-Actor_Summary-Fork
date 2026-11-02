import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {addSummaryControl, worldActorFromDrop, readStoredObject, normalizePerRow} from '../compatibility.js';

const source=await fs.readFile(new URL('../forien-actors-summary.js',import.meta.url),'utf8');
const warnings=[];
class Actor {constructor(){this.system={name:'<b>Scout</b>',values:[1,[2,3]],enabled:false};}}
const context=vm.createContext({Actor,TextEditor:{previewHTML:s=>s.replace(/<[^>]+>/g,'').slice(0,100)},
  foundry:{utils:{getProperty:(object,path)=>path.split('.').reduce((v,k)=>v?.[k],object)}},
  game:{i18n:{localize:s=>s,format:(s,params)=>s+JSON.stringify(params)}},
  Utility:{notify:(...args)=>warnings.push(args),error:(...args)=>warnings.push(args)}});
vm.runInContext(source.slice(source.indexOf('class SummaryUtility {'), source.indexOf('const ActorFilterItem_'))+';globalThis.utility=SummaryUtility;',context);
const utility=context.utility;
const plain=value=>JSON.parse(JSON.stringify(value));
const drop=value=>({dataTransfer:{getData:()=>value}});

test('old and new scene controls call toggleApp with a boolean and stay unique',async()=>{
  for (const controls of [[{name:'token',tools:[]}],{tokens:{tools:{select:{name:'select'}}}}]) {
    const values=[], api={toggleApp:async value=>values.push(value)};
    addSummaryControl(controls,api,true);addSummaryControl(controls,api,false);
    const tools=Array.isArray(controls)?controls[0].tools:controls.tokens.tools;
    const tool=Array.isArray(tools)?tools[0]:tools.openActorsSummaryApp;
    assert.equal(tool.active,false);
    assert.equal(Object.values(tools).filter(t=>t.name==='openActorsSummaryApp').length,1);
    if (tool.onChange) {await tool.onChange({},true);await tool.onChange({},false);assert.equal(tool.order,1);}
    else {await tool.onClick(true);await tool.onClick(false);}
    assert.deepEqual(values,[true,false]);
  }
});
test('missing token controls cause no exception',()=>{
  for(const value of [undefined,null,{},[],{tokens:{}}]) assert.doesNotThrow(()=>addSummaryControl(value,{},true));
});
test('drop accepts world actors; rejects invalid JSON and other document UUIDs',()=>{
  const actor={id:'abc'},actors=new Map([['abc',actor]]);
  assert.equal(worldActorFromDrop(drop('{"type":"Actor","uuid":"Actor.abc"}'),actors),actor);
  for(const value of ['', 'text', '{}','null','[]',
    '{"type":"Actor","uuid":"Actor.missing"}',
    '{"type":"Actor","uuid":"Scene.abc.Token.xyz"}',
    '{"type":"Actor","uuid":"Compendium.pack.Actor.abc"}',
    '{"type":"Actor","uuid":"Actor.abc.Item.xyz"}',
    '{"type":"Item","uuid":"Actor.abc"}']) assert.equal(worldActorFromDrop(drop(value),actors),undefined);
  assert.equal(worldActorFromDrop({},actors),undefined);
});
test('session state tolerates missing, corrupt and wrong-type values',()=>{
  for(const value of [null,'bad','null','[]','false','"text"','12']) assert.deepEqual(readStoredObject({getItem:()=>value},'key'),{});
  assert.deepEqual(readStoredObject({getItem:()=>'{"actor":true}'},'key'),{actor:true});
  assert.deepEqual(readStoredObject({getItem:()=>{throw Error('Denied');}},'key'),{});
});
test('column count stays within existing CSS layouts',()=>{
  for(const [input,expected] of [[0,1],[-8,1],[99,6],[3.8,3],['4',4],['bad',2],[Infinity,2],[NaN,2]]) assert.equal(normalizePerRow(input),expected);
});
test('names without a match or capture group retain original text',()=>{
  assert.equal(utility.getFirstRegexGroup('Scout','(Scout)'),'Scout');
  assert.equal(utility.getFirstRegexGroup('Scout','(Wizard)'),'Scout');
  assert.equal(utility.getFirstRegexGroup('Scout','Scout'),'Scout');
  assert.equal(utility.getFirstRegexGroup('Scout','['),'Scout');
  assert.equal(utility.getFirstRegexGroup('Career: Scout','Career: (.*)'),'Scout');
});
test('additional values flatten nested arrays, round numbers and support booleans',()=>{
  assert.deepEqual(plain(utility.parseAdditionalValue([1,[2,['<b>Scout</b>',false]],null,1.236])),[1,2,'Scout','false',1.24]);
  assert.deepEqual(plain(utility.parseAdditionalValue(undefined)),[]);
  assert.throws(()=>utility.parseAdditionalValue({value:1}));
  assert.throws(()=>utility.parseAdditionalValue(Infinity));
  const cyclic=[];cyclic.push(cyclic);assert.throws(()=>utility.parseAdditionalValue(cyclic));
});
test('attributes skip empty lines and accept whitespace around paths',()=>{
  assert.deepEqual(plain(utility.parseAttributes(new Actor(),'\n system.name |Career\n\n system.enabled |Enabled')),['Career Scout','Enabled false']);
  assert.deepEqual(plain(utility.parseAttributes(undefined,'system.name')),[]);
});
test('optional additional fields and missing properties are harmless',()=>{
  assert.deepEqual(plain(utility.parseAdditional({},{})),[]);
  assert.deepEqual(plain(utility.parseAdditional({additional:' , system.value|Value, item.system.flag|Flag, missing'},{system:{value:42,flag:false}})),['Value 42','Flag false']);
});
test('callbacks preserve original item argument and recover from syntax/runtime errors',()=>{
  const values=[{name:'Scout'},{name:'Wizard'}];
  assert.equal(utility.applyFilter(values,'item.name === "Scout"')[0],values[0]);
  assert.deepEqual(plain(utility.applyFilter(values,'(')),[]);
  assert.deepEqual(plain(utility.applyFilter(values,'item.noSuchMethod()')),[]);
  assert.deepEqual(plain(utility.applyFilter(undefined,'true')),[]);
});

test('bundle releases the document store and handles a deleted actor during notification',()=>{
  // Exercise the original compiled component initializer with its Svelte wiring stubbed.
  const start=source.indexOf('function instance$5('),end=source.indexOf('\nclass ActorSummary ',start);
  let mount,destroyed=0,current,notifier;
  const storage={subscribe:fn=>{fn({});return ()=>{};}};
  const ctx=vm.createContext({noop:()=>{},writable:()=>({}),
    subscribe:(_store,fn)=>{notifier=fn;return ()=>{};},createEventDispatcher:()=>()=>{},
    getContext:key=>key==='filtersModel'?{}:{application:{reactive:{sessionStorage:{getStore:()=>storage}}}},
    component_subscribe:()=>{},onMount:fn=>mount=fn,
    game:{actors:new Map()},constants:{sessionStorage:{appDataCollapsed:'collapsed'}},
    TJSDocument:class{destroy(){destroyed++;}},set_store_value:()=>{},
  });
  vm.runInContext(source.slice(start,end)+';globalThis.initActor=instance$5;',ctx);
  ctx.initActor({$$:{on_destroy:[]}}, {actorId:'gone'},(_index,value)=>{current=value;return value;});
  const cleanup=mount();notifier(undefined);assert.deepEqual(plain(current),{});
  cleanup();assert.equal(destroyed,1);
});

test('compiled summary shell ignores stale IDs, clamps columns and recovers after bad drops',async()=>{
  const {worldActorFromDrop,normalizePerRow}=await import('../compatibility.js');
  const updates=new Map();let actorsValue=['present','gone','present'];
  class Actor {constructor(){this.id='present';}}
  const actors={subscribe:fn=>{fn(actorsValue);return ()=>{};},set:value=>actorsValue=value};
  const ctx=vm.createContext({noop:()=>{},Actor,normalizePerRow,worldActorFromDrop,
    subscribe:(store,fn)=>store.subscribe(fn),
    getContext:()=>({application:{reactive:{sessionStorage:{getStore:()=>({})}},position:{},state:{get:()=>({})}}}),
    component_subscribe:()=>{},setContext:()=>{},Timing:{debounce:fn=>fn},set_store_value:()=>{},
    constants:{sessionStorage:{appState:'state'}},game:{actors:new Map([['present',new Actor()]])},
  });
  const start=source.indexOf('function instance$4('),end=source.indexOf('\nclass ActorsSummaryAppShell ',start);
  vm.runInContext(source.slice(start,end)+';globalThis.initShell=instance$4;',ctx);
  const values=ctx.initShell({$$:{on_destroy:[]}}, {actors,filtersModel:{},perRow:{subscribe:fn=>{fn(999);return ()=>{};}}},(index,value)=>{updates.set(index,value);return value;});
  assert.deepEqual(plain(updates.get(3)),['present']);assert.equal(updates.get(5),6);
  const dropHandler=values[8];let prevented=0;
  await dropHandler({...drop('invalid'),preventDefault:()=>prevented++});
  assert.equal(prevented,1);assert.equal(updates.get(12),false);
  await dropHandler({...drop('{"type":"Actor","uuid":"Actor.present"}'),preventDefault(){}});
  assert.deepEqual(plain(actorsValue),['present']);
});

test('compatibility aliases support legacy globals and modern namespaced APIs',async()=>{
  const helper=await fs.readFile(new URL('../compatibility.js',import.meta.url),'utf8');
  for(const modern of [false,true]) {
    const A=class{},D=class{},Actor=class{},editor={previewHTML:()=>''};
    const sandbox=vm.createContext(modern?{foundry:{appv1:{api:{Application:A,Dialog:D}},documents:{Actor},applications:{ux:{TextEditor:{implementation:editor}}}}}:{Application:A,Dialog:D,Actor,TextEditor:editor});
    vm.runInContext(helper.replaceAll('export ', '')+';globalThis.result={Application,Dialog,Actor,TextEditor,MIN_WINDOW_HEIGHT,MIN_WINDOW_WIDTH};',sandbox);
    assert.equal(sandbox.result.Application,A);assert.equal(sandbox.result.Dialog,D);
    assert.equal(sandbox.result.Actor,Actor);assert.equal(sandbox.result.TextEditor,editor);
    assert.equal(sandbox.result.MIN_WINDOW_HEIGHT,50);assert.equal(sandbox.result.MIN_WINDOW_WIDTH,200);
  }
});

test('rapid settings edits persist in order, snapshot objects and recover after write failure',async()=>{
  const registrations=new Map(),saved=[],errors=[];
  let current={n:0};
  const writable=value=>{
    const subscribers=new Set();
    return {subscribe(fn){subscribers.add(fn);fn(value);return ()=>subscribers.delete(fn);},set(next){value=next;for(const fn of subscribers) fn(value);}};
  };
  const ctx=vm.createContext({writable,console:{warn(){},error:(...args)=>errors.push(args)},
    constants:{moduleId:'test'}, UIControl:class{},
    isObject:value=>value!==null&&typeof value==='object',
    isIterable:value=>value!=null&&typeof value[Symbol.iterator]==='function',isWritableStore:()=>true,
    subscribeIgnoreFirst:(store,fn)=>{let first=true;return store.subscribe(value=>{if(first){first=false;return;}fn(value);});},
    foundry:{utils:{deepClone:structuredClone}},game:{settings:{
      register:(_namespace,key,options)=>registrations.set(key,options),get:()=>current,
      set:async(_namespace,key,value)=>{
        await new Promise(resolve=>setTimeout(resolve,2));
        if(value.n===3)throw Error('Test write failure');
        saved.push(value);current=value;registrations.get(key).onChange(value);
      },
    }},ui:{notifications:{error(){}}},
  });
  const start=source.indexOf('class TJSGameSettings {'),end=source.indexOf('\nfunction getSettings()',start);
  vm.runInContext(source.slice(start,end)+';globalThis.Settings=TJSGameSettings;',ctx);
  const settings=new ctx.Settings('test');
  const handler=settings.register({namespace:'test',key:'value',options:{default:{n:0}}});
  const store=settings.getStore('value');
  const mutable={n:1};store.set(mutable);mutable.n=2;store.set(mutable);
  store.set({n:3});store.set({n:4});
  await handler({n:5});
  assert.deepEqual(saved.map(v=>v.n),[1,2,4,5]);assert.equal(current.n,5);assert.equal(errors.length,1);
  let displayed;store.subscribe(value=>displayed=value);assert.equal(displayed.n,4);
  registrations.get('value').onChange({n:6});
  assert.equal(displayed.n,6); // Remote updates still propagate when the queue is idle.
});
