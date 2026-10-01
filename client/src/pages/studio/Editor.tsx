import { StudioLayout } from "@/components/layout/StudioLayout";
import { useCreatePost, useUpdatePost, usePosts } from "@/hooks/use-posts";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import slugify from "slugify";
import { Save, Eye, EyeOff, Loader2, Languages, Plus } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTopicEditor } from "@/components/studio/RichTopicEditor";
import { PostBody } from "@/components/post/PostBody";

export default function Editor() {
  const [location, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const editId = params.get("id");

  const { data: posts, isLoading: isPostsLoading } = usePosts();
  const existingPost = editId ? posts?.find(p => p.id === Number(editId)) : null;

  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const [selectedLang, setSelectedLang] = useState("English");
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [newLangInput, setNewLangInput] = useState("");
  
  const [drafts, setDrafts] = useState<Record<string, {
    title: string;
    subtitle: string;
    content: string;
    readingTime: string;
  }>>({
    English: { title: "", subtitle: "", content: "", readingTime: "" },
  });

  const [commonData, setCommonData] = useState({
    slug: "",
    coverImage: "",
    coverImageSize: "aspect-video",
    coverImageShape: "rounded-2xl",
    published: false,
  });

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [uploading, setUploading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (editId && posts) {
      const post = posts.find(p => p.id === Number(editId));
      if (post) {
        const initialLangs = post.availableLanguages && post.availableLanguages.length > 0 
          ? post.availableLanguages 
          : (post.translations && post.translations.length > 0 
            ? Array.from(new Set([post.defaultLanguage || "English", ...post.translations.map(t => t.language)]))
            : [post.defaultLanguage || "English"]);
            
        const newDrafts: typeof drafts = {};
        
        // Initialize with empty drafts for all known languages
        initialLangs.forEach(lang => {
          newDrafts[lang] = { title: "", subtitle: "", content: "", readingTime: "" };
        });

        // Fill base content
        const baseLang = post.defaultLanguage || "English";
        newDrafts[baseLang] = {
          title: post.title || "",
          subtitle: post.subtitle || "",
          content: post.content || "",
          readingTime: post.readingTime || "",
        };

        // Fill translations
        post.translations?.forEach(t => {
          newDrafts[t.language] = {
            title: t.title,
            subtitle: t.subtitle || "",
            content: t.content,
            readingTime: t.readingTime || "",
          };
        });

        setLanguages(initialLangs);
        setDrafts(newDrafts);
        setCommonData({
          slug: post.slug || "",
          coverImage: post.coverImage || "",
          coverImageSize: post.coverImageSize || "aspect-video",
          coverImageShape: post.coverImageShape || "rounded-2xl",
          published: post.published || false,
        });
        setTags(post.tags || []);
        
        setSelectedLang(post.defaultLanguage || initialLangs[0]);
      }
    }
  }, [posts, editId]);

  const currentDraft = drafts[selectedLang] || { title: "", subtitle: "", content: "", readingTime: "" };

  const updateCurrentDraft = (updates: Partial<typeof currentDraft>) => {
    setDrafts(prev => ({
      ...prev,
      [selectedLang]: { ...(prev[selectedLang] || { title: "", subtitle: "", content: "", readingTime: "" }), ...updates }
    }));
  };

  const handleAddLanguage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const lang = newLangInput.trim();
      if (!lang) return;
      
      if (!languages.includes(lang)) {
        setLanguages(prev => [...prev, lang]);
        setDrafts(prev => ({
          ...prev,
          [lang]: { title: "", subtitle: "", content: "", readingTime: "" }
        }));
      }
      setSelectedLang(lang);
      setNewLangInput("");
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value || "";
    updateCurrentDraft({ title: newTitle });
    
    // Auto-slug only for the first language or if explicitly English
    if (selectedLang === languages[0] || selectedLang.toLowerCase() === 'english') {
      setCommonData(prev => ({
        ...prev,
        slug: (!editId && !prev.slug) || (prev.slug === slugify(currentDraft.title || "", { lower: true })) 
          ? slugify(newTitle, { lower: true, strict: true })
          : prev.slug
      }));
    }
  };

  const handleSave = async (publish: boolean) => {
    const baseLang = editId ? (existingPost?.defaultLanguage || languages[0]) : (languages.find(l => drafts[l]?.title && drafts[l]?.content) || selectedLang);
    const baseDraft = drafts[baseLang] || currentDraft;

    const generatedSlug = commonData.slug || slugify(baseDraft.title || `post-${Date.now()}`, { lower: true, strict: true });
    const finalSlug = editId ? commonData.slug : `${generatedSlug}-${Math.random().toString(36).substring(2, 7)}`;

    const commonPayload = {
      slug: finalSlug,
      coverImage: commonData.coverImage || "",
      coverImageSize: commonData.coverImageSize,
      coverImageShape: commonData.coverImageShape,
      tags: tags,
      published: publish,
    };

    try {
      let postId: number;
      if (editId) {
        postId = Number(editId);
        await updatePost.mutateAsync({ 
          id: postId, 
          updates: { ...commonPayload, ...baseDraft, language: baseLang } 
        });
      } else {
        const newPost = await createPost.mutateAsync({ 
          ...commonPayload, ...baseDraft, language: baseLang 
        });
        postId = newPost.id;
      }

      // Upsert all other translations
      const otherLangs = languages.filter(l => l !== baseLang && drafts[l]?.title && drafts[l]?.content);
      for (const lang of otherLangs) {
        await updatePost.mutateAsync({
          id: postId,
          updates: { ...drafts[lang], language: lang }
        });
      }

      setLocation("/studio/dashboard");
    } catch (error) {
      console.error("Failed to save post:", error);
    }
  };

  const isPending = createPost.isPending || updatePost.isPending;

  return (
    <StudioLayout>
      <div className="max-w-5xl mx-auto flex flex-col">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-display font-medium text-foreground">
              {editId ? "Edit Entry" : "New Entry"}
            </h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg bg-secondary"
              >
                {previewMode ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                {previewMode ? "Edit Mode" : "Preview"}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleSave(false)}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button 
              onClick={() => handleSave(true)}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-lg shadow-primary/20"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish"}
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative group">
              <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Type language and press Enter..."
                value={newLangInput}
                onChange={(e) => setNewLangInput(e.target.value)}
                onKeyDown={handleAddLanguage}
                className="pl-9 w-[280px] bg-background/50 border-border focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div className="flex flex-wrap gap-2 ml-2">
              {languages.map(lang => (
                <Button
                  key={lang}
                  variant={selectedLang === lang ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLang(lang)}
                  className="rounded-full px-4"
                >
                  {lang}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-normal border-primary/20 bg-primary/5 text-primary">
              Editing: {selectedLang}
            </Badge>
          </div>
        </div>

        {(createPost.error || updatePost.error) && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium shrink-0">
            {createPost.error?.message || updatePost.error?.message}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 pb-10">
          <div className={`flex-1 flex flex-col bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden shadow-2xl shadow-black/5 ${previewMode ? 'hidden lg:flex' : 'flex'}`}>
            <div className="flex-1 flex flex-col">
              {!previewMode ? (
                <div className="flex-1 flex flex-col p-8 md:p-12 space-y-8" dir={selectedLang.toLowerCase().includes('arabic') || selectedLang.toLowerCase() === 'ar' ? 'rtl' : 'ltr'}>
                  <div className="space-y-6 shrink-0">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Title ({selectedLang})</label>
                      <input 
                        type="text"
                        placeholder="Enter a compelling title..."
                        value={currentDraft.title || ""}
                        onChange={handleTitleChange}
                        className="w-full text-4xl md:text-5xl font-display font-semibold bg-background/50 rounded-xl px-6 py-4 border border-border focus:border-primary outline-none placeholder:text-muted-foreground/60 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Subtitle ({selectedLang})</label>
                      <input 
                        type="text"
                        placeholder="Add a short subtitle (optional)"
                        value={currentDraft.subtitle || ""}
                        onChange={e => updateCurrentDraft({ subtitle: e.target.value })}
                        className="w-full text-xl font-display italic text-foreground bg-background/50 rounded-xl px-6 py-4 border border-border focus:border-primary outline-none placeholder:text-muted-foreground/60 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="h-px w-24 bg-primary/20 shrink-0" />
                  
                  <div className="space-y-3 flex-1 flex flex-col">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-muted-foreground">Topic ({selectedLang})</label>
                      <p className="text-sm text-muted-foreground">
                        Keep the same writing flow, but now you can bold text, add links, and insert inline images inside the topic itself.
                      </p>
                    </div>
                    <RichTopicEditor
                      value={currentDraft.content || ""}
                      onChange={(content) => updateCurrentDraft({ content })}
                      dir={selectedLang.toLowerCase().includes('arabic') || selectedLang.toLowerCase() === 'ar' ? 'rtl' : 'ltr'}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-8 md:p-12" dir={selectedLang.toLowerCase().includes('arabic') || selectedLang.toLowerCase() === 'ar' ? 'rtl' : 'ltr'}>
                  <div className="max-w-none">
                    <h1 className="font-display font-bold text-5xl mb-6 tracking-tight">{currentDraft.title || "Untitled Entry"}</h1>
                    {currentDraft.subtitle && <p className="text-2xl font-display italic text-muted-foreground mb-8">{currentDraft.subtitle}</p>}
                    <div className="my-10 border-t border-border/50" />
                    <PostBody content={currentDraft.content || ""} isRTL={selectedLang.toLowerCase().includes('arabic') || selectedLang.toLowerCase() === 'ar'} />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`w-full lg:w-96 flex-col gap-6 shrink-0 ${previewMode ? 'hidden' : 'flex'}`}>
            <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
              <h3 className="font-medium text-foreground border-b border-border/50 pb-2 mb-4">Meta Data (Shared)</h3>
              
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">URL Slug</label>
                <input 
                  type="text"
                  value={commonData.slug || ""}
                  onChange={e => setCommonData(prev => ({ ...prev, slug: slugify(e.target.value || "", { lower: true, strict: true }) }))}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Cover Image</label>
                <ImageUpload 
                  value={commonData.coverImage} 
                  size={commonData.coverImageSize}
                  shape={commonData.coverImageShape}
                  onChange={(url) => setCommonData(prev => ({ ...prev, coverImage: url }))}
                  onSizeChange={(size) => setCommonData(prev => ({ ...prev, coverImageSize: size }))}
                  onShapeChange={(shape) => setCommonData(prev => ({ ...prev, coverImageShape: shape }))}
                  onUploading={setUploading}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Tags</label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <Badge 
                        key={`${tag}-${idx}`}
                        variant="secondary"
                        className="pl-2 pr-1 py-1 flex items-center gap-1 bg-secondary hover:bg-secondary/80 text-foreground border-none"
                      >
                        {tag}
                        <button
                          onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                          className="hover:bg-foreground/10 rounded-full p-0.5 transition-colors"
                          type="button"
                        >
                          <Plus className="w-3 h-3 rotate-45" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input 
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const newTag = tagInput.trim().toLowerCase();
                        if (newTag && !tags.includes(newTag)) {
                          setTags([...tags, newTag]);
                        }
                        setTagInput("");
                      }
                    }}
                    placeholder="Type tag and press Enter..."
                    className="w-full text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Reading Time ({selectedLang})</label>
                <input 
                  type="text"
                  value={currentDraft.readingTime || ""}
                  onChange={e => updateCurrentDraft({ readingTime: e.target.value })}
                  placeholder="5 min read"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudioLayout>
  );
}
