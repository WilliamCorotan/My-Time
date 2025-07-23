"use client";
import { useUser, useOrganization } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

type DTR = {
  timeIn?: string;
  timeOut?: string;
  message?: string;
};

export default function DTRPage() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const orgId = organization?.id;
  const [dtr, setDtr] = useState<DTR | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch today's DTR record
  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    fetch("/dtr/api", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setDtr(data);
        setMessage(data?.message || "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, orgId]);

  const handleTimeIn = async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/dtr/api", { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setDtr(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  const handleTimeOut = async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const now = new Date().toISOString().slice(11, 19);
      const res = await fetch("/dtr/api", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ timeOut: now }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setDtr(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };
  const handleSaveMessage = async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/dtr/api", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setDtr(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;
  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Daily Time Record</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="mb-2">User: {user.fullName}</div>
      <div className="mb-2">Org: {orgId || "None"}</div>
      <div className="mb-2">Date: {new Date().toLocaleDateString()}</div>
      <div className="mb-2">Time In: {dtr?.timeIn || "-"}</div>
      <div className="mb-2">Time Out: {dtr?.timeOut || "-"}</div>
      <div className="mb-2">Message: {dtr?.message || "-"}</div>
      <div className="flex gap-2 mt-4">
        <Button onClick={handleTimeIn} disabled={loading || !!dtr?.timeIn}>Time In</Button>
        <Button onClick={handleTimeOut} disabled={loading || !dtr?.timeIn || !!dtr?.timeOut} variant="secondary">Time Out</Button>
      </div>
      <div className="mt-4">
        <textarea
          className="w-full border rounded p-2"
          rows={3}
          placeholder="Message (optional)"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <Button onClick={handleSaveMessage} disabled={loading} className="mt-2">Save Message</Button>
      </div>
    </div>
  );
} 