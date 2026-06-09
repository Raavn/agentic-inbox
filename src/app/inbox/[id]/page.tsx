"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

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
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  if (isError || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-gray-500">Item not found.</p>
          <Link href="/inbox" className="text-blue-600 hover:underline text-sm">
            Back to Inbox
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-800 transition-colors text-sm"
        >
          ← Back
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <p className="text-xs text-gray-400 mb-2">
          {new Date(item.createdAt).toLocaleString()}
        </p>
        <h1 className="text-2xl font-bold mb-4">{item.title}</h1>
        {item.body ? (
          <div className="prose prose-gray max-w-none">
            <ReactMarkdown>{item.body}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-gray-400 italic text-sm">No body.</p>
        )}
      </main>
    </div>
  );
}
