"use client";
import { useUser, useOrganization } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

type DTR = {
  date: string;
  timeIn?: string;
  timeOut?: string;
  message?: string;
};

export default function TrackerPage() {
  const { user } = useUser();
  const { organization } = useOrganization();
  const orgId = organization?.id;
  const [records, setRecords] = useState<DTR[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    fetch("/tracker/api", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => setRecords(data))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [user, orgId]);

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Time Tracker</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="mb-2">User: {user?.fullName}</div>
      <div className="mb-2">Org: {orgId || "None"}</div>
      <div className="mb-4">DTR records for the past 7 days:</div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Time In</th>
              <th className="border px-2 py-1">Time Out</th>
              <th className="border px-2 py-1">Message</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={4} className="text-center">No records</td></tr>
            ) : (
              records.map((rec) => (
                <tr key={rec.date}>
                  <td className="border px-2 py-1">{rec.date}</td>
                  <td className="border px-2 py-1">{rec.timeIn || "-"}</td>
                  <td className="border px-2 py-1">{rec.timeOut || "-"}</td>
                  <td className="border px-2 py-1">{rec.message || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
} 