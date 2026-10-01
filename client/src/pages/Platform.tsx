import { PublicLayout } from "@/components/layout/PublicLayout";

const features = [
  ["Editorial studio", "Create, update, publish, and organize articles from a protected workspace."],
  ["Multilingual content", "Store multiple language versions while preserving a single article identity and URL structure."],
  ["Media uploads", "Upload cover images to external object storage and reuse the resulting public URLs."],
  ["Discoverability", "Generate canonical metadata, RSS feeds, sitemaps, structured data, archives, and tag pages."],
  ["Responsive reading", "Deliver a focused long-form reading experience across mobile and desktop layouts."],
  ["Persistent sessions", "Keep administrative sessions in PostgreSQL so authentication survives server restarts."],
];

export default function Platform() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto py-12">
        <p className="text-sm uppercase tracking-[0.2em] text-primary mb-4">Platform</p>
        <h1 className="text-4xl md:text-5xl font-display font-medium text-foreground mb-6">What this project demonstrates</h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-12">
          Atlas is designed as a compact full-stack product: public reading, private publishing, structured content, and production deployment in one codebase.
        </p>
        <div className="grid md:grid-cols-2 gap-5">
          {features.map(([title, body]) => (
            <section key={title} className="rounded-2xl border border-border/60 p-6 bg-card/30">
              <h2 className="font-display text-xl mb-3">{title}</h2>
              <p className="text-muted-foreground leading-relaxed">{body}</p>
            </section>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
