"use client";

import { useState } from "react";
import { ui } from "@/lib/ui-text";

const inputClassName =
  "w-full resize-y rounded-xl border border-gray-200 p-3 text-base leading-relaxed text-gray-800 focus:border-blossom-300 focus:outline-none focus:ring-2 focus:ring-blossom-100 sm:text-sm";

type FinalizePreviewEditCardProps = {
  title: string;
  display: string;
  emptyLabel: string;
  canEdit: boolean;
  mono?: boolean;
  onSave: (next: string) => boolean;
};

export function FinalizePreviewEditCard({
  title,
  display,
  emptyLabel,
  canEdit,
  mono = false,
  onSave,
}: FinalizePreviewEditCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(display);

  function startEdit() {
    setDraft(display);
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(display);
    setEditing(false);
  }

  function saveEdit() {
    if (!onSave(draft)) {
      setDraft(display);
      setEditing(false);
      return;
    }
    setEditing(false);
  }

  return (
    <section className="rounded-2xl border border-blossom-100 bg-white/80 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold text-gray-900">■ {title}</h3>
        {canEdit && !editing && (
          <button
            type="button"
            onClick={startEdit}
            className="shrink-0 text-xs font-medium text-blossom-600 hover:text-blossom-700"
          >
            {ui.finalize.edit}
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-3 space-y-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className={`${inputClassName} min-h-24 ${mono ? "font-mono" : ""}`}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              {ui.finalize.cancelEdit}
            </button>
            <button
              type="button"
              onClick={saveEdit}
              className="rounded-xl bg-blossom-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blossom-600"
            >
              {ui.finalize.saveEdit}
            </button>
          </div>
        </div>
      ) : display ? (
        <p
          className={`mt-3 whitespace-pre-wrap text-sm leading-relaxed ${
            mono ? "font-mono text-gray-800" : "text-gray-700"
          }`}
        >
          {display}
        </p>
      ) : (
        <p className="mt-3 text-sm text-gray-500">{emptyLabel}</p>
      )}
    </section>
  );
}
