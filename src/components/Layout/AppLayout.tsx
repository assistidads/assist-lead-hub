
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { User } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-background flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">Assist.id Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">User</span>
                <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                  CS Support
                </span>
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6 bg-muted/10">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
