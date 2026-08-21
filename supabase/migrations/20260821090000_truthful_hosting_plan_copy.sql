update public.hosting_plans set
  description = 'One private paper workspace with cloud saves and managed updates.',
  features = '["Private paper workspace","Verified customer sign-in","Core Edition licence included"]'::jsonb,
  launch_ready = false,
  updated_at = now()
where id = 'solo';

update public.hosting_plans set
  description = 'A managed paper-research desk with priority operations support.',
  features = '["Coordinated paper agents","Cloud workspace backups","Release updates","Priority support"]'::jsonb,
  launch_ready = false,
  updated_at = now()
where id = 'desk';

update public.hosting_plans set
  description = 'A custom paper-research deployment for professional teams.',
  features = '["Dedicated deployment","Custom onboarding","Role-planning workshop","Private support channel"]'::jsonb,
  launch_ready = false,
  updated_at = now()
where id = 'fund';
