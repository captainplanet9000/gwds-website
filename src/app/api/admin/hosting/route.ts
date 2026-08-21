import { NextRequest, NextResponse } from 'next/server';
import { adminUnauthorized, requireAdmin } from '@/lib/admin-auth';
import { normalizeHostingText } from '@/lib/hosting';
import { deliverHostingNotification } from '@/lib/hosting-notifications';
import { createServerClient } from '@/lib/supabase';

export const runtime = 'nodejs';

const INSTANCE_STATUSES = ['queued','provisioning','active','degraded','maintenance','suspended','failed','decommissioning','decommissioned'];
const HEALTH_STATUSES = ['unknown','healthy','degraded','unreachable'];
const BACKUP_STATUSES = ['not_configured','healthy','warning','failed'];
const ONBOARDING_STATUSES = ['not_started','customer_input','operator_review','approved','blocked','complete'];
const TASK_STATUSES = ['queued','in_progress','blocked','completed','failed','canceled'];
const INCIDENT_STATUSES = ['investigating','identified','monitoring','resolved'];
const SEVERITIES = ['info','minor','major','critical'];

function validUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f-]{36}$/i.test(value);
}

async function audit(action: string, data: { user_id?: string | null; subscription_id?: string | null; instance_id?: string | null; metadata?: Record<string, unknown> }, actorId: string) {
  await createServerClient().from('hosting_audit').insert({
    user_id: data.user_id || null,
    subscription_id: data.subscription_id || null,
    instance_id: data.instance_id || null,
    actor_type: 'admin', actor_id: actorId, action,
    metadata: data.metadata || {},
  });
}

export async function GET(req: NextRequest) {
  if (!await requireAdmin(req)) return adminUnauthorized();
  const supabase = createServerClient();
  const [plans, subscriptions, onboarding, instances, tasks, incidents, usage, history] = await Promise.all([
    supabase.from('hosting_plans').select('*').order('sort_order'),
    supabase.from('hosting_subscriptions').select('*').order('created_at', { ascending: false }).limit(500),
    supabase.from('hosting_onboarding').select('*').order('updated_at', { ascending: false }).limit(500),
    supabase.from('hosting_instances').select('*').order('updated_at', { ascending: false }).limit(500),
    supabase.from('hosting_provisioning_tasks').select('*').order('priority', { ascending: false }).order('created_at').limit(1000),
    supabase.from('hosting_incidents').select('*').order('started_at', { ascending: false }).limit(500),
    supabase.from('hosting_usage_daily').select('*').order('usage_date', { ascending: false }).limit(1000),
    supabase.from('hosting_audit').select('*').order('created_at', { ascending: false }).limit(250),
  ]);
  const firstError = [plans, subscriptions, onboarding, instances, tasks, incidents, usage, history].find((result) => result.error)?.error;
  if (firstError) return NextResponse.json({ error: 'Hosting operations data could not be loaded.' }, { status: 503 });

  const rows = subscriptions.data || [];
  const instanceRows = instances.data || [];
  const taskRows = tasks.data || [];
  return NextResponse.json({
    salesEnabled: process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED === 'true',
    stats: {
      activeSubscriptions: rows.filter((item) => ['active', 'trialing'].includes(item.status)).length,
      recurringRevenueCents: rows.filter((item) => ['active', 'trialing'].includes(item.status)).reduce((sum, item) => sum + item.price_cents, 0),
      activeInstances: instanceRows.filter((item) => item.status === 'active').length,
      unhealthyInstances: instanceRows.filter((item) => ['degraded', 'unreachable'].includes(item.health_status)).length,
      onboardingQueue: (onboarding.data || []).filter((item) => ['customer_input', 'operator_review', 'approved', 'blocked'].includes(item.status)).length,
      openTasks: taskRows.filter((item) => ['queued', 'in_progress', 'blocked', 'failed'].includes(item.status)).length,
      openIncidents: (incidents.data || []).filter((item) => item.status !== 'resolved').length,
    },
    plans: plans.data || [], subscriptions: rows, onboarding: onboarding.data || [],
    instances: instanceRows, tasks: taskRows,
    incidents: incidents.data || [], usage: usage.data || [], history: history.data || [],
  }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req, ['owner', 'operator']);
  if (!admin) return adminUnauthorized();
  try {
    if (Number(req.headers.get('content-length') || '0') > 32_768) return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    const body = await req.json() as Record<string, unknown>;
    const action = body.action;
    const supabase = createServerClient();
    const now = new Date().toISOString();

    if (action === 'update_instance' && validUuid(body.instanceId)) {
      const { data: current } = await supabase.from('hosting_instances').select('*').eq('id', body.instanceId).maybeSingle();
      if (!current) return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
      const patch: Record<string, unknown> = { updated_at: now };
      if (typeof body.status === 'string' && INSTANCE_STATUSES.includes(body.status)) patch.status = body.status;
      if (typeof body.healthStatus === 'string' && HEALTH_STATUSES.includes(body.healthStatus)) patch.health_status = body.healthStatus;
      if (typeof body.backupStatus === 'string' && BACKUP_STATUSES.includes(body.backupStatus)) patch.backup_status = body.backupStatus;
      for (const [input, column, max] of [
        ['deploymentUrl','deployment_url',500],['providerProjectId','provider_project_id',200],
        ['providerDeploymentId','provider_deployment_id',200],['databaseRef','database_ref',200],
        ['releaseVersion','release_version',100],
      ] as const) {
        if (input in body) patch[column] = normalizeHostingText(body[input], max);
      }
      if (body.markHeartbeat === true) patch.last_heartbeat_at = now;
      if (body.markBackup === true) patch.last_backup_at = now;
      if (body.markRecoveryTest === true) patch.last_recovery_test_at = now;

      if (patch.status === 'active') {
        const { data: subscription } = await supabase.from('hosting_subscriptions').select('status').eq('id', current.subscription_id).maybeSingle();
        const { data: onboarding } = await supabase.from('hosting_onboarding').select('status').eq('subscription_id', current.subscription_id).maybeSingle();
        const merged = { ...current, ...patch };
        if (!subscription || !['active', 'trialing'].includes(subscription.status)
          || !onboarding || !['approved', 'complete'].includes(onboarding.status)
          || !merged.deployment_url || !merged.provider_project_id || !merged.database_ref || !merged.release_version
          || merged.health_status !== 'healthy' || merged.backup_status !== 'healthy' || !merged.last_recovery_test_at) {
          return NextResponse.json({ error: 'Activation requires active billing, approved onboarding, deployment/database references, a release version, healthy runtime and backup, and a recorded recovery test.' }, { status: 409 });
        }
        patch.activated_at = current.activated_at || now;
      }
      if (patch.status === 'suspended') patch.suspended_at = now;
      if (patch.status === 'decommissioned') patch.decommissioned_at = now;
      const { data, error } = await supabase.from('hosting_instances').update(patch).eq('id', current.id).select().single();
      if (error) throw error;
      await audit('instance_updated', { user_id: current.user_id, subscription_id: current.subscription_id, instance_id: current.id, metadata: { fields: Object.keys(patch) } }, admin.userId);
      if (patch.status === 'active' && current.status !== 'active') {
        const { data: subscription } = await supabase.from('hosting_subscriptions').select('customer_email').eq('id', current.subscription_id).single();
        await supabase.from('hosting_notifications').insert({ subscription_id: current.subscription_id, template: 'hosting_activated', recipient_email: subscription?.customer_email, dedup_key: `hosting-activated-${current.id}`, payload: { instance_id: current.id } });
        await deliverHostingNotification(current.subscription_id).catch((reason) => console.error('Hosting activation email failed', { subscriptionId: current.subscription_id, error: reason instanceof Error ? reason.message : 'unknown' }));
      }
      return NextResponse.json({ instance: data });
    }

    if (action === 'update_onboarding' && validUuid(body.onboardingId)) {
      const { data: current } = await supabase.from('hosting_onboarding').select('*').eq('id', body.onboardingId).maybeSingle();
      if (!current) return NextResponse.json({ error: 'Onboarding record not found' }, { status: 404 });
      const patch: Record<string, unknown> = { updated_at: now };
      if (typeof body.status === 'string' && ONBOARDING_STATUSES.includes(body.status)) patch.status = body.status;
      if ('operatorNotes' in body) patch.operator_notes = normalizeHostingText(body.operatorNotes, 4000);
      if (patch.status === 'approved' || patch.status === 'complete') patch.reviewed_at = now;
      const { data, error } = await supabase.from('hosting_onboarding').update(patch).eq('id', current.id).select().single();
      if (error) throw error;
      await audit('onboarding_updated', { user_id: current.user_id, subscription_id: current.subscription_id, metadata: { status: patch.status } }, admin.userId);
      return NextResponse.json({ onboarding: data });
    }

    if (action === 'update_task' && validUuid(body.taskId)) {
      const { data: task } = await supabase.from('hosting_provisioning_tasks').select('*,hosting_instances(user_id,subscription_id)').eq('id', body.taskId).maybeSingle();
      if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      const patch: Record<string, unknown> = { updated_at: now };
      if (typeof body.status === 'string' && TASK_STATUSES.includes(body.status)) {
        patch.status = body.status;
        if (body.status === 'in_progress') { patch.started_at = task.started_at || now; patch.attempts = task.attempts + 1; }
        if (body.status === 'completed') patch.completed_at = now;
      }
      if ('assignedTo' in body) patch.assigned_to = normalizeHostingText(body.assignedTo, 120);
      if ('lastError' in body) patch.last_error = normalizeHostingText(body.lastError, 2000);
      if (body.result && typeof body.result === 'object') patch.result = body.result;
      const { data, error } = await supabase.from('hosting_provisioning_tasks').update(patch).eq('id', task.id).select().single();
      if (error) throw error;
      const owner = Array.isArray(task.hosting_instances) ? task.hosting_instances[0] : task.hosting_instances;
      await audit('provisioning_task_updated', { user_id: owner?.user_id, subscription_id: owner?.subscription_id, instance_id: task.instance_id, metadata: { task_id: task.id, status: patch.status } }, admin.userId);
      return NextResponse.json({ task: data });
    }

    if (action === 'create_task' && validUuid(body.instanceId)) {
      const { data: instance } = await supabase.from('hosting_instances').select('id,user_id,subscription_id').eq('id', body.instanceId).maybeSingle();
      const taskType = typeof body.taskType === 'string' ? body.taskType : 'custom';
      const allowed = ['review','create_project','create_database','configure_workspace','deploy','health_check','backup_check','recovery_test','suspend','resume','decommission','custom'];
      if (!instance || !allowed.includes(taskType)) return NextResponse.json({ error: 'Invalid task' }, { status: 400 });
      const priority = typeof body.priority === 'number' ? Math.max(0, Math.min(100, Math.round(body.priority))) : 50;
      const idempotencyKey = `${taskType}-${instance.id}-${Date.now()}`;
      const { data, error } = await supabase.from('hosting_provisioning_tasks').insert({ instance_id: instance.id, task_type: taskType, priority, idempotency_key: idempotencyKey, payload: body.payload && typeof body.payload === 'object' ? body.payload : {} }).select().single();
      if (error) throw error;
      await audit('provisioning_task_created', { user_id: instance.user_id, subscription_id: instance.subscription_id, instance_id: instance.id, metadata: { task_id: data.id, task_type: taskType } }, admin.userId);
      return NextResponse.json({ task: data });
    }

    if (action === 'upsert_incident' && validUuid(body.instanceId)) {
      const { data: instance } = await supabase.from('hosting_instances').select('id,user_id,subscription_id').eq('id', body.instanceId).maybeSingle();
      if (!instance) return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
      const title = normalizeHostingText(body.title, 160, true)!;
      const description = normalizeHostingText(body.description, 4000, true)!;
      const severity = typeof body.severity === 'string' && SEVERITIES.includes(body.severity) ? body.severity : 'minor';
      const status = typeof body.status === 'string' && INCIDENT_STATUSES.includes(body.status) ? body.status : 'investigating';
      const row = { instance_id: instance.id, user_id: instance.user_id, title, description, severity, status, customer_visible: body.customerVisible !== false, resolved_at: status === 'resolved' ? now : null, updated_at: now };
      const query = validUuid(body.incidentId)
        ? supabase.from('hosting_incidents').update(row).eq('id', body.incidentId).eq('instance_id', instance.id)
        : supabase.from('hosting_incidents').insert(row);
      const { data, error } = await query.select().single();
      if (error) throw error;
      await audit('incident_updated', { user_id: instance.user_id, subscription_id: instance.subscription_id, instance_id: instance.id, metadata: { incident_id: data.id, severity, status } }, admin.userId);
      if (!validUuid(body.incidentId) && row.customer_visible) {
        const { data: subscription } = await supabase.from('hosting_subscriptions').select('customer_email').eq('id', instance.subscription_id).single();
        await supabase.from('hosting_notifications').insert({ subscription_id: instance.subscription_id, template: 'hosting_incident', recipient_email: subscription?.customer_email, dedup_key: `hosting-incident-${data.id}`, payload: { title, detail: description } });
        await deliverHostingNotification(instance.subscription_id).catch((reason) => console.error('Hosting incident email failed', { subscriptionId: instance.subscription_id, error: reason instanceof Error ? reason.message : 'unknown' }));
      }
      return NextResponse.json({ incident: data });
    }

    if (action === 'update_plan' && typeof body.planId === 'string') {
      const { data: plan } = await supabase.from('hosting_plans').select('*,products(artifact_ready)').eq('id', body.planId).maybeSingle();
      if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      const launchReady = body.launchReady === true;
      if (launchReady) {
        const product = Array.isArray(plan.products) ? plan.products[0] : plan.products;
        if (plan.price_cents > 0 && (!plan.stripe_product_id || !plan.stripe_price_id || !product?.artifact_ready)) {
          return NextResponse.json({ error: 'A paid plan needs active Stripe catalog IDs and a verified included release before it can be launch-ready.' }, { status: 409 });
        }
      }
      const { data, error } = await supabase.from('hosting_plans').update({ launch_ready: launchReady, updated_at: now }).eq('id', plan.id).select().single();
      if (error) throw error;
      await audit('hosting_plan_gate_updated', { metadata: { plan_id: plan.id, launch_ready: launchReady } }, admin.userId);
      return NextResponse.json({ plan: data, salesEnabled: process.env.NEXT_PUBLIC_HOSTING_SALES_ENABLED === 'true' });
    }

    return NextResponse.json({ error: 'Unsupported hosting operation' }, { status: 400 });
  } catch (error) {
    console.error('Hosting admin operation failed', { error: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'The hosting operation failed.' }, { status: 500 });
  }
}
