"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  credits: number;
}

interface Order {
  id: string;
  item: string;
  amount: number;
  status: string;
  created_at: string;
}

interface Comment {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  // IDOR lookup state
  const [lookupOrderId, setLookupOrderId] = useState("");
  const [lookupResult, setLookupResult] = useState<string>("");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");

  // Comments state
  const [newComment, setNewComment] = useState("");

  // File upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  // Import URL / SSRF state
  const [importUrl, setImportUrl] = useState("");
  const [importResult, setImportResult] = useState("");

  // AI Assistant state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchOrders();
    fetchComments();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch {
      // Swallows error
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch {
      // Swallows error
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch("/api/comments");
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch {
      // Swallows error
    }
  };

  const handleLookupOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupResult("Fetching...");
    try {
      const res = await fetch(`/api/orders/${lookupOrderId}`);
      const data = await res.json();
      setLookupResult(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      setLookupResult("Error: " + String(err));
    }
  };

  const handleRedeemCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponMsg("Redeeming...");
    try {
      const res = await fetch("/api/coupons/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setCouponMsg(`Success! Added ${data.credits_added} credits. Total: ${data.total_credits}`);
        fetchProfile();
      } else {
        setCouponMsg(`Failed: ${data.error || "Unknown error"}`);
      }
    } catch (err: unknown) {
      setCouponMsg("Redemption error: " + String(err));
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment) return;
    try {
      await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: newComment,
        }),
      });
      setNewComment("");
      fetchComments();
    } catch {
      // Swallows error
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploadStatus("Uploading...");
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setUploadStatus(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      setUploadStatus("Upload failed: " + String(err));
    }
  };

  const handleImportUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportResult("Importing data from URL...");
    try {
      const res = await fetch("/api/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: importUrl }),
      });
      const data = await res.json();
      setImportResult(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      setImportResult("Import failed: " + String(err));
    }
  };

  const handleAiAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt) return;
    setAiLoading(true);
    setAiResponse("Consulting FlowVault AI Agent...");
    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      setAiResponse(data.response || JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      setAiResponse("AI request failed: " + String(err));
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 w-full">
      {/* Top Banner & User Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl bg-zinc-900 border border-zinc-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name || "User"}</h1>
          <p className="text-xs text-zinc-400">
            Account: <span className="font-mono text-purple-400">{user?.email}</span> | Role:{" "}
            <span className="font-semibold text-amber-400 uppercase">{user?.role}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800">
            <span className="text-xs text-zinc-500">Wallet Balance</span>
            <div className="text-lg font-bold text-green-400">{user?.credits ?? 0} Credits</div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium rounded-lg text-zinc-300"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Module 1: Orders & IDOR / BOLA Inspector */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Your Orders</h2>
            <span className="text-xs text-zinc-400">Private to your account</span>
          </div>

          <div className="space-y-2">
            {orders.map((o) => (
              <div
                key={o.id}
                className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex justify-between items-center text-xs"
              >
                <div>
                  <div className="font-semibold text-zinc-200">{o.item}</div>
                  <div className="font-mono text-zinc-500">ID: {o.id}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-zinc-200">${o.amount.toFixed(2)}</div>
                  <div className="text-emerald-400 capitalize">{o.status}</div>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">No orders yet.</p>}
          </div>

          <form onSubmit={handleLookupOrder} className="pt-4 border-t border-zinc-800 space-y-2">
            <label htmlFor="order-lookup" className="block text-sm font-semibold text-zinc-200">Look up one of your orders by ID</label>
            <div className="flex gap-2">
              <input
                id="order-lookup"
                type="text"
                value={lookupOrderId}
                onChange={(e) => setLookupOrderId(e.target.value)}
                placeholder="e.g. ORD-201"
                className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-200 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold"
              >
                Inspect
              </button>
            </div>
          </form>

          {lookupResult && (
            <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-40">
              {lookupResult}
            </pre>
          )}
        </div>

        {/* Module 2: Pro Plan Upgrade & Coupon Race Condition */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Pro Plan Upgrade & Discount</h2>
            <span className="text-xs text-zinc-400">Single-use promo</span>
          </div>

          <p className="text-xs text-zinc-400">
            Redeem the one-time workshop promo coupon <code className="text-purple-400">PRO50</code> to gain 500
            credits. Maximum allowed uses: 1.
          </p>

          <form onSubmit={handleRedeemCoupon} className="space-y-3">
            <div className="flex gap-2">
              <label className="sr-only" htmlFor="coupon-code">Coupon code</label>
              <input
                id="coupon-code"
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Coupon Code (e.g. PRO50)"
                className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-200 font-mono uppercase"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold"
              >
                Apply Coupon
              </button>
            </div>
          </form>

          {couponMsg && (
            <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300">
              {couponMsg}
            </div>
          )}
        </div>

        {/* Module 3: Stored XSS Forum / Feedback */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Community Feedback & Comments</h2>
            <span className="text-xs text-zinc-400">Safe text rendering</span>
          </div>

          {/* Stored XSS Render Area */}
          <div className="space-y-3 max-h-56 overflow-y-auto">
            {comments.map((c) => (
              <div key={c.id} className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs space-y-1">
                <div className="font-semibold text-purple-400">{c.author_name}:</div>
                <div className="text-zinc-300 whitespace-pre-wrap break-words">{c.body}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="pt-2 border-t border-zinc-800 space-y-2">
            <label className="block text-xs text-zinc-300" htmlFor="comment-body">Comment</label>
            <textarea
              id="comment-body"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your feedback"
              rows={2}
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-200"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold"
            >
              Post Comment
            </button>
          </form>
        </div>

        {/* Module 4: AI Notes Assistant */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">AI Notes Assistant</h2>
            <span className="text-xs text-zinc-400">Personal notes only</span>
          </div>

          <p className="text-xs text-zinc-400">
            The local assistant can refer to notes in your account. It has no access to other workspaces or external tools.
          </p>

          <form onSubmit={handleAiAssistant} className="space-y-2">
            <label htmlFor="assistant-prompt" className="block text-sm text-zinc-200">What would you like help with?</label>
            <textarea
              id="assistant-prompt"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask about your notes"
              rows={3}
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-200 font-mono"
            />
            <div className="flex justify-between items-center">
              <button
                type="submit"
                disabled={aiLoading}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold"
              >
                {aiLoading ? "Consulting..." : "Send Prompt"}
              </button>
            </div>
          </form>

          {aiResponse && (
            <div className="p-3 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-200 whitespace-pre-wrap font-mono max-h-40 overflow-y-auto">
              {aiResponse}
            </div>
          )}
        </div>

        {/* Module 5: Unrestricted File Upload */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Document & File Upload</h2>
            <span className="text-xs text-zinc-400">PNG, JPEG or PDF · max 5 MB</span>
          </div>

          <p className="text-xs text-zinc-400">
            Upload a small PNG, JPEG or PDF file. Uploaded content is stored outside the public web root.
          </p>

          <form onSubmit={handleFileUpload} className="space-y-3">
            <label htmlFor="document-file" className="block text-sm text-zinc-200">Choose a file</label>
            <input
              id="document-file"
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-xs text-zinc-400 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold"
            >
              Upload Document
            </button>
          </form>

          {uploadStatus && (
            <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-32">
              {uploadStatus}
            </pre>
          )}
        </div>

        {/* Module 6: SSRF Import-from-URL */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Import Data from URL</h2>
            <span className="text-xs text-zinc-400">Approved hosts only</span>
          </div>

          <p className="text-xs text-zinc-400">
            Imports are limited to HTTPS hosts configured by the workshop operator. Redirects and private network destinations are blocked.
          </p>

          <form onSubmit={handleImportUrl} className="space-y-2">
            <label htmlFor="import-url" className="block text-sm text-zinc-200">HTTPS URL</label>
            <input
              id="import-url"
              type="url"
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="https://approved.example.com/data.json"
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-200 font-mono"
            />
            <div className="flex justify-between items-center">
              <button
                type="submit"
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold"
              >
                Fetch Remote URL
              </button>
            </div>
          </form>

          {importResult && (
            <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-40">
              {importResult}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
