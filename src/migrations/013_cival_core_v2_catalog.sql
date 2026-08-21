-- Promote only the independently verified Cival Core 2.0 artifact. The product
-- remains inactive until payment, fulfillment, refund and recovery drills pass.

update public.products
set is_active = false,
    artifact_ready = false,
    updated_at = now()
where id <> 'trading-dashboard-template';

update public.products
set name = 'Cival Core 2.0',
    description = 'A safe-by-default paper-trading operations dashboard with simulated orders, agent controls, risk views, audit history, portable backups, and optional authenticated hosted mode.',
    badge = 'VERIFIED RELEASE',
    emoji = 'CORE',
    features = '["Paper-only simulated order desk","Strict TypeScript and production build","Four verified unit tests","Optional authenticated hosted mode","Zero production dependency vulnerabilities"]'::jsonb,
    download_url = 'downloads/cival-core-v2.0.0.zip',
    version = '2.0.0',
    artifact_path = 'cival-core-v2.0.0.zip',
    artifact_sha256 = '9a6ef85723054149ff62d197d6a0324fede093d527f12510172f09ec445ca070',
    artifact_size_bytes = 77635,
    artifact_ready = true,
    is_active = false,
    updated_at = now()
where id = 'trading-dashboard-template';
