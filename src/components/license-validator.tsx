"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, ShieldAlert, Loader2, KeyRound, Hourglass } from "lucide-react";

type ValidationStatus = 'valid' | 'invalid' | 'blocked' | 'expired' | 'pending';
type ValidationResult = {
  status: ValidationStatus;
  message: string;
};

const statusStyles: Record<ValidationStatus, { icon: React.ReactNode; text: string; title: string }> = {
    valid: { icon: <CheckCircle2 className="h-6 w-6 text-success" />, text: 'text-success', title: 'Valid' },
    blocked: { icon: <ShieldAlert className="h-6 w-6 text-accent" />, text: 'text-accent', title: 'Blocked' },
    expired: { icon: <XCircle className="h-6 w-6 text-destructive" />, text: 'text-destructive', title: 'Expired' },
    invalid: { icon: <XCircle className="h-6 w-6 text-destructive" />, text: 'text-destructive', title: 'Not Found' },
    pending: { icon: <Hourglass className="h-6 w-6 text-blue-500" />, text: 'text-blue-500', title: 'Pending Approval' },
};


export function LicenseValidator() {
  const [clientId, setClientId] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError("Please enter a Client ID.");
      return;
    }
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/validate_license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An unknown error occurred during validation.");
      }

      if (data.valid) {
        setResult({ status: 'valid', message: 'License is valid and active.' });
      } else {
        switch (data.reason) {
          case 'License is blocked':
            setResult({ status: 'blocked', message: 'This license is currently blocked.' });
            break;
          case 'License has expired':
            setResult({ status: 'expired', message: 'This license has expired.' });
            break;
          case 'License not found':
            setResult({ status: 'invalid', message: 'This license ID was not found.' });
            break;
          case 'License is pending approval':
            setResult({ status: 'pending', message: 'This license is pending administrator approval.' });
            break;
          default:
            setResult({ status: 'invalid', message: 'License is invalid for an unknown reason.' });
            break;
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
            <KeyRound className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">Validate License</CardTitle>
        </div>
        <CardDescription>Check the current status of a software license.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleValidate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId-validator">Client ID</Label>
            <Input
              id="clientId-validator"
              placeholder="Enter client ID to validate"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={isLoading}
              className="bg-card"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Validate
          </Button>
        </form>
        
        <div className="mt-4 min-h-[90px]">
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          {result && !error && (
            <div className="mt-4 flex items-center gap-4 rounded-lg border bg-background/50 p-4 animate-fade-in">
              {statusStyles[result.status].icon}
              <div className="flex-1">
                <p className={`font-semibold ${statusStyles[result.status].text}`}>
                  {statusStyles[result.status].title}
                </p>
                <p className="text-sm text-muted-foreground">{result.message}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
