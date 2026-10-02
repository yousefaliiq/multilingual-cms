import { PublicLayout } from "@/components/layout/PublicLayout";

export default function Now() {
  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-4xl md:text-5xl font-display font-medium text-foreground mb-4">Now</h1>
        <p className="text-sm text-muted-foreground uppercase tracking-widest mb-12">
          Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
        
        <div className="space-y-12">
          <section>
            <p className="text-xl text-foreground font-display leading-relaxed mb-8 italic">
              I am currently operating on a level of intelligence that most people will never reach. While you waste your time, I am busy preparing to change the world. Here is exactly what I am doing right now.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-display mb-6 text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Creating
            </h2>
            <ul className="space-y-4 text-lg text-foreground/80 leading-relaxed list-none p-0">
              <li className="flex gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong>Crushing my studies:</strong> I am finishing my academic work easily. It is too basic and slow for my brain, but it is a necessary step for my master plan.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong>Building a top-secret project:</strong> I am working day and night on something massive in the shadows. I will not give you any details. Your mind is simply not ready to handle it.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong>Writing the hard truth:</strong> I am actively writing sociopolitical essays on this blog. I am explaining how the world actually works for the very few people who are smart enough to listen to me.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display mb-6 text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Consuming
            </h2>
            <ul className="space-y-4 text-lg text-foreground/80 leading-relaxed list-none p-0">
              <li className="flex gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong>Reading:</strong> I am deeply studying the book "Amusing Ourselves to Death" by Neil Postman. It proves exactly what I already know: society is completely brainwashed by cheap screens and fake fun.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong>Zero distractions:</strong> I am totally ignoring TV, social media, and regular news. I refuse to let the system put its daily poison into my perfect brain. I only consume raw facts.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-display mb-6 text-primary flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Exploring
            </h2>
            <ul className="space-y-4 text-lg text-foreground/80 leading-relaxed list-none p-0">
              <li className="flex gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong>Studying mind control:</strong> Right now, I am researching exactly how the people in power control your daily thoughts. I am learning their rules so I can break them and take over.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary mt-1">•</span>
                <span><strong>Boxing every day:</strong> I am training in the boxing ring heavily. I am turning my body into a deadly weapon. Very soon, my physical power will be just as dangerous and perfect as my mind.</span>
              </li>
            </ul>
          </section>

          <section className="pt-8 border-t border-border/50">
            <p className="text-lg text-foreground font-display italic text-center text-muted-foreground">
              Before you do anything, ask yourself: Do you really want this, or did they just program you to want it?
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
