"use client";

import { useRouter } from "next/navigation";
import { CustomerEditForm } from "@/components/customers/customer-edit-form";
import { CustomerAssetUploadForm } from "@/components/customers/customer-asset-upload-form";
import { FloatingCard } from "@/components/shared/floating-card";
import { formatDateTime } from "@/lib/format";

interface CustomerProfileFloatingProps {
  customerId: string;
  fullName: string;
  phone: string;
  address: string;
  notes: string | null;
  internalCode: string | null;
  assets: Array<{ id: string; assetType: string }>;
  visits: Array<{ id: string; status: string; checkInAt: string | Date | null; checkOutAt: string | Date | null }>;
}

export function CustomerProfileFloating({
  customerId,
  fullName,
  phone,
  address,
  notes,
  internalCode,
  assets,
  visits,
}: CustomerProfileFloatingProps) {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  const handleViewImage = (id: string) => {
    window.open(`/api/customer-assets/${id}/view`, "_blank");
  };

  return (
    <FloatingCard open={true} onClose={handleClose} title={`Customer: ${fullName}`}>
      <div className="space-y-3">
        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-3">
          <p className="text-lg font-semibold">{fullName}</p>
          <p className="text-sm text-[var(--text-muted)]">{phone}</p>
          <p className="text-sm text-[var(--text-muted)]">{address}</p>
        </div>

        <CustomerEditForm
          customer={{
            id: customerId,
            fullName,
            phone,
            address,
            notes,
            internalCode,
          }}
        />
        <CustomerAssetUploadForm customerId={customerId} />

        <div className="space-y-2">
          <h4 className="font-semibold text-[var(--foreground)]">Active Photos</h4>
          <div className="grid grid-cols-2 gap-2">
            {assets.map((asset) => (
              <div key={asset.id} className="rounded border border-[var(--line)] bg-[var(--surface-muted)] p-2">
                <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">{asset.assetType}</p>
                <img
                  src={`/api/customer-assets/${asset.id}/view`}
                  alt={asset.assetType}
                  className="h-24 w-full rounded object-cover cursor-pointer"
                  onClick={() => handleViewImage(asset.id)}
                />
              </div>
            ))}
            {assets.length === 0 ? (
              <p className="col-span-2 text-xs text-[var(--text-muted)]">No active photos uploaded yet.</p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-[var(--foreground)]">Recent Visits</h4>
          <ul className="space-y-2 text-sm">
            {visits.map((visit) => (
              <li key={visit.id} className="rounded border border-[var(--line)] bg-[var(--surface-muted)] p-2">
                <p className="font-medium">{visit.status}</p>
                <p>Check-in: {formatDateTime(visit.checkInAt)}</p>
                <p>Check-out: {formatDateTime(visit.checkOutAt)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </FloatingCard>
  );
}
