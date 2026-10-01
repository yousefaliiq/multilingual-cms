import { Link } from "wouter";
import { format } from "date-fns";
import type { PostWithTranslations } from "@shared/routes";
import { ArrowRight, Clock } from "lucide-react";

interface PostCardProps {
  post: PostWithTranslations;
  featured?: boolean;
}

export function PostCard({ post, featured = false }: PostCardProps) {
  return (
    <Link href={`/post/${post.slug}`} className="block group">
      <article className={`
        relative flex flex-col bg-card rounded-2xl overflow-hidden border border-border/50
        transition-all duration-500 ease-out
        hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20
        ${featured ? "md:flex-row md:min-h-[400px]" : "h-full"}
      `}>
        {/* Cover Image */}
        {post.coverImage && (
          <div className={`
            relative overflow-hidden bg-muted transition-all duration-500
            ${featured ? "md:w-1/2" : post.coverImageSize || "aspect-video"}
            ${!featured ? (post.coverImageShape || "rounded-none") : ""}
          `}>
            <div className="absolute inset-0 bg-foreground/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
            <img 
              src={post.coverImage} 
              alt={post.title || "Post cover image"}
              className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>
        )}

        {/* Content */}
        <div className={`
          flex flex-col flex-1 p-6 md:p-8
          ${featured && !post.coverImage ? "md:p-12 justify-center" : ""}
        `}>
          <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">
            <time dateTime={post.publishedAt?.toString() || post.createdAt.toString()}>
              {format(new Date(post.publishedAt || post.createdAt), "MMM dd, yyyy")}
            </time>
            {post.readingTime && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readingTime}
                </span>
              </>
            )}
          </div>

          <h3 className={`
            font-display font-medium text-foreground mb-3 leading-tight
            group-hover:text-primary transition-colors duration-300
            ${featured ? "text-3xl md:text-4xl" : "text-xl"}
          `}>
            {post.title}
          </h3>

          {post.subtitle && (
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6 line-clamp-2 md:line-clamp-3">
              {post.subtitle}
            </p>
          )}

          <div className="mt-auto pt-6 flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {post.tags?.map((tag: string) => (
                <span key={tag} className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
