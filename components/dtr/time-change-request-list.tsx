"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileEdit, Clock } from "lucide-react";
import { formatTime, formatDate } from "@/lib/time-format";
import { useOrganizationContext } from "@/lib/contexts/organization-context";
import type { TimeChangeRequestWithEntry } from "@/lib/time-change-request-types";

const statusConfig = {
  pending: { label: "Pending", variant: "outline" as const },
  approved: { label: "Approved", variant: "default" as const },
  rejected: { label: "Rejected", variant: "destructive" as const },
};

export function TimeChangeRequestList({ refreshKey }: { refreshKey: number }) {
  const { currentOrganization } = useOrganizationContext();
  const [requests, setRequests] = useState<TimeChangeRequestWithEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentOrganization) return;
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/time-change-requests", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setRequests(data.requests);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [currentOrganization, refreshKey]);

  if (loading || requests.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileEdit className="h-5 w-5" />
          Your Change Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requests.map((req) => {
            const config = statusConfig[req.status as keyof typeof statusConfig];
            return (
              <div key={req.id} className="p-3 bg-muted/50 rounded-lg border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {formatDate(req.originalDate, { month: "short", day: "numeric" })}
                    </span>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Filed {formatDate(req.createdAt, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {req.requestedTimeIn && (
                    <div>
                      <span className="text-muted-foreground">Time In: </span>
                      <span className="line-through text-muted-foreground">{formatTime(req.originalTimeIn)}</span>
                      <span className="text-foreground"> → {formatTime(req.requestedTimeIn)}</span>
                    </div>
                  )}
                  {req.requestedTimeOut && (
                    <div>
                      <span className="text-muted-foreground">Time Out: </span>
                      <span className="line-through text-muted-foreground">
                        {req.originalTimeOut ? formatTime(req.originalTimeOut) : "—"}
                      </span>
                      <span className="text-foreground"> → {formatTime(req.requestedTimeOut)}</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  Reason: {req.reason}
                </div>

                {req.reviewNote && (
                  <div className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2">
                    Admin: {req.reviewNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
