"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { TimeEntryWithDuration } from "@/lib/time-entries-types";

type TimeChangeRequestFormProps = {
  entry: TimeEntryWithDuration;
  onClose: () => void;
  onSubmitted: () => void;
};

function toDatetimeLocalValue(isoString: string): string {
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function TimeChangeRequestForm({ entry, onClose, onSubmitted }: TimeChangeRequestFormProps) {
  const [requestedTimeIn, setRequestedTimeIn] = useState(toDatetimeLocalValue(entry.timeIn));
  const [requestedTimeOut, setRequestedTimeOut] = useState(
    entry.timeOut ? toDatetimeLocalValue(entry.timeOut) : ""
  );
  const [requestedNote, setRequestedNote] = useState(entry.note || "");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    // Check if anything actually changed
    const timeInChanged = requestedTimeIn !== toDatetimeLocalValue(entry.timeIn);
    const timeOutChanged = entry.timeOut
      ? requestedTimeOut !== toDatetimeLocalValue(entry.timeOut)
      : requestedTimeOut !== "";
    const noteChanged = requestedNote !== (entry.note || "");

    if (!timeInChanged && !timeOutChanged && !noteChanged) {
      toast.error("No changes detected");
      return;
    }

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        timeEntryId: entry.id,
        reason: reason.trim(),
      };

      if (timeInChanged) body.requestedTimeIn = new Date(requestedTimeIn).toISOString();
      if (timeOutChanged && requestedTimeOut) body.requestedTimeOut = new Date(requestedTimeOut).toISOString();
      if (noteChanged) body.requestedNote = requestedNote.trim();

      const res = await fetch("/api/time-change-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit request");
      }

      toast.success("Change request submitted for admin approval");
      onSubmitted();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-muted/50 rounded-lg border border-border">
      <div className="text-sm font-medium text-foreground">Request Time Change</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Time In</Label>
          <Input
            type="datetime-local"
            value={requestedTimeIn}
            onChange={(e) => setRequestedTimeIn(e.target.value)}
            className="text-sm"
          />
        </div>
        <div>
          <Label className="text-xs">Time Out</Label>
          <Input
            type="datetime-local"
            value={requestedTimeOut}
            onChange={(e) => setRequestedTimeOut(e.target.value)}
            className="text-sm"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs">Note</Label>
        <Input
          value={requestedNote}
          onChange={(e) => setRequestedNote(e.target.value)}
          placeholder="Session note"
          className="text-sm"
        />
      </div>

      <div>
        <Label className="text-xs">Reason for change *</Label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why do you need this change?"
          className="text-sm min-h-[60px]"
          maxLength={500}
          required
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={submitting || !reason.trim()}>
          {submitting ? "Submitting..." : "Submit Request"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
