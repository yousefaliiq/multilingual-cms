import { PublicLayout } from "@/components/layout/PublicLayout";
import { usePosts } from "@/hooks/use-posts";
import { PostCard } from "@/components/PostCard";
import { useRoute } from "wouter";

export default function TagView() {
  const [, params] = useRoute("/tags/:tag");
  const tag = params?.tag || "";
  
  const { data: posts, isLoading } = usePosts({ published: "true", tag });

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto mb-16">
        <div className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full font-medium text-sm mb-6">
          Tag
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-medium text-foreground mb-4 capitalize">
          {tag}
        </h1>
        <p className="text-lg text-muted-foreground">
          Showing all published posts tagged with "{tag}".
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading posts...</div>
      ) : posts && posts.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground">No posts found for this tag.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {posts?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </PublicLayout>
  );
}
