import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const state=vi.hoisted(()=>({row:null as null|{stripe_customer_id:string;livemode:boolean|null},mode:vi.fn(),create:vi.fn(),filters:[] as unknown[][]}));
vi.mock('@/lib/commerce',async original=>({...await original<typeof import('@/lib/commerce')>(),requireVerifiedUser:async()=>({id:'owner'}),getSiteUrl:()=> 'https://www.civalsystems.com'}));
vi.mock('@/lib/stripe',()=>({getBillingStripe:(mode:boolean)=>{state.mode(mode);return{billingPortal:{sessions:{create:state.create}}};}}));
vi.mock('@/lib/supabase',()=>({createServerClient:()=>({from:()=>{const q:Record<string,unknown>={};for(const k of ['select','not','order','limit'])q[k]=()=>q;q.eq=(...v:unknown[])=>{state.filters.push(v);return q;};q.maybeSingle=async()=>({data:state.row,error:null});return q;}})}));
import { POST } from './route';
const request=()=>POST(new NextRequest('https://www.civalsystems.com/api/hosting/portal',{method:'POST',body:JSON.stringify({livemode:false,stripe_customer_id:'attacker'})}));
describe('hosting billing portal modes',()=>{
 beforeEach(()=>{vi.clearAllMocks();state.filters=[];state.row={stripe_customer_id:'cus_owned',livemode:true};state.create.mockResolvedValue({url:'https://billing.stripe.com/p/session/fixture'});});
 it('uses stored live billing even if the request asks for test mode',async()=>{expect((await request()).status).toBe(200);expect(state.mode).toHaveBeenCalledWith(true);expect(state.create).toHaveBeenCalledWith({customer:'cus_owned',return_url:'https://www.civalsystems.com/account/hosting'});expect(state.filters).toContainEqual(['user_id','owner']);});
 it('uses test billing for an existing pilot subscription',async()=>{state.row!.livemode=false;expect((await request()).status).toBe(200);expect(state.mode).toHaveBeenCalledWith(false);});
 it('refuses an unknown mode instead of guessing',async()=>{state.row!.livemode=null;expect((await request()).status).toBe(503);expect(state.create).not.toHaveBeenCalled();});
 it('does not open another customer portal when no owned subscription exists',async()=>{state.row=null;expect((await request()).status).toBe(404);expect(state.create).not.toHaveBeenCalled();});
});
