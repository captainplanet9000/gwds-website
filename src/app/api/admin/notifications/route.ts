import { NextRequest,NextResponse } from 'next/server';
import { requireAdmin,adminUnauthorized } from '@/lib/admin-auth';
import { createServerClient } from '@/lib/supabase';
export async function GET(request:NextRequest){
 if(!await requireAdmin(request))return adminUnauthorized();
 const {data,error}=await createServerClient().from('hosting_notifications').select('id,subscription_id,template,recipient_email,status,attempts,provider_message_id,last_error,created_at,sent_at,requires_review,delivery_status,delivery_checked_at,lease_expires_at').order('requires_review',{ascending:false}).order('created_at',{ascending:false}).limit(200);
 if(error)return NextResponse.json({error:'Notification status unavailable'},{status:503});
 return NextResponse.json({notifications:data},{headers:{'Cache-Control':'no-store'}});
}
