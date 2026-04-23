"use client";

import { CustomerAssetType } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CustomerAssetUploadForm({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmitting(true);
    const response = await fetch("/api/customer-assets/upload", { method: "POST", body: formData });
    setSubmitting(false);

    if (!response.ok) {
      const data = await response.json();
      alert(data.error ?? "Could not upload image");
      return;
    }

    form.reset();
    setSelectedFile(null);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2 rounded-lg border border-[var(--line)] bg-[var(--surface-elevated)] p-3">
      <input type="hidden" name="customerId" value={customerId} />
      <div className="space-y-1">
        <Label htmlFor="assetType">Image type</Label>
        <select
          id="assetType"
          name="assetType"
          className="h-10 w-full rounded-md border border-[var(--line)] bg-[var(--surface-muted)] px-3 text-sm text-[var(--foreground)]"
          defaultValue={CustomerAssetType.ID_PHOTO}
        >
          <option value={CustomerAssetType.ID_PHOTO}>ID photo</option>
          <option value={CustomerAssetType.FACE_PHOTO}>Face photo</option>
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="file">File</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => document.getElementById("file")?.click()}
          >
            {selectedFile ? "Change file" : "Choose file"}
          </Button>
          <span className="text-sm text-[var(--text-muted)]">
            {selectedFile ? selectedFile.name : "No file selected"}
          </span>
          <input
            id="file"
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </div>
      </div>
      <Button type="submit" size="sm" disabled={submitting}>
        {submitting ? "Uploading..." : "Upload image"}
      </Button>
    </form>
  );
}
