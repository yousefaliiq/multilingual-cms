import { PublicLayout } from "@/components/layout/PublicLayout";
import { PostCard } from "@/components/PostCard";
import { usePosts } from "@/hooks/use-posts";
import { Link } from "wouter";
import { MoveRight } from "lucide-react";

export default function Home() {
  const { data: posts, isLoading } = usePosts({ published: "true" });
  const featuredPost = posts?.[0];
  const recentPosts = posts?.slice(1, 7);

  return (
    <PublicLayout>
      <section className="py-8 md:py-16 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-primary mb-4">A personal journal by Yousef Ali</p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-medium leading-[1.08] text-foreground mb-6">
          Notes, ideas, and things worth keeping.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
          A quiet place for my writing, observations, and the things I want to come back to later.
        </p>
      </section>

      {isLoading ? (
        <div className="py-20 flex justify-center text-muted-foreground">Loading journal...</div>
      ) : (
        <div className="space-y-20 md:space-y-24">
          {featuredPost && (
            <section>
              <div className="flex items-center justify-between mb-7">
                <h2 className="text-sm font-semibold tracking-[0.16em] uppercase text-muted-foreground">Latest entry</h2>
              </div>
              <PostCard post={featuredPost} featured />
            </section>
          )}

          {recentPosts && recentPosts.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-7 gap-4">
                <h2 className="text-sm font-semibold tracking-[0.16em] uppercase text-muted-foreground">More from the journal</h2>
                <Link href="/archive" className="group flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors whitespace-nowrap">
                  Archive <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {recentPosts.map((post) => <PostCard key={post.id} post={post} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </PublicLayout>
  );
}
