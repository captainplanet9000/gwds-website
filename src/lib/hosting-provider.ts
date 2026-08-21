interface ManagedInstance {
  id: string;
  tenant_key: string;
  provider_project_id: string | null;
  provider_deployment_id: string | null;
  deployment_url: string | null;
}
interface VercelProject {
  id: string;
  name: string;
}

interface VercelDeployment {
  id: string;
  url?: string;
  readyState?: string;
  state?: string;
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`HOSTING_CONFIG_MISSING:${name}`);
  return value;
}

function teamQuery() {
  return `teamId=${encodeURIComponent(required('VERCEL_HOSTING_TEAM_ID'))}`;
}

async function vercelRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`https://api.vercel.com${path}${path.includes('?') ? '&' : '?'}${teamQuery()}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${required('VERCEL_HOSTING_AUTOMATION_TOKEN')}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
    cache: 'no-store',
  });
  const payload = await response.json().catch(() => ({})) as { error?: { message?: string } } & T;
  if (!response.ok) throw new Error(`VERCEL_API_${response.status}:${payload.error?.message || 'request failed'}`);
  return payload;
}

export function hostingProviderConfigured() {
  return Boolean(
    process.env.VERCEL_HOSTING_AUTOMATION_TOKEN
    && process.env.VERCEL_HOSTING_TEAM_ID
    && process.env.CIVAL_CORE_GITHUB_REPO
    && process.env.CIVAL_CORE_GITHUB_REPO_ID
    && process.env.NEXT_PUBLIC_SUPABASE_URL
    && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}

export async function ensureVercelProject(instance: ManagedInstance): Promise<VercelProject> {
  if (instance.provider_project_id) {
    return vercelRequest<VercelProject>(`/v9/projects/${encodeURIComponent(instance.provider_project_id)}`);
  }

  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || required('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const environmentVariables = [
    ['TRADING_MODE', 'paper'],
    ['ALLOW_LIVE_TRADING', 'false'],
    ['NEXT_PUBLIC_TRADING_MODE', 'paper'],
    ['NEXT_PUBLIC_INSTANCE_NAME', 'Cival Managed Paper Workspace'],
    ['NEXT_PUBLIC_SUPPORT_URL', 'https://www.civalsystems.com/contact'],
    ['NEXT_PUBLIC_HOSTED_MODE', 'true'],
    ['NEXT_PUBLIC_TENANT_KEY', instance.tenant_key],
    ['NEXT_PUBLIC_SUPABASE_URL', required('NEXT_PUBLIC_SUPABASE_URL')],
    ['NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', publicKey],
  ].map(([key, value]) => ({ key, value, type: 'plain', target: ['production', 'preview'] }));

  try {
    return await vercelRequest<VercelProject>('/v11/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: instance.tenant_key,
        framework: 'nextjs',
        rootDirectory: 'product',
        gitRepository: { type: 'github', repo: required('CIVAL_CORE_GITHUB_REPO') },
        environmentVariables,
      }),
    });
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('VERCEL_API_409')) throw error;
    return vercelRequest<VercelProject>(`/v9/projects/${encodeURIComponent(instance.tenant_key)}`);
  }
}

export async function createVercelDeployment(project: VercelProject): Promise<VercelDeployment> {
  return vercelRequest<VercelDeployment>('/v13/deployments', {
    method: 'POST',
    body: JSON.stringify({
      name: project.name,
      project: project.id,
      target: 'production',
      gitSource: {
        type: 'github',
        repoId: Number(required('CIVAL_CORE_GITHUB_REPO_ID')),
        ref: process.env.CIVAL_CORE_GIT_REF || 'main',
      },
    }),
  });
}

export async function getVercelDeployment(deploymentId: string): Promise<VercelDeployment> {
  return vercelRequest<VercelDeployment>(`/v13/deployments/${encodeURIComponent(deploymentId)}`);
}

export async function setVercelProjectPaused(projectId: string, paused: boolean): Promise<void> {
  await vercelRequest(`/v1/projects/${encodeURIComponent(projectId)}/${paused ? 'pause' : 'unpause'}`, { method: 'POST' });
}

export function deploymentHttpsUrl(deployment: VercelDeployment): string | null {
  if (!deployment.url) return null;
  return deployment.url.startsWith('https://') ? deployment.url : `https://${deployment.url}`;
}

export function deploymentIsReady(deployment: VercelDeployment): boolean {
  return (deployment.readyState || deployment.state || '').toUpperCase() === 'READY';
}
