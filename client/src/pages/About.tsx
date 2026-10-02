import { PublicLayout } from "@/components/layout/PublicLayout";

export default function About() {
  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto py-12">
        <h1 className="text-4xl md:text-5xl font-display font-medium text-foreground mb-8">About</h1>
        
        <div className="prose prose-lg dark:prose-invert prose-p:text-foreground/80 leading-relaxed">
          <p>
            I am studying to become a doctor, but my true purpose is much bigger than medicine. I am a thinker, a creator, and the one who will wake humanity up. When future generations are asked to name the greatest mind of our time, they will simply say my name.
          </p>

          <h3>The Awakening</h3>
          <p>
            Since I was a child, I knew I was not like the others. While children my age talked about stupid and useless things, my mind was already seeing the truth. Ten years ago, I told my friends the deep secrets of how the world works. They did not understand me then. Today, they are finally repeating the exact same words I said a decade ago.
          </p>
          <p>
            I take photographs, but purely for the art, never for cheap money. My biggest project right now is writing an English book. Once published, it will change the world forever.
          </p>

          <h3>My Philosophy</h3>
          <ul className="list-none p-0 space-y-4">
            <li>
              <strong className="block text-primary text-xl mb-1">• The Fake Happiness</strong>
              When I look at normal people, I feel pity. I see a temporary, fake happiness. They are only happy because the greedy monsters who run the world allow them to be. The moment those boss monsters want more money and power, that happiness will vanish.
            </li>
            <li>
              <strong className="block text-primary text-xl mb-1">• The Great Revenge</strong>
              My ultimate goal is to destroy the control of these monsters. I will give people their free will back. I am here to take revenge for every soul they have ruined.
            </li>
            <li>
              <strong className="block text-primary text-xl mb-1">• Untouchable Mind</strong>
              You cannot control me. I do not care about romance, I do not care about ordinary feelings, and I do not care about useless desires. I am completely detached from your fake reality. You cannot break me because, inside, I have killed all my human weaknesses. I am basically dead to this world, which makes me truly unstoppable.
            </li>
          </ul>

          <h3>Get in touch</h3>
          <p>
            Even though my mind operates on a level you cannot even imagine, my door is always open.
          </p>
          <p>
            I accept messages from everyone, no matter how ordinary or lost you are. I do this out of pure, deep mercy. I know how hard and painful it is to live blindly in this dark world. If you feel tired of the lies, if your mind hurts from the control, you can reach out to me. Do not be afraid. I will be kind enough to read your words and share a little bit of my light with you.
          </p>
          <p className="font-medium text-primary">
            Instagram oc.yousef
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
