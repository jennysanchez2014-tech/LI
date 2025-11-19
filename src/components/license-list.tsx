"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, List, Shield, CheckCircle2, XCircle, ShieldAlert, ShieldClose, ShieldCheck, Hourglass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type License = {
    id: string;
    status: 'ACTIVA' | 'BLOQUEADA' | 'EXPIRADA' | 'PENDIENTE';
    expiration_date: string;
}

const statusStyles = {
    ACTIVA: { icon: <CheckCircle2 className="h-4 w-4 text-success" />, color: "text-success", label: "Activa" },
    BLOQUEADA: { icon: <ShieldAlert className="h-4 w-4 text-accent" />, color: "text-accent", label: "Bloqueada" },
    EXPIRADA: { icon: <XCircle className="h-4 w-4 text-destructive" />, color: "text-destructive", label: "Expirada" },
    PENDIENTE: { icon: <Hourglass className="h-4 w-4 text-blue-500" />, color: "text-blue-500", label: "Pendiente" }
}

export function LicenseList() {
    const [adminKey, setAdminKey] = useState("");
    const [licenses, setLicenses] = useState<License[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);


    const handleFetchLicenses = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!adminKey) {
            setError("Admin key is required.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setHasSearched(true);

        try {
            const response = await fetch("/api/admin/get_licenses", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${adminKey}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "An unknown error occurred.");
            }
            // Sort by status: PENDIENTE first, then the rest
            data.sort((a: License, b: License) => {
                if (a.status === 'PENDIENTE' && b.status !== 'PENDIENTE') return -1;
                if (a.status !== 'PENDIENTE' && b.status === 'PENDIENTE') return 1;
                return 0;
            });
            setLicenses(data);
        } catch (err: any) {
            setError(err.message);
            setLicenses([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (clientId: string, newStatus: 'ACTIVA' | 'BLOQUEADA') => {
        setActionLoading(clientId);
        try {
            const response = await fetch("/api/admin/toggle_license_status", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminKey}`,
                },
                body: JSON.stringify({ clientId, newStatus }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to update status.");
            }
            
            if (hasSearched) {
                await handleFetchLicenses();
            }
            
        } catch (err: any) {
            setError(err.message);
        } finally {
            setActionLoading(null);
        }
    }

    // Auto-fetch licenses if key is present
    useEffect(() => {
        if(adminKey) {
            handleFetchLicenses();
        } else {
            setLicenses([]);
            setHasSearched(false);
            setError(null);
        }
    }, [adminKey]);

    return (
        <Card className="shadow-lg col-span-1 lg:col-span-2">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <List className="h-6 w-6 text-primary" />
                        <CardTitle className="font-headline">Registered Licenses</CardTitle>
                    </div>
                     <Badge variant="secondary"><Shield className="mr-1 h-3 w-3" />Admin</Badge>
                </div>
                <CardDescription>View, approve, and manage all client licenses.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleFetchLicenses} className="flex items-end gap-2 mb-4">
                    <div className="space-y-2 flex-grow">
                        <Label htmlFor="adminKey-list">Admin Key</Label>
                        <Input
                            id="adminKey-list"
                            type="password"
                            placeholder="Enter admin secret key to view licenses"
                            value={adminKey}
                            onChange={(e) => setAdminKey(e.target.value)}
                            disabled={isLoading}
                            className="bg-card"
                        />
                    </div>
                    <Button type="submit" variant="secondary" disabled={isLoading || !adminKey}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Refresh
                    </Button>
                </form>

                <div className="mt-4 min-h-[200px] rounded-lg border">
                    <TooltipProvider>
                        {isLoading && (
                            <div className="flex justify-center items-center h-full p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        )}

                        {!isLoading && error && (
                             <div className="flex flex-col justify-center items-center h-full text-center p-8">
                                <XCircle className="h-10 w-10 text-destructive mb-2" />
                                <p className="text-destructive font-medium">Error loading licenses</p>
                                <p className="text-sm text-muted-foreground">{error}</p>
                            </div>
                        )}
                        
                        {!isLoading && !error && licenses.length > 0 && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Client ID</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Expiration Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {licenses.map((license) => {
                                        const isExpired = new Date(license.expiration_date) < new Date();
                                        const displayStatus = isExpired && license.status !== 'PENDIENTE' ? 'EXPIRADA' : license.status;
                                        const statusInfo = statusStyles[displayStatus] || { icon: null, color: '', label: license.status };

                                        return (
                                            <TableRow key={license.id} className={license.status === 'PENDIENTE' ? 'bg-blue-500/5' : ''}>
                                                <TableCell className="font-mono text-sm">{license.id}</TableCell>
                                                <TableCell>
                                                    <div className={`flex items-center gap-2 font-medium ${statusInfo.color}`}>
                                                        {statusInfo.icon}
                                                        {statusInfo.label}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(license.expiration_date).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right space-x-1">
                                                    {license.status === 'PENDIENTE' && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                    onClick={() => handleUpdateStatus(license.id, 'ACTIVA')}
                                                                    disabled={actionLoading === license.id}
                                                                >
                                                                    {actionLoading === license.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 text-success" />}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Approve License</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    {license.status === 'ACTIVA' && (
                                                         <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                    onClick={() => handleUpdateStatus(license.id, 'BLOQUEADA')}
                                                                    disabled={actionLoading === license.id || isExpired}
                                                                >
                                                                    {actionLoading === license.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldClose className="h-4 w-4 text-destructive" />}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Block License</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                     {license.status === 'BLOQUEADA' && (
                                                         <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                    onClick={() => handleUpdateStatus(license.id, 'ACTIVA')}
                                                                    disabled={actionLoading === license.id || isExpired}
                                                                >
                                                                    {actionLoading === license.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4 text-success" />}
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Unblock License</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}

                        {!isLoading && !error && licenses.length === 0 && hasSearched && (
                            <div className="flex flex-col justify-center items-center h-full text-center p-8">
                                <p className="font-medium">No licenses found.</p>
                                 <p className="text-sm text-muted-foreground">The database is currently empty.</p>
                            </div>
                        )}

                         {!isLoading && !error && !hasSearched && (
                            <div className="flex flex-col justify-center items-center h-full text-center p-8">
                                <p className="font-medium">Enter your admin key</p>
                                 <p className="text-sm text-muted-foreground">Provide the admin key to view and manage licenses.</p>
                            </div>
                        )}
                    </TooltipProvider>
                </div>
            </CardContent>
        </Card>
    );
}
