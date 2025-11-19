import { LicenseValidator } from '@/components/license-validator';
import { LicenseExtender } from '@/components/license-extender';
import { LicenseCreator } from '@/components/license-creator';
import { LicenseList } from '@/components/license-list';
import { ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-7xl">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <ShieldCheck className="h-10 w-10 text-primary" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground font-headline">
              LicenseGuard
            </h1>
          </div>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            A simple and secure way to manage and validate your software licenses.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="lg:col-span-1">
                <LicenseValidator />
            </div>
            <div className="md:col-span-2 lg:col-span-2">
                 <Tabs defaultValue="list" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="list">Manage Licenses</TabsTrigger>
                        <TabsTrigger value="create">Create</TabsTrigger>
                        <TabsTrigger value="extend">Extend</TabsTrigger>
                    </TabsList>
                    <TabsContent value="list" className="mt-4">
                        <LicenseList />
                    </TabsContent>
                    <TabsContent value="create" className="mt-4">
                        <div className="grid grid-cols-1 gap-8">
                            <LicenseCreator />
                        </div>
                    </TabsContent>
                    <TabsContent value="extend" className="mt-4">
                         <div className="grid grid-cols-1 gap-8">
                           <LicenseExtender />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LicenseGuard. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
