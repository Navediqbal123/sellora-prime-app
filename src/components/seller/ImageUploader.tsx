import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || disabled) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast({
        title: "Maximum images reached",
        description: `You can only upload up to ${maxImages} images`,
        variant: "destructive",
      });
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    const validFiles = filesToUpload.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 5MB limit`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of validFiles) {
      const url = await uploadFile(file);
      if (url) {
        uploadedUrls.push(url);
      }
    }

    if (uploadedUrls.length > 0) {
      onImagesChange([...images, ...uploadedUrls]);
      toast({
        title: "Upload successful",
        description: `${uploadedUrls.length} image(s) uploaded`,
      });
    }

    setUploading(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [images, maxImages, disabled]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer group",
          isDragging 
            ? "border-primary bg-primary/10 scale-[1.02]" 
            : "border-border/50 hover:border-primary/50 hover:bg-white/5",
          disabled && "opacity-50 cursor-not-allowed",
          uploading && "pointer-events-none"
        )}
      >
        {/* Glow effect on hover */}
        <div className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300",
          "bg-gradient-to-br from-primary/5 via-transparent to-accent/5",
          !disabled && "group-hover:opacity-100"
        )} />

        <div className="relative z-10 flex flex-col items-center justify-center py-10 px-4">
          {uploading ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <p className="text-foreground font-medium">Uploading...</p>
            </>
          ) : (
            <>
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300",
                "bg-gradient-to-br from-primary/20 to-accent/20",
                "group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]"
              )}>
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <p className="text-foreground font-medium mb-1">
                {isDragging ? "Drop images here" : "Drag & drop images here"}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse • Max {maxImages} images • 5MB each
              </p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-xl overflow-hidden border border-border/50 bg-secondary/30 animate-scale-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <img
                src={url}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                disabled={disabled}
                className={cn(
                  "absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center",
                  "bg-destructive/90 text-destructive-foreground",
                  "opacity-0 group-hover:opacity-100 transition-all duration-300",
                  "hover:bg-destructive hover:scale-110",
                  disabled && "hidden"
                )}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Index badge */}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-xs text-white font-medium">
                {index + 1}
              </div>
            </div>
          ))}
          
          {/* Add more placeholder */}
          {images.length < maxImages && !uploading && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className={cn(
                "aspect-square rounded-xl border-2 border-dashed border-border/50",
                "flex flex-col items-center justify-center gap-2",
                "text-muted-foreground transition-all duration-300",
                "hover:border-primary/50 hover:bg-white/5 hover:text-primary",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <ImageIcon className="w-6 h-6" />
              <span className="text-xs">Add more</span>
            </button>
          )}
        </div>
      )}

      {/* Image count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {images.length} of {maxImages} images
        </span>
        <div className="flex gap-1">
          {Array.from({ length: maxImages }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full transition-colors duration-300",
                i < images.length ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
