import { PublicLayout } from "@/components/layout/PublicLayout";

export default function Disclaimers() {
  return (
    <PublicLayout>
      <article className="max-w-[720px] mx-auto py-20 px-6 prose prose-lg dark:prose-invert">
        <h1>Demo notice</h1>
        <p>This site demonstrates a publishing application and its editorial workflow. Example articles, images, and metadata are provided only to show product behavior.</p>
        <p>The project is not a news service, professional publication, or source of professional advice.</p>
      </article>
    </PublicLayout>
  );
}
