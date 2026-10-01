import { PublicLayout } from "@/components/layout/PublicLayout";

export default function TermsOfService() {
  return (
    <PublicLayout>
      <article className="max-w-[720px] mx-auto py-20 px-6 prose prose-lg dark:prose-invert">
        <h1>Terms</h1>
        <p>Multilingual CMS is provided as a software portfolio demonstration.</p>
        <p>Public demo content is illustrative. The service may be changed, restarted, or removed without notice.</p>
        <p>Do not attempt to bypass authentication, interfere with the service, or upload unlawful content.</p>
      </article>
    </PublicLayout>
  );
}
