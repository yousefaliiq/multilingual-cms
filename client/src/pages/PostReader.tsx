import { PublicLayout } from "@/components/layout/PublicLayout";
import { usePost, getActiveTranslation } from "@/hooks/use-posts";
import { Link, useRoute } from "wouter";
import { format } from "date-fns";
import { Clock, Calendar, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PostBody } from "@/components/post/PostBody";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function TagPopoverPill({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return null;
  
  if (tags.length === 1) {
    return (
      <Link 
        href={`/tags/${tags[0]}`}
        className="h-6 sm:h-7 px-2 sm:px-3 text-[11px] sm:text-xs uppercase tracking-wider font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded transition-colors flex items-center"
      >
        {tags[0]}
      </Link>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="h-6 sm:h-7 px-2 sm:px-3 text-[11px] sm:text-xs uppercase tracking-wider font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded transition-colors flex items-center gap-1">
          {tags[0]}
          <span className="opacity-70">
            <span className="sm:hidden">+{tags.length - 1}</span>
            <span className="hidden sm:inline"> +{tags.length - 1}</span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent 
        side="bottom"
        align="start"
        sideOffset={10}
        avoidCollisions={false}
        className="w-auto p-3 bg-popover/70 backdrop-blur-xl border-border/40 shadow-xl rounded-xl"
      >
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link 
              key={tag} 
              href={`/tags/${tag}`}
              className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function PostReader() {
  const [, params] = useRoute("/post/:slug");
  const slug = params?.slug || "";
  
  const { data: post, isLoading, error } = usePost(slug);
  const [selectedLang, setSelectedLang] = useState(() => 
    new URLSearchParams(window.location.search).get("lang") || "English"
  );

  const availableLanguages = (post?.availableLanguages && post.availableLanguages.length > 0)
    ? post.availableLanguages
    : (post?.translations && post.translations.length > 0
        ? Array.from(new Set([post.defaultLanguage || 'English', ...post.translations.map(t => t.language)]))
        : []);

  useEffect(() => {
    if (post) {
      const searchParams = new URLSearchParams(window.location.search);
      const urlLang = searchParams.get("lang");
      
      if (urlLang && availableLanguages.includes(urlLang)) {
        setSelectedLang(urlLang);
      } else if (post.defaultLanguage && availableLanguages.includes(post.defaultLanguage)) {
        setSelectedLang(post.defaultLanguage);
      } else if (availableLanguages.length > 0) {
        setSelectedLang(availableLanguages[0]);
      }
    }
  }, [post, availableLanguages]);

  useEffect(() => {
    const handlePopState = () => {
      const lang = new URLSearchParams(window.location.search).get("lang");
      if (lang) setSelectedLang(lang);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleLangChange = (lang: string) => {
    setSelectedLang(lang);
    const newParams = new URLSearchParams(window.location.search);
    newParams.set("lang", lang);
    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    window.history.pushState({}, "", newUrl);
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleScroll = () => setIsMenuOpen(false);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMenuOpen]);

  const activeTranslation = getActiveTranslation(post || null, selectedLang);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="animate-pulse flex flex-col gap-4 max-w-prose mx-auto mt-20">
          <div className="h-10 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded w-full mt-8"></div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !post || !activeTranslation) {
    return (
      <PublicLayout>
        <div className="text-center py-32">
          <h2 className="text-2xl font-display mb-4">Post not found</h2>
          <Link href="/archive" className="text-primary hover:underline">Return to archive</Link>
        </div>
      </PublicLayout>
    );
  }

  const isRTL = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(activeTranslation.title + activeTranslation.content) || 
                selectedLang.toLowerCase().startsWith('ar') || 
                selectedLang.toLowerCase().includes('arab');

  const langAbbrev = selectedLang.substring(0, 2).toUpperCase();

  return (
    <PublicLayout>
      <article className="max-w-[720px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedLang}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header Metadata */}
            <header className="mb-12">
              <div dir="ltr" className="flex items-center flex-nowrap whitespace-nowrap gap-x-3 sm:gap-x-4 gap-y-0 justify-start text-sm text-muted-foreground mb-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] [-ms-overflow-style:none]">
                <span className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="truncate">
                    <span className="hidden sm:inline">{format(new Date(post.publishedAt || post.createdAt), "MMM dd, yyyy")}</span>
                    <span className="sm:hidden">{format(new Date(post.publishedAt || post.createdAt), "MMM dd")}</span>
                  </span>
                </span>
                
                {activeTranslation.readingTime && (
                  <>
                    <span className="mx-1.5 sm:mx-2 w-1 h-1 rounded-full bg-border shrink-0" />
                    <span className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">{activeTranslation.readingTime}</span>
                      <span className="sm:hidden">{activeTranslation.readingTime.replace(/ min read| mins read/i, 'm')}</span>
                    </span>
                  </>
                )}

                {post.tags && post.tags.length > 0 && (
                  <>
                    <span className="mx-1.5 sm:mx-2 w-1 h-1 rounded-full bg-border shrink-0" />
                    <TagPopoverPill tags={post.tags} />
                  </>
                )}

                {/* Language Switcher in Metadata Row */}
                {availableLanguages.length > 1 && (
                  <>
                    <span className="mx-1.5 sm:mx-2 w-1 h-1 rounded-full bg-border shrink-0" />
                    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen} modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-6 sm:h-7 px-2 sm:px-3 rounded-full bg-secondary/40 border border-border/40 backdrop-blur-md shadow-sm hover:bg-secondary/60 transition-all flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-bold tracking-wider uppercase"
                        >
                          <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                          <span>{langAbbrev}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        side="bottom"
                        align="start"
                        sideOffset={10}
                        avoidCollisions={false}
                        className="w-40 bg-popover/70 backdrop-blur-xl rounded-xl shadow-2xl border-border/40 p-1"
                      >
                        <DropdownMenuRadioGroup value={selectedLang} onValueChange={handleLangChange}>
                          {availableLanguages.map((lang) => (
                            <DropdownMenuRadioItem 
                              key={lang} 
                              value={lang}
                              className="rounded-lg text-sm focus:bg-primary/10 focus:text-primary data-[state=checked]:bg-primary/10 data-[state=checked]:text-primary cursor-pointer transition-colors pl-9 pr-3 py-2"
                            >
                              {lang}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>

              <h1 
                dir={isRTL ? "rtl" : "ltr"} 
                className={cn(
                  "text-4xl md:text-5xl lg:text-6xl font-display font-medium leading-[1.15] text-foreground mb-6",
                  isRTL && "text-right"
                )}
              >
                {activeTranslation.title}
              </h1>

              {activeTranslation.subtitle && (
                <p 
                  dir={isRTL ? "rtl" : "ltr"} 
                  className={cn(
                    "text-xl md:text-2xl text-muted-foreground leading-relaxed font-display italic",
                    isRTL && "text-right"
                  )}
                >
                  {activeTranslation.subtitle}
                </p>
              )}
            </header>

            {/* Cover Image */}
            {post.coverImage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`w-full overflow-hidden bg-muted mb-16 shadow-2xl shadow-black/5 transition-all duration-500 ${post.coverImageSize || "aspect-video"} ${post.coverImageShape || "rounded-2xl"}`}
              >
                <img 
                  src={post.coverImage} 
                  alt={activeTranslation.title || "Post cover image"}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}

            {/* Content Body */}
            <PostBody content={activeTranslation.content} isRTL={isRTL} />
          </motion.div>
        </AnimatePresence>
      </article>
    </PublicLayout>
  );
}
