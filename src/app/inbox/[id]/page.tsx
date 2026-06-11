"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatTimestamp } from "@/lib/format";

type InboxItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

async function fetchItem(id: string): Promise<InboxItem> {
  const res = await fetch(`/api/inbox/${id}`);
  if (!res.ok) throw new Error("Not found");
  const data = (await res.json()) as { item: InboxItem };
  return data.item;
}

export default function InboxItemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: item, isLoading, isError } = useQuery({
    queryKey: ["inbox-item", id],
    queryFn: () => fetchItem(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Loading…</p>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-slate-500">Item not found.</p>
          <Link href="/inbox" className="text-indigo-600 hover:underline text-sm">
            Back to Inbox
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <article className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-2 text-xs text-slate-400">
            {formatTimestamp(item.createdAt)}
          </p>
          <h1 className="mb-4 text-2xl font-bold tracking-tight">{item.title}</h1>
          {item.body ? (
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown>{item.body}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm italic text-slate-400">No body.</p>
          )}
        </article>
      </main>
    </div>
  );
}
