import { PublicLayout } from "@/components/layout/PublicLayout";

export default function PrivacyPolicy() {
  return (
    <PublicLayout>
      <article className="max-w-[720px] mx-auto py-20 px-6 prose prose-lg dark:prose-invert">
        <h1>Privacy</h1>
        <p>Multilingual CMS is a portfolio demonstration. It does not include advertising or analytics trackers.</p>
        <p>The administrative area uses an essential session cookie for authentication. Hosting and infrastructure providers may process standard request metadata required to operate and secure the service.</p>
        <p>Do not enter sensitive personal information into this demonstration.</p>
      </article>
    </PublicLayout>
  );
}
