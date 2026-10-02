import { PublicLayout } from "@/components/layout/PublicLayout";

export default function PrivacyPolicy() {
  return (
    <PublicLayout>
      <article className="max-w-[720px] mx-auto py-20 px-6 prose prose-lg dark:prose-invert">
        <h1>GLOBAL DATA PRIVACY POLICY</h1>
        <p>Controller Identity: oc.yousef<br />
        Contact: yousefblog@outlook.com<br />
        EU/UK Representative: N/A</p>
        
        <h2>1. DATA CATEGORIES AND PURPOSES</h2>
        <p>We adhere to strict data minimization principles under the GDPR.</p>
        <ul>
          <li><strong>Network Logs:</strong> We temporarily process IP addresses and browser metadata to prevent unauthorized access and DDoS attacks. Basis: Legitimate Interest (Security).</li>
          <li><strong>Contractual Records:</strong> To maintain proof of your agreement, we store pseudonymous identifiers (specifically a salted cryptographic hash of your IP address), timestamps, and the version of the Agreement accepted. Basis: Performance of a Contract.</li>
          <li><strong>Submissions:</strong> Information you voluntarily provide via our contact portal. Basis: Consent. You may withdraw consent at any time, which will result in the deletion of your submission unless retention is required for legal reasons.</li>
        </ul>
        
        <h2>2. RECIPIENTS AND TRANSFERS</h2>
        <p>Data may be shared with essential service providers (e.g., hosting, CDN) solely to maintain Site operations. We do not sell data to third-party brokers. Data is transferred to the United States (Wyoming) using Standard Contractual Clauses (SCCs) or other applicable legal mechanisms to ensure an adequate level of protection.</p>
        
        <h2>3. DATA RETENTION</h2>
        <ul>
          <li><strong>Security Logs:</strong> Automatically purged on a rolling 30-day schedule.</li>
          <li><strong>Contractual Records:</strong> Retained for five (5) years (matching the statute of limitations for contract disputes) for the "establishment, exercise, or defense of legal claims" under GDPR Article 17(3)(e).</li>
        </ul>
        
        <h2>4. YOUR RIGHTS AND COOKIES</h2>
        <p>Users in the EU/UK have rights to access, rectification, and erasure of their personal data. Requests for erasure of "Contractual Records" may be declined where retention is necessary for legal defense. To exercise your rights or lodge a complaint with a supervisory authority, please use our secure contact portal. We use only essential security cookies; we do not use third-party analytics or marketing trackers.</p>
      </article>
    </PublicLayout>
  );
}
