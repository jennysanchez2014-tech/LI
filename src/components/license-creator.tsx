"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Loader2, Shield, CalendarIcon, CheckCircle2, XCircle, FilePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type CreateResult = {
    success: boolean;
    message: string;
}

export function LicenseCreator() {
  const [clientId, setClientId] = useState("");
  const [name, setName] = useState("");
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(new Date(new Date().setFullYear(new Date().getFullYear() + 1)));
  const [adminKey, setAdminKey] = useState("");
  const [result, setResult] = useState<CreateResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !expirationDate || !adminKey) {
        setResult({ success: false, message: "Client ID, Expiration Date, and Admin Key are required." });
        return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/create_license", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify({ clientId, expirationDate: expirationDate.toISOString(), name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An unknown error occurred.");
      }
      
      setResult({ success: true, message: data.message });
      setClientId(""); // Reset fields on success
      setName("");
      
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
                <FilePlus className="h-6 w-6 text-primary" />
                <CardTitle className="font-headline">Create License</CardTitle>
            </div>
            <Badge variant="secondary"><Shield className="mr-1 h-3 w-3" />Admin</Badge>
        </div>
        <CardDescription>Create a new license for a client.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId-creator">Client ID</Label>
            <Input
              id="clientId-creator"
              placeholder="Enter a unique client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              disabled={isLoading}
              className="bg-card"
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="clientName-creator">Client Name (Optional)</Label>
            <Input
              id="clientName-creator"
              placeholder="e.g., John Doe's Laptop"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="bg-card"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiration-date">Expiration Date</Label>
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !expirationDate && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expirationDate ? format(expirationDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expirationDate}
                  onSelect={setExpirationDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminKey-creator">Admin Key</Label>
            <Input
              id="adminKey-creator"
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
            Create New License
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
