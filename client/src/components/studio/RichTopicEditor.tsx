import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Image as ImageIcon,
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { normalizeEditorHtml, sanitizePostHtml } from "@/lib/post-content";
import { cn } from "@/lib/utils";

interface RichTopicEditorProps {
  value: string;
  onChange: (value: string) => void;
  dir?: "ltr" | "rtl";
}

type AlignMode = "left" | "center" | "right";

function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 1400;
        const MAX_HEIGHT = 1400;

        if (width > height && width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        } else if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
          "image/jpeg",
          0.72
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

async function uploadImage(file: File): Promise<string> {
  const compressedBlob = await compressImage(file);
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.readAsDataURL(compressedBlob);
    reader.onloadend = async () => {
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileData: reader.result,
          }),
        });

        if (!response.ok) throw new Error("Upload failed");
        const data = await response.json();
        resolve(data.url);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
  });
}

function applyFigureAlignment(figure: HTMLElement, align: AlignMode) {
  figure.dataset.align = align;
  figure.classList.remove("topic-image--left", "topic-image--center", "topic-image--right");
  figure.classList.add(`topic-image--${align}`);
}

function getFigureWidth(figure: HTMLElement): number {
  const width = figure.style.width || "70%";
  const numeric = Number.parseInt(width, 10);
  return Number.isFinite(numeric) ? numeric : 70;
}

export function RichTopicEditor({ value, onChange, dir = "ltr" }: RichTopicEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<HTMLElement | null>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const placeholder = useMemo(
    () => (dir === "rtl" ? "اكتب موضوعك هنا..." : "Write your topic here..."),
    [dir]
  );

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const normalized = normalizeEditorHtml(value);
    if (editor.innerHTML !== normalized) {
      editor.innerHTML = normalized;
    }
    setIsEmpty(editor.innerText.trim().length === 0);
  }, [value]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      savedRangeRef.current = range;

      const node = selection.anchorNode as HTMLElement | null;
      const element = node?.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement | null);
      const figure = element?.closest?.("figure.topic-image") as HTMLElement | null;
      setSelectedImage(figure || null);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const emitChange = () => {
    if (!editorRef.current) return;
    setIsEmpty(editorRef.current.innerText.trim().length === 0);
    onChange(sanitizePostHtml(editorRef.current.innerHTML));
  };

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const runCommand = (command: string, value?: string) => {
    focusEditor();
    document.execCommand(command, false, value);
    emitChange();
  };

  const handleLink = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    const url = window.prompt("Paste the link URL");
    if (!url) return;
    runCommand("createLink", url);
  };

  const restoreRange = () => {
    const selection = window.getSelection();
    if (!selection || !savedRangeRef.current) return;
    selection.removeAllRanges();
    selection.addRange(savedRangeRef.current);
  };

  const insertImage = async (file: File) => {
    try {
      setIsUploading(true);
      const url = await uploadImage(file);
      focusEditor();
      restoreRange();

      const selection = window.getSelection();
      const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      if (!range || !editorRef.current) return;

      const figure = document.createElement("figure");
      figure.className = "topic-image topic-image--center";
      figure.dataset.align = "center";
      figure.style.width = "70%";
      figure.contentEditable = "false";

      const img = document.createElement("img");
      img.src = url;
      img.alt = "Inserted image";
      img.className = "topic-image__img";
      figure.appendChild(img);

      range.deleteContents();
      range.insertNode(figure);

      const paragraph = document.createElement("p");
      paragraph.innerHTML = "<br>";
      figure.after(paragraph);

      const nextRange = document.createRange();
      nextRange.setStart(paragraph, 0);
      nextRange.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(nextRange);
      setSelectedImage(figure);
      emitChange();
    } catch (error) {
      console.error("Inline image upload failed", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleEditorClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const figure = target.closest("figure.topic-image") as HTMLElement | null;
    setSelectedImage(figure || null);
  };

  const setImageAlign = (align: AlignMode) => {
    if (!selectedImage) return;
    applyFigureAlignment(selectedImage, align);
    emitChange();
  };

  const setImageWidth = (width: number) => {
    if (!selectedImage) return;
    selectedImage.style.width = `${width}%`;
    emitChange();
  };

  const removeImage = () => {
    if (!selectedImage) return;
    const paragraph = document.createElement("p");
    paragraph.innerHTML = "<br>";
    selectedImage.replaceWith(paragraph);
    setSelectedImage(null);
    emitChange();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-background/70 p-3">
        <Button type="button" variant="outline" size="sm" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("bold")}>
          <Bold className="mr-2 h-4 w-4" /> Bold
        </Button>
        <Button type="button" variant="outline" size="sm" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand("italic")}>
          <Italic className="mr-2 h-4 w-4" /> Italic
        </Button>
        <Button type="button" variant="outline" size="sm" onMouseDown={(event) => event.preventDefault()} onClick={handleLink}>
          <LinkIcon className="mr-2 h-4 w-4" /> Link
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
          Image
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void insertImage(file);
          }}
        />
      </div>

      {selectedImage && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">Selected image</span>
            <Button type="button" variant="outline" size="sm" onClick={() => setImageAlign("left")}>
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setImageAlign("center")}>
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setImageAlign("right")}>
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min={25}
              max={100}
              step={5}
              value={getFigureWidth(selectedImage)}
              onChange={(event) => setImageWidth(Number(event.target.value))}
              className="w-36"
            />
            <span className="min-w-12 text-sm text-muted-foreground">{getFigureWidth(selectedImage)}%</span>
            <Button type="button" variant="outline" size="sm" onClick={removeImage}>
              <Trash2 className="mr-2 h-4 w-4" /> Remove
            </Button>
          </div>
        </div>
      )}

      <div
        ref={editorRef}
        dir={dir}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        onClick={handleEditorClick}
        className={cn(
          "topic-editor min-h-[420px] rounded-[28px] border border-border bg-background/40 px-6 py-6 text-lg leading-8 outline-none transition-colors md:px-8 md:py-8",
          dir === "rtl" && "text-right"
        )}
        data-placeholder={placeholder}
        data-empty={isEmpty ? "true" : "false"}
      />
    </div>
  );
}
