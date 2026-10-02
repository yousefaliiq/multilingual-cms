import { PublicLayout } from "@/components/layout/PublicLayout";

export default function Disclaimers() {
  return (
    <PublicLayout>
      <article className="max-w-[720px] mx-auto py-20 px-6 prose prose-lg dark:prose-invert">
        <h1>COMPREHENSIVE DISCLAIMERS AND CONTENT WARNINGS</h1>
        
        <h2>1. SUBJECTIVE COMMENTARY AND RHETORICAL DEVICES</h2>
        <p>This Site provides subjective sociopolitical commentary and independent philosophical inquiry.</p>
        <h3>1.1 Opinion and Fair Comment</h3>
        <p>All content represents the personal opinions of the Publisher and is intended for civic discourse regarding matters of public interest.</p>
        <h3>1.2 Literary Devices</h3>
        <p>The Site utilizes rhetorical hyperbole, satire, and abrasive language to critique societal trends. Such content is not intended to assert objective, empirically verifiable facts regarding the private lives of individuals.</p>
        
        <h2>2. INFORMED ASSUMPTION OF RISK</h2>
        <p>The content on this Site is deliberately provocative. By clicking "I Agree" to the Terms of Service, User acknowledges they have been informed of the nature of the content and voluntarily assumes the emotional risks associated with viewing such material. This assumption of risk does not act as a waiver of liability for statements a court may determine to be factual defamation or for content that violates applicable law.</p>
        
        <h2>3. SEPARATION OF CAPACITY</h2>
        <p>The Publisher operates this Site strictly in a personal capacity as a private citizen. The views expressed herein are personal and do not represent the views, ethical stances, or operational guidelines of any employer, university, or professional institution with which the Publisher may be affiliated. This content is provided for informational and sociological purposes and does not constitute professional advice (medical, legal, or otherwise).</p>
      </article>
    </PublicLayout>
  );
}
