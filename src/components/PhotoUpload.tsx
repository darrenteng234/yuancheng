"use client";

import { useState, useRef } from "react";

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  folder: string;
  maxPhotos?: number;
}

export default function PhotoUpload({
  photos,
  onChange,
  folder,
  maxPhotos = 10,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (photos.length >= maxPhotos) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        onChange([...photos, data.url]);
      } else {
        alert("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        uploadFile(file);
      }
    });
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div>
      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: dragOver ? "2px dashed var(--amber-500)" : "2px dashed var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-6)",
          textAlign: "center",
          cursor: "pointer",
          background: dragOver ? "var(--amber-50)" : "var(--stone-50)",
          transition: "all 0.2s",
          marginBottom: "var(--space-3)",
        }}
      >
        <div style={{ fontSize: 32, marginBottom: "var(--space-2)" }}>
          {uploading ? "⏳" : "📷"}
        </div>
        <div style={{ fontWeight: 600, marginBottom: "var(--space-1)" }}>
          {uploading ? "Uploading..." : "Drop photos here or click to upload"}
        </div>
        <div className="text-xs text-muted">
          JPG, PNG, WebP · Max 5MB each · Up to {maxPhotos} photos
        </div>
        <div className="text-xs text-muted" style={{ marginTop: "var(--space-1)", color: "var(--amber-700)" }}>
          💡 Tip: Use white background for best results
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "var(--space-2)" }}>
          {photos.map((url, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                aspectRatio: "1",
                border: "1px solid var(--color-border)",
              }}
            >
              <img
                src={url}
                alt={`Photo ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.6)",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
