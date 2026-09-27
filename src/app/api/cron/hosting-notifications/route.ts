import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { Resend } from 'resend';
import { setTimeout as pause } from 'node:timers/promises';
import { createServerClient } from '@/lib/supabase';
import { deliverHostingNotification } from '@/lib/hosting-notifications';
export const runtime='nodejs';
export const maxDuration=60;
export async function GET(request:NextRequest){
 const secret=process.env.CRON_SECRET,supplied=request.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
 if(!secret||!supplied||Buffer.byteLength(secret)!==Buffer.byteLength(supplied)||!timingSafeEqual(Buffer.from(secret),Buffer.from(supplied)))return NextResponse.json({error:'Unauthorized'},{status:401});
 const db=createServerClient();
 const {data:queue,error}=await db.from('hosting_notifications').select('subscription_id,dedup_key').in('status',['pending','failed','sending']).eq('requires_review',false).lte('next_attempt_at',new Date().toISOString()).order('created_at').limit(10);
 if(error)return NextResponse.json({error:'Notification queue unavailable'},{status:503});
 let processed=0,failures=0,checked=0;
 for(const item of queue||[]){try{await deliverHostingNotification(item.subscription_id,item.dedup_key);processed++;}catch{failures++;}finally{await pause(600);}}
 const {data:submitted,error:submittedError}=await db.from('hosting_notifications').select('id,provider_message_id').eq('status','sent').not('provider_message_id','is',null).or('delivery_status.is.null,delivery_status.eq.submitted,delivery_status.eq.sent,delivery_status.eq.queued,delivery_status.eq.delivery_delayed').order('delivery_checked_at',{ascending:true,nullsFirst:true}).limit(10);
 if(submittedError)failures++;
 if(process.env.RESEND_API_KEY){
  const resend=new Resend(process.env.RESEND_API_KEY);
  for(const row of submitted||[]){
   try{
    const {data,error:providerError}=await resend.emails.get(row.provider_message_id);
    if(providerError||!data)throw new Error('Provider status unavailable');
    const status=data.last_event;
    const {error:saveError}=await db.from('hosting_notifications').update({delivery_status:status,delivery_checked_at:new Date().toISOString(),requires_review:['bounced','complained','failed','suppressed'].includes(status),last_error:['bounced','complained','failed','suppressed'].includes(status)?`Provider reported ${status}; review recipient and contact customer through support`:null}).eq('id',row.id).eq('provider_message_id',row.provider_message_id);
    if(saveError)throw saveError;checked++;
   }catch{failures++;}finally{await pause(600);}
  }
 }else failures++;
 return NextResponse.json({processed,checked,failures},{status:failures?503:200,headers:{'Cache-Control':'no-store'}});
}

