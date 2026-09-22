'use client';

import Link from 'next/link';
import { HostingAccessProvider, HostingAccessButton, HostingTrialCopy } from './HostingAccess';

export type HomeHostingPlan = {
  id: string; name: string; price_cents: number; currency: string;
  billing_interval: string; agent_limit: number; launch_ready: boolean;
};

export default function HomeHosting({ plans, sales, trialDays }: { plans: HomeHostingPlan[]; sales: boolean; trialDays: number }) {
  const money = (plan: HomeHostingPlan) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: plan.currency || 'USD', maximumFractionDigits: 2,
    minimumFractionDigits: plan.price_cents % 100 === 0 ? 0 : 2,
  }).format(plan.price_cents / 100);
  const solo = plans.find(plan => plan.id === 'solo');
  return <HostingAccessProvider>
    <section id="hosting" className="home-hosting" aria-labelledby="home-hosting-title">
      <div className="home-hosting-intro">
        <div>
          <h6>Managed dashboard hosting</h6>
          <h2 id="home-hosting-title">Your strategies.<br />We handle the hosting.</h2>
        </div>
        <div>
          <p>Get a private Cival dashboard without setting up your own server. Choose your agents, connect your Hyperliquid account and set your trading limits. We manage the infrastructure; you decide when automation runs.</p>
          <Link href="/hosted" className="btn btn-secondary">Explore managed hosting →</Link>
        </div>
      </div>
      <div className="home-hosting-plans">
        {plans.map(plan => <article key={plan.id} className={`home-hosting-plan${plan.id === 'solo' ? ' home-hosting-solo' : ''}`}>
          <div className="home-hosting-plan-heading">
            <h3>{plan.name}</h3>
            {plan.id === 'solo' && sales && plan.launch_ready && <HostingTrialCopy><span className="tag tag-accent">{trialDays}-day trial</span></HostingTrialCopy>}
          </div>
          <p className="home-hosting-price"><strong>{money(plan)}</strong><span>/{plan.billing_interval}</span></p>
          <p className="home-hosting-capacity">{plan.agent_limit === 1 ? 'Run one strategy agent' : `Run up to ${plan.agent_limit} strategy agents`}</p>
          <ul>
            <li>Your own hosted dashboard</li>
            <li>Choose strategies and configure risk limits</li>
            <li>Monitor activity and pause automation</li>
          </ul>
          <HostingAccessButton>{sales && plan.launch_ready ? (plan.id === 'solo' ? `Start Solo’s ${trialDays}-day trial` : `Choose ${plan.name}`) : 'View hosting availability'}</HostingAccessButton>
        </article>)}
      </div>
      {!plans.length && <p>View current plans and availability on the <Link href="/hosted">hosting page</Link>.</p>}
      <div className="home-hosting-details">
        {solo && sales && solo.launch_ready && <HostingTrialCopy><p>Solo: {trialDays} days free, then {money(solo)}/{solo.billing_interval}. Payment method required. For eligible new customers; cancel before the trial ends to avoid the first charge.</p></HostingTrialCopy>}
        <p>Hosting and trading capital are separate. Connect and fund your own account, then approve its trade-only key before enabling agents. Trading involves risk.</p>
        <Link href="/hosted#plans">Compare plans and setup requirements →</Link>
      </div>
    </section>
  </HostingAccessProvider>;
}
