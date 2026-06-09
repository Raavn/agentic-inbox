"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function AdminInvitePage() {
  const [accountType, setAccountType] = useState<"Founder" | "Company">(
    "Founder",
  );
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<{ inviteUrl: string; expiresAt: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ accountType, email: email || undefined }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Failed to create invite");
      return;
    }

    const data = (await res.json()) as { inviteUrl: string; expiresAt: string };
    setResult(data);
    setEmail("");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white px-4 py-3 flex items-center gap-3">
        <Link href="/inbox" className="text-sm text-gray-500 hover:text-gray-800">
          ← Inbox
        </Link>
        <h1 className="text-lg font-semibold">Generate invite</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Account type
            </label>
            <div className="flex gap-3">
              {(["Founder", "Company"] as const).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="accountType"
                    value={t}
                    checked={accountType === t}
                    onChange={() => setAccountType(t)}
                  />
                  <span className="text-sm">{t}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email (optional)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Recipient's email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {loading ? "Generating…" : "Generate invite link"}
          </button>
        </form>

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
            <p className="text-sm font-medium text-green-800">Invite link created</p>
            <p className="text-xs text-gray-500">
              Expires: {new Date(result.expiresAt).toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={result.inviteUrl}
                className="flex-1 text-xs bg-white border border-gray-200 rounded px-2 py-1 font-mono"
              />
              <button
                onClick={() => navigator.clipboard.writeText(result.inviteUrl)}
                className="text-xs text-blue-600 hover:underline whitespace-nowrap"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
