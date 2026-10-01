import { PublicLayout } from "@/components/layout/PublicLayout";
import { usePosts } from "@/hooks/use-posts";
import { PostCard } from "@/components/PostCard";
import { useState, useMemo } from "react";
import { Search, Shuffle } from "lucide-react";
import { useLocation } from "wouter";

export default function Archive() {
  const { data: posts, isLoading } = usePosts({ published: "true" });
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    if (!searchQuery) return posts;
    const lowerQuery = searchQuery.toLowerCase();
    return posts.filter(
      (p) =>
        (p.title?.toLowerCase().includes(lowerQuery) ?? false) ||
        (p.subtitle?.toLowerCase().includes(lowerQuery) ?? false) ||
        (p.content?.toLowerCase().includes(lowerQuery) ?? false) ||
        p.tags?.some((t) => t.toLowerCase().includes(lowerQuery))
    );
  }, [posts, searchQuery]);

  const allTags = useMemo(() => {
    if (!posts) return [];
    const tags = new Set<string>();
    posts.forEach((p) => p.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [posts]);

  const handleRandomPost = () => {
    if (!posts || posts.length === 0) return;
    const random = posts[Math.floor(Math.random() * posts.length)];
    setLocation(`/post/${random.slug}`);
  };

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-display font-medium text-foreground mb-4">Archive</h1>
        <p className="text-lg text-muted-foreground mb-12">
          A complete collection of all published entries.
        </p>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
          </div>
          
          <button 
            onClick={handleRandomPost}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-colors font-medium text-sm w-full md:w-auto justify-center"
          >
            <Shuffle className="w-4 h-4" /> Random Post
          </button>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8">
            {allTags.map(tag => (
              <button 
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="text-xs font-medium text-muted-foreground hover:text-primary bg-secondary px-3 py-1.5 rounded-full transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-muted-foreground">Loading archive...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground">No posts found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </PublicLayout>
  );
}
