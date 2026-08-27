import { ui } from "@/lib/ui-text";

export function SaveErrorBanner() {
  return (
    <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
      {ui.storage.saveError}
    </p>
  );
}
