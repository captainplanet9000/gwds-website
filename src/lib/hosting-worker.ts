import { createHash } from 'node:crypto';
import { createServerClient } from '@/lib/supabase';
import {
  createVercelDeployment,
  deploymentHttpsUrl,
  deploymentIsReady,
  ensureVercelProject,
  getVercelDeployment,
  hostingProviderConfigured,
  setVercelProjectPaused,
} from '@/lib/hosting-provider';

const CORE_RELEASE = '2.0.0';

// This whole task pipeline (review -> create_project -> create_database -> configure_workspace ->
// deploy) is the per-tenant Vercel automation path, gated off behind HOSTING_AUTOMATION_ENABLED --
// real tenants provision through the self-hosted Docker/host-agent path (control.tenant_commands)
// instead. The seeded workspace only ever needs to be a valid, empty starting record, not
// invented agents/goals/P&L that read as a live account nobody actually configured.
const INITIAL_WORKSPACE = {
  version: 1,
  cash: 100000,
  agents: [],
  goals: [],
  paperOrders: [],
  audit: [
    { id: 'event-ready', at: '2026-08-20T16:00:00.000Z', category: 'system', message: 'Paper-only workspace initialized. Live execution is unavailable.' },
  ],
};

interface TaskRow {
  id: string;
  instance_id: string;
  task_type: string;
  attempts: number;
}

interface InstanceRow {
  id: string;
  subscription_id: string;
  user_id: string;
  tenant_key: string;
  status: string;
  provider_project_id: string | null;
  provider_deployment_id: string | null;
  deployment_url: string | null;
  database_ref: string | null;
}

async function enqueue(instanceId: string, taskType: string, priority = 50) {
  const supabase = createServerClient();
  await supabase.from('hosting_provisioning_tasks').upsert({
    instance_id: instanceId,
    task_type: taskType,
    status: 'queued',
    priority,
    idempotency_key: `auto-v2-${taskType}-${instanceId}`,
    due_at: null,
    last_error: null,
  }, { onConflict: 'idempotency_key', ignoreDuplicates: true });
}

async function finish(task: TaskRow, result: Record<string, unknown> = {}) {
  await createServerClient().from('hosting_provisioning_tasks').update({
    status: 'completed', result, last_error: null, lease_expires_at: null,
    completed_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }).eq('id', task.id);
}

async function retryOrFail(task: TaskRow, error: unknown) {
  const message = (error instanceof Error ? error.message : 'Unknown hosting worker failure').slice(0, 1800);
  const retry = task.attempts < 6;
  await createServerClient().from('hosting_provisioning_tasks').update({
    status: retry ? 'queued' : 'failed',
    last_error: message,
    lease_expires_at: null,
    due_at: retry ? new Date(Date.now() + Math.min(15, task.attempts * 2) * 60_000).toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq('id', task.id);
}

function validWorkspace(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return row.version === 1 && typeof row.cash === 'number'
    && Array.isArray(row.agents) && Array.isArray(row.goals)
    && Array.isArray(row.paperOrders) && Array.isArray(row.audit);
}

async function processTask(task: TaskRow, instance: InstanceRow) {
  const supabase = createServerClient();
  const now = new Date().toISOString();

  if (task.task_type === 'review') {
    const [{ data: subscription }, { data: onboarding }] = await Promise.all([
      supabase.from('hosting_subscriptions').select('status').eq('id', instance.subscription_id).single(),
      supabase.from('hosting_onboarding').select('status').eq('subscription_id', instance.subscription_id).single(),
    ]);
    if (!subscription || !['active', 'trialing'].includes(subscription.status)) throw new Error('BILLING_NOT_ACTIVE');
    if (!onboarding || !['approved', 'complete'].includes(onboarding.status)) throw new Error('ONBOARDING_NOT_APPROVED');
    await supabase.from('hosting_instances').update({ status: 'provisioning', updated_at: now }).eq('id', instance.id);
    await finish(task, { approved: true });
    await enqueue(instance.id, 'create_project', 80);
    return;
  }

  if (task.task_type === 'create_project') {
    const project = await ensureVercelProject(instance);
    await supabase.from('hosting_instances').update({ provider_project_id: project.id, updated_at: now }).eq('id', instance.id);
    await finish(task, { projectId: project.id, projectName: project.name });
    await enqueue(instance.id, 'create_database', 75);
    return;
  }

  if (task.task_type === 'create_database') {
    const { error } = await supabase.from('hosting_workspace_state').upsert({
      tenant_key: instance.tenant_key,
      instance_id: instance.id,
      subscription_id: instance.subscription_id,
      user_id: instance.user_id,
      workspace: INITIAL_WORKSPACE,
    }, { onConflict: 'tenant_key', ignoreDuplicates: true });
    if (error) throw error;
    const databaseRef = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0];
    await supabase.from('hosting_instances').update({ database_ref: databaseRef, updated_at: now }).eq('id', instance.id);
    await finish(task, { databaseRef, table: 'hosting_workspace_state' });
    await enqueue(instance.id, 'configure_workspace', 70);
    return;
  }

  if (task.task_type === 'configure_workspace') {
    if (!instance.provider_project_id || !instance.database_ref) throw new Error('PROVIDER_OR_DATABASE_NOT_READY');
    await finish(task, { hostedMode: true, tradingMode: 'paper', liveTradingEnabled: false });
    await enqueue(instance.id, 'deploy', 65);
    return;
  }

  if (task.task_type === 'deploy') {
    if (!instance.provider_project_id) throw new Error('PROVIDER_PROJECT_NOT_READY');
    const project = await ensureVercelProject(instance);
    const deployment = await createVercelDeployment(project);
    await supabase.from('hosting_instances').update({
      provider_deployment_id: deployment.id,
      deployment_url: deploymentHttpsUrl(deployment),
      release_version: CORE_RELEASE,
      updated_at: now,
    }).eq('id', instance.id);
    await finish(task, { deploymentId: deployment.id, url: deploymentHttpsUrl(deployment) });
    await enqueue(instance.id, 'health_check', 60);
    return;
  }

  if (task.task_type === 'health_check') {
    if (!instance.provider_deployment_id) throw new Error('DEPLOYMENT_NOT_CREATED');
    const deployment = await getVercelDeployment(instance.provider_deployment_id);
    if (!deploymentIsReady(deployment)) throw new Error(`DEPLOYMENT_NOT_READY:${deployment.readyState || deployment.state || 'unknown'}`);
    const url = deploymentHttpsUrl(deployment) || instance.deployment_url;
    if (!url) throw new Error('DEPLOYMENT_URL_MISSING');
    const response = await fetch(`${url}/api/health`, { cache: 'no-store', signal: AbortSignal.timeout(12_000) });
    const health = await response.json() as { status?: string; tradingMode?: string; liveTradingEnabled?: boolean };
    if (!response.ok || health.status !== 'ok' || health.tradingMode !== 'paper' || health.liveTradingEnabled !== false) throw new Error('PAPER_HEALTH_GATE_FAILED');
    await supabase.from('hosting_instances').update({ deployment_url: url, health_status: 'healthy', last_heartbeat_at: now, updated_at: now }).eq('id', instance.id);
    await finish(task, { url, paperOnly: true });
    await enqueue(instance.id, 'backup_check', 55);
    return;
  }

  if (task.task_type === 'backup_check') {
    const { data: state, error } = await supabase.from('hosting_workspace_state').select('*').eq('instance_id', instance.id).single();
    if (error || !state || !validWorkspace(state.workspace)) throw error || new Error('WORKSPACE_BACKUP_VALIDATION_FAILED');
    const serialized = JSON.stringify(state.workspace);
    const sha256 = createHash('sha256').update(serialized).digest('hex');
    const { data: backup, error: backupError } = await supabase.from('hosting_workspace_backups').insert({
      instance_id: instance.id, tenant_key: instance.tenant_key, workspace: state.workspace,
      source_revision: state.revision, sha256,
    }).select('id').single();
    if (backupError) throw backupError;
    await supabase.from('hosting_instances').update({ backup_status: 'healthy', last_backup_at: now, updated_at: now }).eq('id', instance.id);
    await finish(task, { backupId: backup.id, sha256 });
    await enqueue(instance.id, 'recovery_test', 50);
    return;
  }

  if (task.task_type === 'recovery_test') {
    const { data: backup, error } = await supabase.from('hosting_workspace_backups').select('*').eq('instance_id', instance.id).order('created_at', { ascending: false }).limit(1).single();
    if (error || !backup || !validWorkspace(backup.workspace)) throw error || new Error('RECOVERY_BACKUP_INVALID');
    const sha256 = createHash('sha256').update(JSON.stringify(backup.workspace)).digest('hex');
    if (sha256 !== backup.sha256) throw new Error('RECOVERY_HASH_MISMATCH');
    await supabase.from('hosting_workspace_backups').update({ recovery_tested_at: now }).eq('id', backup.id);
    const { data: current } = await supabase.from('hosting_instances').select('*').eq('id', instance.id).single();
    if (!current?.deployment_url || current.health_status !== 'healthy' || current.backup_status !== 'healthy' || !current.database_ref || !current.provider_project_id) throw new Error('ACTIVATION_GATES_INCOMPLETE');
    await supabase.from('hosting_instances').update({ status: 'active', last_recovery_test_at: now, activated_at: current.activated_at || now, updated_at: now }).eq('id', instance.id);
    await finish(task, { backupId: backup.id, sha256, activationReady: true });
    return;
  }

  if (task.task_type === 'suspend' || task.task_type === 'decommission') {
    if (!instance.provider_project_id) throw new Error('PROVIDER_PROJECT_NOT_READY');
    await setVercelProjectPaused(instance.provider_project_id, true);
    await supabase.from('hosting_instances').update({ status: task.task_type === 'suspend' ? 'suspended' : 'decommissioned', suspended_at: now, decommissioned_at: task.task_type === 'decommission' ? now : null, updated_at: now }).eq('id', instance.id);
    await finish(task, { providerPaused: true });
    return;
  }

  if (task.task_type === 'resume') {
    if (!instance.provider_project_id) throw new Error('PROVIDER_PROJECT_NOT_READY');
    await setVercelProjectPaused(instance.provider_project_id, false);
    await supabase.from('hosting_instances').update({ status: 'maintenance', suspended_at: null, updated_at: now }).eq('id', instance.id);
    await finish(task, { providerPaused: false });
    await enqueue(instance.id, 'health_check', 70);
    return;
  }

  throw new Error(`UNSUPPORTED_AUTOMATION_TASK:${task.task_type}`);
}

export async function processOneHostingTask(workerId: string) {
  if (process.env.HOSTING_AUTOMATION_ENABLED !== 'true') return { status: 'disabled' as const };
  if (!hostingProviderConfigured()) return { status: 'configuration_required' as const };
  const supabase = createServerClient();
  const { data, error } = await supabase.rpc('claim_next_hosting_task', { p_worker: workerId });
  if (error) throw error;
  const task = (data?.[0] || null) as TaskRow | null;
  if (!task) return { status: 'idle' as const };
  try {
    const { data: instance, error: instanceError } = await supabase.from('hosting_instances').select('*').eq('id', task.instance_id).single();
    if (instanceError || !instance) throw instanceError || new Error('HOSTING_INSTANCE_NOT_FOUND');
    await processTask(task, instance as InstanceRow);
    await supabase.from('hosting_audit').insert({
      user_id: instance.user_id, subscription_id: instance.subscription_id, instance_id: instance.id,
      actor_type: 'system', actor_id: workerId, action: `automation_${task.task_type}_completed`, metadata: { task_id: task.id },
    });
    return { status: 'completed' as const, taskId: task.id, taskType: task.task_type };
  } catch (reason) {
    await retryOrFail(task, reason);
    return { status: 'retry_scheduled' as const, taskId: task.id, taskType: task.task_type };
  }
}
