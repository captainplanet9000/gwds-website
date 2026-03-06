import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trading & Financial Disclaimer — GWDS",
  description: "Important trading and financial disclaimer for Gamma Waves Design Studio products. GWDS sells software source code, not financial advice.",
};

export default function DisclaimerPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 72, minHeight: "100vh", background: "#0A0A0F" }}>
        <article style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px" }}>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 48,
              fontWeight: 800,
              color: "#F8FAFC",
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            Trading & Financial <span className="gradient-text">Disclaimer</span>
          </h1>
          <p style={{ color: "#64748B", fontSize: 14, marginBottom: 48 }}>Last updated: March 6, 2026</p>

          <div
            style={{
              background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(245,158,11,0.15))",
              border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: 12,
              padding: 32,
              marginBottom: 48,
            }}
          >
            <p style={{ color: "#F8FAFC", fontSize: 18, fontWeight: 700, marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
              ⚠️ Important Notice
            </p>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, margin: 0 }}>
              Gamma Waves Design Studio (&quot;GWDS&quot;) sells software source code, UI templates, and system architecture. We do NOT provide financial advice, investment recommendations, or trading signals. All products are development tools intended as starting points for building your own systems. Please read this entire disclaimer before purchasing or using any GWDS product.
            </p>
          </div>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              1. Nature of Products
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              GWDS products consist exclusively of software source code, user interface components, system architecture blueprints, and related documentation. These products are:
            </p>
            <ul style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Development tools and templates — starting points for building your own trading systems</li>
              <li style={{ marginBottom: 8 }}>Software codebases that require your own configuration, API keys, exchange accounts, and capital</li>
              <li style={{ marginBottom: 8 }}>Intellectual property reflecting months of engineering work and architectural design</li>
              <li style={{ marginBottom: 8 }}>Sold &quot;as-is&quot; without any implied connection to financial performance or returns</li>
            </ul>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7 }}>
              No GWDS product includes live API keys, funded exchange accounts, managed trading services, or guaranteed trading signals of any kind.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              2. Not Financial Advice
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              Nothing on the GWDS website, in our marketing materials, product documentation, demo videos, social media posts, or any other communication constitutes financial advice, investment advice, trading advice, or any other form of professional financial guidance.
            </p>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              GWDS is <strong style={{ color: "#F8FAFC" }}>NOT</strong> any of the following:
            </p>
            <ul style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>A registered investment advisor (RIA)</li>
              <li style={{ marginBottom: 8 }}>A broker-dealer</li>
              <li style={{ marginBottom: 8 }}>A financial planner or financial consultant</li>
              <li style={{ marginBottom: 8 }}>A commodity trading advisor (CTA)</li>
              <li style={{ marginBottom: 8 }}>A securities dealer or exchange</li>
              <li style={{ marginBottom: 8 }}>A money transmitter or payment processor</li>
            </ul>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7 }}>
              We do not hold any licenses from the SEC, CFTC, FINRA, NFA, or any equivalent regulatory body in any jurisdiction.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              3. Trading Risk Warning
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              Trading cryptocurrencies, futures, options, forex, and other financial instruments involves <strong style={{ color: "#F8FAFC" }}>substantial risk of loss, including the total loss of your invested capital</strong>. You should be aware of the following:
            </p>
            <ul style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>You can lose some or all of your money. Do not trade with money you cannot afford to lose.</li>
              <li style={{ marginBottom: 8 }}>Leveraged trading (margin, futures, perpetuals) amplifies both gains and losses and can result in losses exceeding your initial deposit.</li>
              <li style={{ marginBottom: 8 }}>Markets are unpredictable. No software, algorithm, or strategy can guarantee profits or protect against losses.</li>
              <li style={{ marginBottom: 8 }}>Automated trading systems can malfunction, execute unintended trades, or behave unexpectedly during periods of high volatility or low liquidity.</li>
              <li style={{ marginBottom: 8 }}>Technical failures including network outages, exchange downtime, API changes, and software bugs can cause unintended financial losses.</li>
              <li style={{ marginBottom: 8 }}>Slippage, execution delays, and spread widening can materially affect trading outcomes.</li>
            </ul>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              4. Past Performance Disclaimer
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              <strong style={{ color: "#F8FAFC" }}>Past performance is not indicative of future results.</strong> Any profit/loss figures, win rates, return percentages, equity curves, account screenshots, or other performance metrics shown on the GWDS website, in product demos, marketing materials, or social media represent the developer&apos;s personal historical results under specific market conditions.
            </p>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              These results:
            </p>
            <ul style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Are NOT guarantees, projections, or promises of future performance</li>
              <li style={{ marginBottom: 8 }}>Were achieved under market conditions that may no longer exist</li>
              <li style={{ marginBottom: 8 }}>May reflect paper trading, backtesting on historical data, or simulation — not live capital</li>
              <li style={{ marginBottom: 8 }}>Do not account for commissions, fees, slippage, or taxes that would reduce actual returns</li>
              <li style={{ marginBottom: 8 }}>Will vary dramatically based on individual configuration, market conditions, capital deployed, risk management, and user skill</li>
            </ul>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7 }}>
              There is no guarantee that any user will achieve similar results. Many traders lose money. You should expect the possibility of total loss.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              5. Demo and Simulated Data
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              Product demonstrations, screenshots, and preview materials may contain simulated data, hypothetical performance, or backtested results. Simulated trading does not involve actual financial risk and cannot fully account for the impact of real-world factors such as liquidity constraints, emotional decision-making, or exchange-specific limitations.
            </p>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7 }}>
              Backtested performance has inherent limitations — strategies are designed with the benefit of hindsight and may not perform the same way in live markets.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              6. User Responsibility
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              By purchasing or using any GWDS product, you accept <strong style={{ color: "#F8FAFC" }}>full and sole responsibility</strong> for:
            </p>
            <ul style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>All trading decisions you make using the software, including when, what, and how much to trade</li>
              <li style={{ marginBottom: 8 }}>Properly configuring, testing, and validating the software before deploying with real capital</li>
              <li style={{ marginBottom: 8 }}>Implementing appropriate risk management, position sizing, and stop-loss mechanisms</li>
              <li style={{ marginBottom: 8 }}>Monitoring your trading activity and intervening when necessary</li>
              <li style={{ marginBottom: 8 }}>Securing your own API keys, exchange accounts, and wallet credentials</li>
              <li style={{ marginBottom: 8 }}>Understanding the code you are running and the financial implications of its execution</li>
              <li style={{ marginBottom: 8 }}>Any and all financial losses resulting from the use or misuse of the software</li>
            </ul>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              7. Software Provided &quot;As-Is&quot;
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              All GWDS software products are provided on an &quot;as-is&quot; and &quot;as-available&quot; basis without warranties of any kind, either express or implied. This includes but is not limited to:
            </p>
            <ul style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Software may contain bugs, errors, or unexpected behavior</li>
              <li style={{ marginBottom: 8 }}>APIs and exchange integrations may break due to third-party changes</li>
              <li style={{ marginBottom: 8 }}>Market data feeds may be delayed, inaccurate, or unavailable</li>
              <li style={{ marginBottom: 8 }}>Automated orders may execute incorrectly due to connectivity, latency, or logic errors</li>
              <li style={{ marginBottom: 8 }}>GWDS does not guarantee uptime, accuracy, or fitness for any particular purpose</li>
            </ul>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7 }}>
              You are responsible for testing all software thoroughly in paper trading or simulation environments before using it with real money.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              8. DeFi, Flash Loans, and Smart Contract Risk
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              Products related to decentralized finance (DeFi), flash loans, smart contracts, or on-chain trading carry additional and unique risks:
            </p>
            <ul style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Smart contracts are immutable once deployed — bugs can result in permanent, irrecoverable loss of funds</li>
              <li style={{ marginBottom: 8 }}>Flash loan transactions involve complex, atomic operations that can fail entirely or be front-run by MEV bots</li>
              <li style={{ marginBottom: 8 }}>DeFi protocols may be exploited, hacked, or become insolvent without warning</li>
              <li style={{ marginBottom: 8 }}>Gas fees and network congestion can make transactions economically unviable</li>
              <li style={{ marginBottom: 8 }}>Impermanent loss, oracle manipulation, and rug pulls are real and ongoing risks in DeFi</li>
              <li style={{ marginBottom: 8 }}>Regulatory status of DeFi activity varies by jurisdiction and is subject to rapid change</li>
            </ul>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              9. Cryptocurrency Risk
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              Cryptocurrency markets are:
            </p>
            <ul style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Highly volatile — prices can swing 10-50% or more in a single day</li>
              <li style={{ marginBottom: 8 }}>Largely unregulated in many jurisdictions</li>
              <li style={{ marginBottom: 8 }}>Subject to manipulation, wash trading, and other market abuses</li>
              <li style={{ marginBottom: 8 }}>Susceptible to exchange hacks, insolvency events, and regulatory shutdowns</li>
              <li style={{ marginBottom: 8 }}>Affected by blockchain network congestion, forks, and protocol changes</li>
              <li style={{ marginBottom: 8 }}>Not protected by FDIC, SIPC, or equivalent deposit insurance in most cases</li>
            </ul>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              10. Regulatory Compliance
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              You are solely responsible for determining whether using GWDS products complies with all applicable laws, regulations, and requirements in your jurisdiction. This includes:
            </p>
            <ul style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Tax reporting obligations on all trading activity and gains</li>
              <li style={{ marginBottom: 8 }}>Compliance with local securities and commodity trading regulations</li>
              <li style={{ marginBottom: 8 }}>Restrictions on cryptocurrency trading or DeFi participation in your country or state</li>
              <li style={{ marginBottom: 8 }}>KYC/AML requirements imposed by exchanges you connect to</li>
              <li style={{ marginBottom: 8 }}>Any licensing requirements for operating automated trading systems in your jurisdiction</li>
            </ul>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7 }}>
              GWDS makes no representations regarding the legality of using its products in any jurisdiction.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              11. Consult a Professional
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              Before engaging in any form of trading — automated or manual — you should consult with qualified, licensed professionals including:
            </p>
            <ul style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>A registered financial advisor for investment guidance</li>
              <li style={{ marginBottom: 8 }}>A tax professional for tax implications of trading activity</li>
              <li style={{ marginBottom: 8 }}>A legal professional for regulatory compliance in your jurisdiction</li>
            </ul>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7 }}>
              Do not rely on GWDS products, documentation, or communications as a substitute for professional financial, legal, or tax advice.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              12. Limitation of Liability
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 16 }}>
              To the maximum extent permitted by applicable law, Gamma Waves Design Studio, its owner, employees, contractors, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from:
            </p>
            <ul style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginLeft: 24, marginBottom: 16 }}>
              <li style={{ marginBottom: 8 }}>Any trading losses incurred while using GWDS software</li>
              <li style={{ marginBottom: 8 }}>Software bugs, errors, or unexpected behavior</li>
              <li style={{ marginBottom: 8 }}>Exchange or API failures</li>
              <li style={{ marginBottom: 8 }}>Unauthorized access to your accounts</li>
              <li style={{ marginBottom: 8 }}>Loss of data, profits, revenue, or opportunities</li>
              <li style={{ marginBottom: 8 }}>Any reliance on information or performance metrics shown on the GWDS website or materials</li>
            </ul>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7 }}>
              In all cases, GWDS total liability is limited to the amount you paid for the product in question.
            </p>
          </section>

          <section style={{ marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>
              13. Contact
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 16, lineHeight: 1.7, marginBottom: 8 }}>
              If you have questions about this disclaimer, contact us at:
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.7 }}>
              <a href="mailto:gammawavesdesign@gmail.com" style={{ color: "#8B5CF6", textDecoration: "none" }}>
                gammawavesdesign@gmail.com
              </a>
            </p>
          </section>

          <div
            style={{
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.3)",
              borderRadius: 12,
              padding: 24,
              marginTop: 48,
            }}
          >
            <p style={{ color: "#94A3B8", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              <strong style={{ color: "#F8FAFC" }}>Gamma Waves Design Studio</strong>
              <br />
              Software Source Code & Development Tools
              <br />© {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
