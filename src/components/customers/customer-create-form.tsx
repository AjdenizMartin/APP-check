"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CustomerAssetType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const createCustomerFormSchema = z.object({
  fullName: z.string().min(3),
  phone: z.string().min(6),
  address: z.string().min(5),
  notes: z.string().optional(),
  internalCode: z.string().optional(),
});

type FormValues = z.infer<typeof createCustomerFormSchema>;

function usePreview(file: File | null) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return preview;
}

function PreviewBox({ title, preview }: { title: string; preview: string | null }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-2">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{title}</p>
      {preview ? (
        <img src={preview} alt={title} className="h-28 w-full rounded-lg object-cover" />
      ) : (
        <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-[var(--line)] bg-[#142920] text-xs text-[var(--text-muted)]">
          No preview selected
        </div>
      )}
    </div>
  );
}

export function CustomerCreateForm() {
  const router = useRouter();
  const [idPhoto, setIdPhoto] = useState<File | null>(null);
  const [facePhoto, setFacePhoto] = useState<File | null>(null);
  const [uploadResetKey, setUploadResetKey] = useState(0);

  const idPreview = usePreview(idPhoto);
  const facePreview = usePreview(facePhoto);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(createCustomerFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      address: "",
      notes: "",
      internalCode: "",
    },
  });

  const uploadAsset = async (customerId: string, assetType: CustomerAssetType, file: File) => {
    const formData = new FormData();
    formData.set("customerId", customerId);
    formData.set("assetType", assetType);
    formData.set("file", file);

    const response = await fetch("/api/customer-assets/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error ?? `asset_upload_failed_${assetType}`);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!idPhoto || !facePhoto) {
      alert("Both ID photo and face photo are required for new customers.");
      return;
    }

    const response = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      const data = await response.json();
      alert(data.error ?? "Could not create customer");
      return;
    }

    const data = await response.json();
    const customerId = data?.data?.id as string | undefined;

    if (!customerId) {
      alert("Customer created response did not return an id.");
      return;
    }

    try {
      await uploadAsset(customerId, CustomerAssetType.ID_PHOTO, idPhoto);
      await uploadAsset(customerId, CustomerAssetType.FACE_PHOTO, facePhoto);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown_upload_error";
      alert(`Customer created, but photo upload failed: ${message}`);
      router.refresh();
      return;
    }

    reset();
    setIdPhoto(null);
    setFacePhoto(null);
    setUploadResetKey((value) => value + 1);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-elevated)] p-4 shadow-[0_20px_35px_-30px_rgba(0,0,0,0.85)]">
      <h3 className="font-semibold text-[var(--foreground)]">Quick Customer Creation</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName ? <p className="text-xs text-[#f0958c]">{errors.fullName.message}</p> : null}
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
          {errors.phone ? <p className="text-xs text-[#f0958c]">{errors.phone.message}</p> : null}
        </div>
        <div className="space-y-1">
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...register("address")} />
          {errors.address ? <p className="text-xs text-[#f0958c]">{errors.address.message}</p> : null}
        </div>
        <div className="space-y-1">
          <Label htmlFor="internalCode">Internal code (optional)</Label>
          <Input id="internalCode" {...register("internalCode")} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="idPhoto">ID photo</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => document.getElementById("idPhoto")?.click()}
            >
              {idPhoto ? "Change file" : "Choose file"}
            </Button>
            <span className="text-sm text-[var(--text-muted)]">
              {idPhoto ? idPhoto.name : "No file selected"}
            </span>
            <input
              key={`id-photo-${uploadResetKey}`}
              id="idPhoto"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={(event) => setIdPhoto(event.target.files?.[0] ?? null)}
              className="hidden"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="facePhoto">Face photo</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => document.getElementById("facePhoto")?.click()}
            >
              {facePhoto ? "Change file" : "Choose file"}
            </Button>
            <span className="text-sm text-[var(--text-muted)]">
              {facePhoto ? facePhoto.name : "No file selected"}
            </span>
            <input
              key={`face-photo-${uploadResetKey}`}
              id="facePhoto"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={(event) => setFacePhoto(event.target.files?.[0] ?? null)}
              className="hidden"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <PreviewBox title="ID Photo Preview" preview={idPreview} />
        <PreviewBox title="Face Photo Preview" preview={facePreview} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" {...register("notes")} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Create customer"}
      </Button>
    </form>
  );
}
