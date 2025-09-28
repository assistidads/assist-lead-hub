
import {
  BarChart3,
  Database,
  FileText,
  Home,
  Users,
  TrendingUp,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
const menuItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
  },
  {
    title: 'Data Master',
    url: '/master',
    icon: Database,
  },
  {
    title: 'Data Prospek',
    url: '/prospek',
    icon: Users,
  },
  {
    title: 'Report Ads',
    url: '/report-ads',
    icon: TrendingUp,
  },
  {
    title: 'Laporan',
    url: '/laporan',
    icon: BarChart3,
  },
];

export function AppSidebar() {

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Assist.id</h2>
              <p className="text-xs text-muted-foreground">Lead Management</p>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-2 text-black ${
                          isActive
                            ? 'bg-muted font-medium'
                            : 'hover:bg-muted/50'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
