"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, CalendarPlus, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ExtendResult = {
    success: boolean;
    message: string;
}

export function LicenseExtender() {
  const [clientId, setClientId] = useState("");
  const [days, setDays] = useState("30");
  const [adminKey, setAdminKey] = useState("");
  const [result, setResult] = useState<ExtendResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleExtend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !days || !adminKey) {
        setResult({ success: false, message: "All fields are required." });
        return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/extend_license", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify({ clientId, days: parseInt(days, 10) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An unknown error occurred.");
      }
      
      const newDate = new Date(data.new_expiration_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      setResult({ success: true, message: `License extended successfully. New expiry: ${newDate}` });
      
    } catch (err: any) {
      setResult({ success: false, message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <CalendarPlus className="h-6 w-6 text-primary" />
                <CardTitle className="font-headline">Extend License</CardTitle>
            </div>
            <Badge variant="secondary"><Shield className="mr-1 h-3 w-3" />Admin</Badge>
        </div>
        <CardDescription>Extend the expiration date for a license.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleExtend} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId-extender">Client ID</Label>
            <Input
              id="clientId-extender"
              placeholder="Enter client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={isLoading}
              className="bg-card"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="days">Days to Extend</Label>
            <Input
              id="days"
              type="number"
              placeholder="e.g., 30"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              min="1"
              disabled={isLoading}
              className="bg-card"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminKey-extender">Admin Key</Label>
            <Input
              id="adminKey-extender"
              type="password"
              placeholder="Enter admin secret key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              disabled={isLoading}
              className="bg-card"
            />
          </div>
          <Button type="submit" variant="secondary" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Extend License
          </Button>
        </form>
        <div className="mt-4 min-h-[70px]">
          {result && (
            <div className={`mt-4 flex items-start gap-3 rounded-lg border p-3 animate-fade-in ${result.success ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
                {result.success ? (
                    <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                ) : (
                    <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                )}
                <p className={`text-sm font-medium ${result.success ? 'text-success' : 'text-destructive'}`}>
                    {result.message}
                </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
