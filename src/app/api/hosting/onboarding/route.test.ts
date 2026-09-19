import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const state=vi.hoisted(()=>({limit:1 as number|null,update:vi.fn(),status:'active'}));
vi.mock('@/lib/commerce',async original=>({...await original<typeof import('@/lib/commerce')>(),requireVerifiedUser:async()=>({id:'owner'})}));
vi.mock('@/lib/supabase',()=>({createServerClient:()=>({from:(table:string)=>{
 const q:Record<string,unknown>={};for(const key of ['select','eq'])q[key]=()=>q;q.update=(v:unknown)=>{state.update(v);return q;};q.insert=async()=>({error:null});q.maybeSingle=async()=>({data:table==='hosting_subscriptions'?{id:'sub',plan_id:'solo',status:state.status}:table==='hosting_plans'?{price_cents:2900,agent_limit:state.limit}:{id:'onboarding',status:'operator_review'},error:null});return q;
}})}));
import { PUT } from './route';
const request=(agents:string[])=>PUT(new NextRequest('https://www.civalsystems.com/api/hosting/onboarding',{method:'PUT',body:JSON.stringify({subscriptionId:'20000000-0000-4000-8000-000000000001',workspaceName:'Trial workspace',requestedAgents:agents})}));
describe('onboarding plan enforcement',()=>{
 beforeEach(()=>{vi.clearAllMocks();state.limit=1;state.status='trialing';});
 it('allows a trial customer to configure one agent',async()=>{expect((await request(['darvas-box'])).status).toBe(200);expect(state.update).toHaveBeenCalled();});
 it('rejects extra agents submitted outside the UI',async()=>{expect((await request(['darvas-box','elliott-wave'])).status).toBe(409);expect(state.update).not.toHaveBeenCalled();});
 it('fails closed when the plan limit is missing',async()=>{state.limit=null;expect((await request(['darvas-box'])).status).toBe(503);expect(state.update).not.toHaveBeenCalled();});
 it('rejects an ended subscription',async()=>{state.status='canceled';expect((await request(['darvas-box'])).status).toBe(409);expect(state.update).not.toHaveBeenCalled();});
});
