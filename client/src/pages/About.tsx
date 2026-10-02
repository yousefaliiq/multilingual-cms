import { PublicLayout } from "@/components/layout/PublicLayout";

export default function About() {
  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto py-10 md:py-14">
        <p className="text-sm uppercase tracking-[0.2em] text-primary mb-4">About</p>
        <h1 className="text-4xl md:text-5xl font-display font-medium text-foreground mb-8">A place to keep my thoughts.</h1>
        <div className="prose prose-lg dark:prose-invert prose-p:text-foreground/80 leading-relaxed">
          <p>
            ATLAS is my personal journal. I use it to publish ideas, observations, and writing I want to keep in one place instead of scattering them across apps and notes.
          </p>
          <p>
            I also built the publishing system behind it: the editor, multilingual article versions, media uploads, archive, tags, RSS, metadata, and the private studio used to manage everything.
          </p>
          <p>
            The public side stays intentionally quiet. The complicated part belongs behind the page, not in front of the reader.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
