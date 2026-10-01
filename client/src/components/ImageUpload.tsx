import { useState, useRef } from "react";
import { Upload, Loader2, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value: string;
  size: string;
  shape: string;
  onChange: (url: string) => void;
  onSizeChange: (size: string) => void;
  onShapeChange: (shape: string) => void;
  onUploading?: (uploading: boolean) => void;
}

export function ImageUpload({ 
  value, 
  size, 
  shape, 
  onChange, 
  onSizeChange, 
  onShapeChange, 
  onUploading 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizes = [
    { label: "Video (16:9)", value: "aspect-video" },
    { label: "Square (1:1)", value: "aspect-square" },
    { label: "Classic (4:3)", value: "aspect-[4/3]" },
    { label: "Wide (21:9)", value: "aspect-[21/9]" },
    { label: "Auto", value: "aspect-auto" },
  ];

  const shapes = [
    { label: "Rounded", value: "rounded-2xl" },
    { label: "Square", value: "rounded-none" },
    { label: "Circle", value: "rounded-full" },
    { label: "Soft", value: "rounded-md" },
  ];

  const compressImage = async (file: File): Promise<Blob> => {
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

          // Max dimensions for compression
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Compression failed"));
            },
            "image/jpeg",
            0.5 // Further reduced quality for significant size reduction as requested
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      onUploading?.(true);

      const compressedBlob = await compressImage(file);
      
      // Convert to Base64 for upload
      const reader = new FileReader();
      reader.readAsDataURL(compressedBlob);
      reader.onloadend = async () => {
        const base64data = reader.result;
        
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64data
          }),
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        onChange(data.url);
        setIsUploading(false);
        onUploading?.(false);
      };
    } catch (error) {
      console.error("Upload error:", error);
      setIsUploading(false);
      onUploading?.(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        
        {value ? (
          <div className={`relative group w-full border border-border bg-muted overflow-hidden transition-all duration-300 ${size} ${shape}`}>
            <img 
              src={value} 
              alt="Cover" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Change
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onChange("")}
                disabled={isUploading}
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full aspect-video rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 text-muted-foreground group"
          >
            <div className="p-4 rounded-full bg-secondary group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              {isUploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <ImageIcon className="w-8 h-8" />}
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Click to upload cover image</p>
              <p className="text-sm">High quality photos work best</p>
            </div>
          </button>
        )}
      </div>

      {value && (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Aspect Ratio</label>
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((s) => (
                <button
                  key={s.value}
                  onClick={() => onSizeChange(s.value)}
                  className={`px-2 py-1 text-xs rounded-md border transition-all ${
                    size === s.value 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-background text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Display Shape</label>
            <div className="flex flex-wrap gap-1.5">
              {shapes.map((s) => (
                <button
                  key={s.value}
                  onClick={() => onShapeChange(s.value)}
                  className={`px-2 py-1 text-xs rounded-md border transition-all ${
                    shape === s.value 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-background text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
