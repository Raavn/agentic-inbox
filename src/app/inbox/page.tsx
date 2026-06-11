"use client";

import { useState, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { AlignLeft, ChevronRight, Clock, FileText, Tag } from "lucide-react";
import { formatTimestamp } from "@/lib/format";

type InboxPreview = { id: string; title: string; createdAt: string };

async function fetchRecent(): Promise<InboxPreview[]> {
  const res = await fetch("/api/inbox");
  if (!res.ok) throw new Error("Failed to load");
  const data = (await res.json()) as { items: InboxPreview[] };
  return data.items;
}

async function createItem(payload: { title: string; body: string }): Promise<void> {
  const res = await fetch("/api/inbox", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = (await res.json()) as { error?: string };
    throw new Error(err.error ?? "Failed to save");
  }
}

export default function InboxPage() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saveError, setSaveError] = useState("");

  const { data: items, isLoading: listLoading } = useQuery({
    queryKey: ["inbox-recent"],
    queryFn: fetchRecent,
  });

  const mutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      setTitle("");
      setBody("");
      setSaveError("");
      qc.invalidateQueries({ queryKey: ["inbox-recent"] });
    },
    onError: (err: Error) => {
      setSaveError(err.message);
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    mutation.mutate({ title: title.trim(), body: body.trim() });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">Inbox</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          Sign out
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Tag className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 py-3 text-base shadow-[-5px_6px_22px_-6px_rgba(99,102,241,0.5),5px_6px_22px_-6px_rgba(124,58,237,0.45)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <AlignLeft className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-indigo-500" />
            <textarea
              placeholder="Body (markdown supported)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 py-3 text-sm shadow-[-5px_6px_22px_-6px_rgba(99,102,241,0.5),5px_6px_22px_-6px_rgba(124,58,237,0.45)] resize-y placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
          {saveError && <p className="text-red-500 text-sm">{saveError}</p>}
          <button
            type="submit"
            disabled={mutation.isPending || !title.trim()}
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-7 py-2.5 font-medium text-white shadow-md transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {mutation.isPending ? "Saving…" : "Save"}
          </button>
        </form>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <Clock className="h-4 w-4" />
            Recent
          </h2>
          {listLoading && <p className="text-sm text-slate-400">Loading…</p>}
          {!listLoading && (!items || items.length === 0) && (
            <p className="text-sm text-slate-400">No items yet.</p>
          )}
          <ul className="space-y-3">
            {items?.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/inbox/${item.id}`}
                  className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                    <FileText className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-slate-900">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      {formatTimestamp(item.createdAt)}
                    </span>
                  </span>
                  <ChevronRight className="h-5 w-5 flex-none text-slate-300" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
