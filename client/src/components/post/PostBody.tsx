import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { isRichHtmlContent, sanitizePostHtml } from "@/lib/post-content";

interface PostBodyProps {
  content: string;
  isRTL?: boolean;
}

export function PostBody({ content, isRTL = false }: PostBodyProps) {
  if (isRichHtmlContent(content)) {
    return (
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className={cn("topic-content", isRTL && "text-right")}
        dangerouslySetInnerHTML={{ __html: sanitizePostHtml(content) }}
      />
    );
  }

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className={cn(
        "prose prose-lg dark:prose-invert prose-p:text-foreground/80 prose-headings:text-foreground max-w-none",
        isRTL && "prose-headings:text-right text-right"
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
