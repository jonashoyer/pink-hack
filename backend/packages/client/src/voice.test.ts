import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { createVoiceConnection } from "./index";

const expected = {id:"conversation",voice_session_id:"conversation",provider:"azure",model:"gpt-live-1",delegation:"client",session:{id:"provider"},transport:{type:"webrtc",sdp:"synthetic-answer"}};
const tick=()=>new Promise<void>(r=>setTimeout(r,0));
async function until(check:()=>boolean){for(let n=0;n<100;n++){if(check())return;await tick();}throw Error("test condition timeout");}
function browser(t:TestContext,ready:boolean,backendSuccess:boolean){
  const original=new Map<string,PropertyDescriptor|undefined>();const set=(key:string,value:unknown)=>{original.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{configurable:true,value});};
  let stopped=0;const track={enabled:true,stop(){stopped++;}};
  const requests:Array<{path:string;init?:RequestInit}>=[];let remote=false;
  class Channel extends EventTarget{readyState="open";events:any[]=[];emit(value:unknown){const event=new Event("message");Object.defineProperty(event,"data",{value:JSON.stringify(value)});this.dispatchEvent(event);}send(value:string){const event=JSON.parse(value);this.events.push(event);if(event.type==="session.close")queueMicrotask(()=>this.emit({type:"session.closed"}));}close(){this.readyState="closed";}}
  const channel=new Channel();
  class Peer extends EventTarget{iceGatheringState="complete";localDescription?:{sdp:string};addTrack(){}createDataChannel(){return channel;}async createOffer(){return{type:"offer",sdp:"synthetic-offer"};}async setLocalDescription(){this.localDescription={sdp:"synthetic-offer"};}async setRemoteDescription(){remote=true;if(ready)queueMicrotask(()=>channel.emit({type:"session.started",session:{id:"provider",model:"gpt-live-1",delegation:{type:"client"}}}));}close(){}}
  class Audio{autoplay=false;muted=false;srcObject:unknown;play(){return Promise.resolve();}pause(){}}
  set("navigator",{mediaDevices:{getUserMedia:async()=>({getTracks:()=>[track],getAudioTracks:()=>[track]})}});set("RTCPeerConnection",Peer);set("Audio",Audio);
  t.mock.method(globalThis,"fetch",async(url:any,init?:RequestInit)=>{const path=String(url);requests.push({path,init});return path.endsWith("/stop")?Response.json(backendSuccess?{voice_session_id:"conversation",state:"stopped"}:{error:{message:"unavailable"}},{status:backendSuccess?200:503}):Response.json(expected);});
  t.after(()=>{for(const[key,descriptor]of original){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else Reflect.deleteProperty(globalThis,key);}});
  const connection=createVoiceConnection({apiBaseUrl:"https://synthetic.example",onStatus:()=>{},onDelegation:async()=>"Read-only"});
  return{connection,channel,requests,remote:()=>remote,stopped:()=>stopped};
}

test("known pre-start conversation is revoked on early close without claiming provider finalization",async t=>{
  const b=browser(t,false,true);const starting=b.connection.start();const rejection=assert.rejects(starting,/cancelled/);
  await until(b.remote);const closed=await b.connection.close();await rejection;
  assert.deepEqual(closed,{confirmed:false,backendStopped:true});assert.ok(b.stopped()>0);
  assert.equal(b.requests.filter(x=>x.path.endsWith("/stop")).length,1);
  const request=b.requests.find(x=>x.path.endsWith("/stop"))!;assert.equal(request.init?.credentials,"omit");assert.equal(new Headers(request.init?.headers).get("Authorization"),null);assert.equal(b.channel.events.some(x=>x.type==="session.close"),false);
});

test("provider close confirmation is separate from failed backend revocation",async t=>{
  const b=browser(t,true,false);await b.connection.start();const result=await b.connection.close();
  assert.deepEqual(result,{confirmed:true,backendStopped:false});assert.equal(b.channel.events.filter(x=>x.type==="session.close").length,1);
});

test("queued Responses tools carry an abort signal that Stop cancels",async t=>{
  const b=browser(t,true,true);let toolSignal:AbortSignal|undefined;let release!:(response:Response)=>void;
  t.mock.method(globalThis,"fetch",async(url:any,init?:RequestInit)=>{const path=String(url);b.requests.push({path,init});if(path.endsWith("/tools")){toolSignal=init?.signal??undefined;return new Promise<Response>(r=>{release=r;});}return Response.json(path.endsWith("/stop")?{voice_session_id:"conversation",state:"stopped"}:{...expected,provider:"openai",delegation:"responses"});});
  // Use the expected provider delegation returned by this test's startup.
  const emit=b.channel.emit.bind(b.channel);b.channel.emit=(value:any)=>emit(value.type==="session.started"?{...value,session:{...value.session,delegation:{type:"responses"}}}:value);
  await b.connection.start();
  b.channel.emit({type:"response.event",event:{type:"response.output_item.done",response_id:"r",item:{type:"function_call",call_id:"tool",name:"create_journal_entry",arguments:"{}"}}});
  b.channel.emit({type:"response.event",event:{type:"response.completed",response_id:"r"}});
  await until(()=>!!toolSignal);const closed=await b.connection.close();assert.equal(toolSignal?.aborted,true);assert.equal(closed.backendStopped,true);release(Response.json({output:{id:"saved-before-stop"}}));await tick();
  assert.equal(b.channel.events.some(x=>x.type==="response.item.create"),false);
});
