import { PublicLayout } from "@/components/layout/PublicLayout";

export default function About() {
  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-4xl md:text-5xl font-display font-medium text-foreground mb-8">About Atlas</h1>
        <div className="prose prose-lg dark:prose-invert prose-p:text-foreground/80 leading-relaxed">
          <p>
            Multilingual CMS is a portfolio project built to demonstrate a complete publishing workflow rather than a static blog template.
          </p>
          <h3>Editorial workflow</h3>
          <p>
            Editors can create drafts, manage metadata and tags, add cover images, publish articles, and maintain language-specific versions from a protected studio.
          </p>
          <h3>Reading experience</h3>
          <p>
            Public pages are responsive and support archives, tags, RSS, search-friendly metadata, server-rendered article snapshots, and multilingual content.
          </p>
          <h3>Technical focus</h3>
          <p>
            The application combines a React frontend with an Express API, PostgreSQL persistence, authenticated administration, object storage, and deployment-ready production builds.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
