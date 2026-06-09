"use client";

import { useState, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { signOut } from "next-auth/react";

type InboxPreview = { id: string; title: string; createdAt: string };

async function fetchRecent(): Promise<InboxPreview[]> {
  const res = await fetch("/api/inbox");
  if (!res.ok) throw new Error("Failed to load");
  const data = (await res.json()) as { items: InboxPreview[] };
  return data.items;
}

async function createItem(payload: {
  title: string;
  body: string;
}): Promise<void> {
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
      <header className="border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Inbox</h1>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          Sign out
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <textarea
              placeholder="Body (markdown supported)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {saveError && <p className="text-red-500 text-sm">{saveError}</p>}
          <button
            type="submit"
            disabled={mutation.isPending || !title.trim()}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {mutation.isPending ? "Saving…" : "Save"}
          </button>
        </form>

        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Recent
          </h2>
          {listLoading && (
            <p className="text-sm text-gray-400">Loading…</p>
          )}
          {!listLoading && (!items || items.length === 0) && (
            <p className="text-sm text-gray-400">No items yet.</p>
          )}
          <ul className="space-y-2">
            {items?.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/inbox/${item.id}`}
                  className="block bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-blue-400 hover:shadow-sm transition-all"
                >
                  <p className="font-medium truncate">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
