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
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-medium leading-[1.1] text-foreground mb-6">
          ocyousef blog — They Lied and Here&apos;s the Truth.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
          This blog exists for one reason and one reason only: to expose what they hid and reveal the truth nobody dares to say.
        </p>
      </section>

      {isLoading ? (
        <div className="py-20 flex justify-center text-muted-foreground">Loading journal entries...</div>
      ) : (
        <div className="space-y-24">
          {featuredPost && (
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-medium tracking-wide uppercase text-muted-foreground">Latest Article</h2>
              </div>
              <PostCard post={featuredPost} featured />
            </section>
          )}

          {recentPosts && recentPosts.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-medium tracking-wide uppercase text-muted-foreground">Recent Truths</h2>
                <Link href="/archive" className="group flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                  View Archive <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {recentPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </PublicLayout>
  );
}
