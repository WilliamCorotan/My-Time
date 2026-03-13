"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FileEdit, Check, X, Clock } from "lucide-react";
import { formatTime, formatDate } from "@/lib/time-format";
import { toast } from "sonner";
import type { TimeChangeRequestWithEntry } from "@/lib/time-change-request-types";

type UserMap = Record<string, string>;

type AdminTimeChangeRequestsProps = {
  userMap: UserMap;
};

const statusConfig = {
  pending: { label: "Pending", variant: "outline" as const },
  approved: { label: "Approved", variant: "default" as const },
  rejected: { label: "Rejected", variant: "destructive" as const },
};

export function AdminTimeChangeRequests({ userMap }: AdminTimeChangeRequestsProps) {
  const [requests, setRequests] = useState<TimeChangeRequestWithEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/time-change-requests", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleReview = async (requestId: number, action: "approved" | "rejected") => {
    setProcessing(true);
    try {
      const res = await fetch(`/api/admin/time-change-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action, reviewNote: reviewNote.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to process request");
      }

      toast.success(`Request ${action}`);
      setReviewingId(null);
      setReviewNote("");
      await fetchRequests();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to process");
    } finally {
      setProcessing(false);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const processedRequests = requests.filter((r) => r.status !== "pending");

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Time Change Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="mt-2 text-muted-foreground">Loading requests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Pending Requests
            {pendingRequests.length > 0 && (
              <Badge variant="destructive">{pendingRequests.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileEdit className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p>No pending change requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req) => (
                <RequestCard
                  key={req.id}
                  request={req}
                  userName={userMap[req.userId] || req.userId}
                  isReviewing={reviewingId === req.id}
                  reviewNote={reviewingId === req.id ? reviewNote : ""}
                  processing={processing}
                  onStartReview={() => { setReviewingId(req.id); setReviewNote(""); }}
                  onCancelReview={() => { setReviewingId(null); setReviewNote(""); }}
                  onReviewNoteChange={setReviewNote}
                  onApprove={() => handleReview(req.id, "approved")}
                  onReject={() => handleReview(req.id, "rejected")}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processed Requests (history) */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Request History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {processedRequests.slice(0, 20).map((req) => {
                const config = statusConfig[req.status as keyof typeof statusConfig];
                return (
                  <div key={req.id} className="p-3 bg-muted/50 rounded-lg border border-border space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{userMap[req.userId] || req.userId}</span>
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(req.originalDate, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Reason: {req.reason}
                    </div>
                    {req.reviewedAt && (
                      <div className="text-xs text-muted-foreground">
                        Reviewed {formatDate(req.reviewedAt, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        {req.reviewNote && ` — ${req.reviewNote}`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RequestCard({
  request: req,
  userName,
  isReviewing,
  reviewNote,
  processing,
  onStartReview,
  onCancelReview,
  onReviewNoteChange,
  onApprove,
  onReject,
}: {
  request: TimeChangeRequestWithEntry;
  userName: string;
  isReviewing: boolean;
  reviewNote: string;
  processing: boolean;
  onStartReview: () => void;
  onCancelReview: () => void;
  onReviewNoteChange: (v: string) => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium text-foreground">{userName}</span>
          <span className="text-sm text-muted-foreground ml-2">
            {formatDate(req.originalDate, { weekday: "short", month: "short", day: "numeric" })}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Filed {formatDate(req.createdAt, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
        </span>
      </div>

      {/* Changes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <div>
          <div className="text-xs text-muted-foreground font-medium mb-1">Time In</div>
          <div className="flex items-center gap-2">
            <span className={req.requestedTimeIn ? "line-through text-muted-foreground" : "text-foreground"}>
              {formatTime(req.originalTimeIn)}
            </span>
            {req.requestedTimeIn && (
              <span className="text-primary font-medium">→ {formatTime(req.requestedTimeIn)}</span>
            )}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground font-medium mb-1">Time Out</div>
          <div className="flex items-center gap-2">
            <span className={req.requestedTimeOut ? "line-through text-muted-foreground" : "text-foreground"}>
              {req.originalTimeOut ? formatTime(req.originalTimeOut) : "—"}
            </span>
            {req.requestedTimeOut && (
              <span className="text-primary font-medium">→ {formatTime(req.requestedTimeOut)}</span>
            )}
          </div>
        </div>
      </div>

      {req.requestedNote && (
        <div className="text-sm">
          <span className="text-xs text-muted-foreground font-medium">Note change: </span>
          <span className="text-foreground">{req.requestedNote}</span>
        </div>
      )}

      <div className="text-sm bg-background/50 p-2 rounded border-l-2 border-primary/30">
        <span className="text-xs text-muted-foreground font-medium">Reason: </span>
        {req.reason}
      </div>

      {/* Review actions */}
      {!isReviewing ? (
        <div className="flex gap-2">
          <Button size="sm" onClick={onStartReview}>
            Review
          </Button>
        </div>
      ) : (
        <div className="space-y-2 pt-2 border-t border-border">
          <Textarea
            value={reviewNote}
            onChange={(e) => onReviewNoteChange(e.target.value)}
            placeholder="Optional admin note..."
            className="text-sm min-h-[50px]"
            maxLength={500}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={onApprove} disabled={processing}>
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={onReject} disabled={processing}>
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelReview} disabled={processing}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
