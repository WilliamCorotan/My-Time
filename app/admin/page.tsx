"use client";
import { useUser, useOrganization } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

type DTR = {
  userId: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
  message?: string;
};

export default function AdminPage() {
  const { user } = useUser();
  const { organization, membership } = useOrganization();
  const isAdmin = membership?.role === 'admin';
  const orgId = organization?.id;
  const [records, setRecords] = useState<DTR[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<Record<string, unknown>[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  function fetchMembers() {
    setMembersLoading(true);
    setMembersError(null);
    fetch('/admin/api?members=1', { credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then(setMembers)
      .catch((err) => setMembersError(err instanceof Error ? err.message : String(err)))
      .finally(() => setMembersLoading(false));
  }

  useEffect(() => {
    if (!isAdmin || !orgId) return;
    setLoading(true);
    setError(null);
    fetch("/admin/api", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => setRecords(data))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [isAdmin, orgId]);

  useEffect(() => {
    if (isAdmin && orgId) fetchMembers();
  }, [isAdmin, orgId]);

  async function removeMember(userId: string) {
    if (!window.confirm('Remove this member from the organization?')) return;
    await fetch('/admin/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'remove', targetUserId: userId }),
    });
    fetchMembers();
  }

  async function changeRole(userId: string, role: string) {
    await fetch('/admin/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'role', targetUserId: userId, role }),
    });
    fetchMembers();
  }

  if (!user) return <div>Loading...</div>;
  if (!isAdmin) return <div className="text-red-600">Access denied. Admins only.</div>;

  function exportCSV() {
    if (!records.length) return;
    const headers = ["User Name", "User ID", "Date", "Time In", "Time Out", "Message"];
    const rows = records.map((r: Record<string, unknown>) => [
      typeof r.userName === 'string' ? r.userName : (typeof r.userId === 'string' ? r.userId : ''),
      typeof r.userId === 'string' ? r.userId : '',
      typeof r.date === 'string' ? r.date : '',
      typeof r.timeIn === 'string' ? r.timeIn : '',
      typeof r.timeOut === 'string' ? r.timeOut : '',
      typeof r.message === 'string' ? r.message : ''
    ]);
    const csv = [headers, ...rows].map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dtr-org-${orgId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="mb-2">Organization: {organization?.name}</div>
      <div className="mb-2">Admin: {user.fullName}</div>
      <Button onClick={exportCSV} className="mb-4">Export CSV</Button>
      <h2 className="text-xl font-semibold mt-8 mb-2">Organization Members</h2>
      {membersError && <div className="text-red-600 mb-2">{membersError}</div>}
      {membersLoading ? (
        <div>Loading members...</div>
      ) : (
        <table className="w-full border text-sm mb-6">
          <thead>
            <tr>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Role</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr><td colSpan={4} className="text-center">No members</td></tr>
            ) : (
              members.map((m) => (
                <tr key={String(m.userId)}>
                  <td className="border px-2 py-1">{typeof m.name === 'string' ? m.name : ''}</td>
                  <td className="border px-2 py-1">{typeof m.email === 'string' ? m.email : ''}</td>
                  <td className="border px-2 py-1">{typeof m.role === 'string' ? m.role : ''}</td>
                  <td className="border px-2 py-1 space-x-2">
                    <Button onClick={() => removeMember(String(m.userId))} variant="destructive" size="sm">Remove</Button>
                    <select value={typeof m.role === 'string' ? m.role : ''} onChange={e => changeRole(String(m.userId), e.target.value)} className="px-2 py-1 border rounded">
                      <option value="admin">admin</option>
                      <option value="basic_member">basic_member</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
      <div className="mb-4">All DTR records for the past 7 days:</div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1">User ID</th>
              <th className="border px-2 py-1">Date</th>
              <th className="border px-2 py-1">Time In</th>
              <th className="border px-2 py-1">Time Out</th>
              <th className="border px-2 py-1">Message</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={5} className="text-center">No records</td></tr>
            ) : (
              records.map((rec, i) => (
                <tr key={rec.userId + rec.date + i}>
                  <td className="border px-2 py-1">{rec.userId}</td>
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