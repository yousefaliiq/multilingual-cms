import { StudioLayout } from "@/components/layout/StudioLayout";
import { usePosts, useDeletePost } from "@/hooks/use-posts";
import { Link } from "wouter";
import { format } from "date-fns";
import { PenTool, Trash2, ExternalLink, Plus, MoreVertical } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  // Fetch ALL posts (no published filter)
  const { data: posts, isLoading } = usePosts();
  const deletePost = useDeletePost();
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const filteredPosts = posts?.filter(post => {
    if (filter === "published") return post.published;
    if (filter === "draft") return !post.published;
    return true;
  });

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deletePost.mutate(id);
    }
  };

  return (
    <StudioLayout>
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-display font-medium text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your entries and drafts.</p>
          </div>
          <Link 
            href="/studio/editor" 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Post
          </Link>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-card border border-border p-6 rounded-2xl">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Total Posts</h3>
            <p className="text-4xl font-display font-medium text-foreground">{posts?.length || 0}</p>
          </div>
          <div className="bg-card border border-border p-6 rounded-2xl">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Published</h3>
            <p className="text-4xl font-display font-medium text-primary">{posts?.filter(p => p.published).length || 0}</p>
          </div>
          <div className="bg-card border border-border p-6 rounded-2xl">
            <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Drafts</h3>
            <p className="text-4xl font-display font-medium text-muted-foreground">{posts?.filter(p => !p.published).length || 0}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 border-b border-border/50 pb-4">
          {(["all", "published", "draft"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                filter === f ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading entries...</div>
          ) : filteredPosts && filteredPosts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPosts.map(post => (
                    <tr key={post.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{post.title || "Untitled"}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-sm">{post.slug}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          post.published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}>
                          {post.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {format(new Date(post.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {post.published && (
                            <Link href={`/post/${post.slug}`} target="_blank" className="p-2 text-muted-foreground hover:text-primary transition-colors" title="View Public">
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                          <Link href={`/studio/editor?id=${post.id}`} className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Edit" onClick={(e) => {
                            // Ensure the link works correctly with the ID param
                            window.location.href = `/studio/editor?id=${post.id}`;
                          }}>
                            <PenTool className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(post.id, post.title || "Untitled")}
                            disabled={deletePost.isPending}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <PenTool className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No entries found</h3>
              <p className="text-muted-foreground mb-6">Get started by creating your first post.</p>
              <Link 
                href="/studio/editor" 
                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Create Entry
              </Link>
            </div>
          )}
        </div>
      </div>
    </StudioLayout>
  );
}
