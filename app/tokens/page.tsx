"use client";
import { useState, useEffect } from "react";
import { useOrganizationContext } from "@/lib/contexts/organization-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { KeyRound, Plus, Trash2, Copy, Check, AlertTriangle } from "lucide-react";
import { OrganizationSwitcher } from "@/components/ui/organization-switcher";
import { formatDate } from "@/lib/time-format";

type TokenEntry = {
  id: number;
  name: string;
  tokenPreview: string;
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
};

export default function TokensPage() {
  const { currentOrganization: organization, loading: orgLoading } = useOrganizationContext();
  const orgId = organization?.id;
  const [tokens, setTokens] = useState<TokenEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("90");
  const [creating, setCreating] = useState(false);

  // Newly created token (show once)
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchTokens = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tokens", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTokens(data.tokens);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orgId) return;
    fetchTokens();
  }, [orgId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newName.trim(),
          expiresInDays: expiresInDays ? parseInt(expiresInDays) : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create token");
      }
      const data = await res.json();
      setNewToken(data.token);
      setNewName("");
      setExpiresInDays("90");
      setShowCreate(false);
      await fetchTokens();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (tokenId: number, tokenName: string) => {
    if (!confirm(`Revoke token "${tokenName}"? This cannot be undone.`)) return;
    setError(null);
    try {
      const res = await fetch(`/api/tokens?id=${tokenId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to revoke token");
      }
      await fetchTokens();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (orgLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-9 w-36 rounded-md" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">API Tokens</h1>
          <p className="text-muted-foreground">
            Manage API tokens for CLI access and integrations.
          </p>
        </div>
        <OrganizationSwitcher variant="compact" />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Newly created token banner */}
      {newToken && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground mb-1">
                  Token created successfully
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Copy this token now — you won&apos;t be able to see it again.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                    {newToken}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(newToken)}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Use with CLI:</p>
                  <code className="text-xs bg-muted p-1.5 rounded block font-mono">
                    dtr login --token {newToken}
                  </code>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNewToken(null)}
                className="shrink-0"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create token form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Your Tokens
            </div>
            {!showCreate && (
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Generate Token
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showCreate && (
            <form onSubmit={handleCreate} className="mb-6 p-4 bg-muted/50 rounded-lg border border-border space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">
                  Token Name
                </label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. My Laptop CLI"
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">
                  Expires In (days)
                </label>
                <Input
                  type="number"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  placeholder="90"
                  min={1}
                  max={365}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty for no expiration. Max 365 days.
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={creating || !newName.trim()}>
                  {creating ? "Creating..." : "Create Token"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreate(false);
                    setNewName("");
                    setExpiresInDays("90");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <p className="mt-2 text-muted-foreground">Loading tokens...</p>
            </div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <KeyRound className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No API tokens yet.</p>
              <p className="text-sm mt-1">
                Generate a token to use with the DTR CLI.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {token.name}
                      </span>
                      {token.expiresAt && isExpired(token.expiresAt) && (
                        <Badge variant="destructive" className="text-xs">
                          Expired
                        </Badge>
                      )}
                      {token.expiresAt && !isExpired(token.expiresAt) && (
                        <Badge variant="outline" className="text-xs">
                          Expires {formatDate(token.expiresAt, { month: "short", day: "numeric", year: "numeric" })}
                        </Badge>
                      )}
                      {!token.expiresAt && (
                        <Badge variant="secondary" className="text-xs">
                          No expiration
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <code className="text-xs font-mono">{token.tokenPreview}</code>
                      <span className="mx-2">·</span>
                      Created {formatDate(token.createdAt, { month: "short", day: "numeric", year: "numeric" })}
                      {token.lastUsedAt && (
                        <>
                          <span className="mx-2">·</span>
                          Last used {formatDate(token.lastUsedAt, { month: "short", day: "numeric" })}
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevoke(token.id, token.name)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
