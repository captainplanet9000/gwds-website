ALTER TABLE public.hosting_notifications
 ADD COLUMN prepared_email jsonb,
 ADD COLUMN lease_token uuid,
 ADD COLUMN lease_expires_at timestamptz,
 ADD COLUMN first_attempt_at timestamptz,
 ADD COLUMN next_attempt_at timestamptz NOT NULL DEFAULT now(),
 ADD COLUMN requires_review boolean NOT NULL DEFAULT false,
 ADD COLUMN delivery_status text,
 ADD COLUMN delivery_checked_at timestamptz;
CREATE INDEX hosting_notifications_retry ON public.hosting_notifications(next_attempt_at) WHERE status<>'sent' AND NOT requires_review;

CREATE FUNCTION public.claim_hosting_notification(p_id uuid,p_email jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE n public.hosting_notifications%ROWTYPE;
BEGIN
 SELECT * INTO STRICT n FROM public.hosting_notifications WHERE id=p_id FOR UPDATE;
 IF n.status='sent' OR n.requires_review OR n.next_attempt_at>now() OR (n.status='sending' AND n.lease_expires_at>now()) THEN RETURN NULL; END IF;
 IF n.attempts>=5 OR (n.attempts>0 AND (n.prepared_email IS NULL OR n.first_attempt_at IS NULL OR n.first_attempt_at<now()-interval '23 hours')) OR (n.attempts=0 AND n.created_at<now()-interval '24 hours') THEN
  UPDATE public.hosting_notifications SET requires_review=true,last_error='Delivery outcome or stale notification requires operator review; automatic resend refused' WHERE id=p_id;
  RETURN NULL;
 END IF;
 IF n.prepared_email IS NULL AND (p_email IS NULL OR jsonb_typeof(p_email)<>'object' OR p_email->>'to' IS DISTINCT FROM n.recipient_email OR coalesce(length(p_email->>'subject'),0)=0 OR coalesce(length(p_email->>'html'),0)=0) THEN RAISE EXCEPTION 'A complete prepared email is required'; END IF;
 UPDATE public.hosting_notifications SET prepared_email=coalesce(prepared_email,p_email),status='sending',attempts=attempts+1,
  first_attempt_at=coalesce(first_attempt_at,now()),lease_token=gen_random_uuid(),lease_expires_at=now()+interval '2 minutes',last_error=NULL
 WHERE id=p_id RETURNING * INTO n;
 RETURN to_jsonb(n);
END $$;
REVOKE ALL ON FUNCTION public.claim_hosting_notification(uuid,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_hosting_notification(uuid,jsonb) TO service_role;

CREATE FUNCTION public.finish_hosting_notification(p_id uuid,p_lease uuid,p_provider_id text,p_error text)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE n public.hosting_notifications%ROWTYPE;
BEGIN
 SELECT * INTO STRICT n FROM public.hosting_notifications WHERE id=p_id FOR UPDATE;
 IF n.status<>'sending' OR n.lease_token IS DISTINCT FROM p_lease THEN RAISE EXCEPTION 'Notification lease no longer belongs to this worker'; END IF;
 IF coalesce(length(p_provider_id),0)>0 AND p_error IS NULL THEN
  UPDATE public.hosting_notifications SET status='sent',provider_message_id=p_provider_id,sent_at=now(),delivery_status='submitted',lease_expires_at=NULL,last_error=NULL WHERE id=p_id;
 ELSE
  UPDATE public.hosting_notifications SET status='failed',last_error=left(coalesce(p_error,'Provider acknowledgement unavailable'),500),
   requires_review=(attempts>=5),next_attempt_at=now()+make_interval(secs=>least(3600,60*(2^attempts)::integer)),lease_expires_at=NULL WHERE id=p_id;
 END IF;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.finish_hosting_notification(uuid,uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.finish_hosting_notification(uuid,uuid,text,text) TO service_role;
NOTIFY pgrst,'reload schema';
