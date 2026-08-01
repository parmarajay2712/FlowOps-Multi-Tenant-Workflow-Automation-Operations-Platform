import React from 'react';
import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
  LayoutDashboard, 
  Workflow as WorkflowIcon, 
  Activity, 
  Settings, 
  LogOut,
  ChevronDown,
  Building,
  Search,
  Zap,
  Check
} from 'lucide-react';
import { CommandPalette } from '../components/CommandPalette.jsx';
import { NotificationCenter } from '../components/NotificationCenter.jsx';

export const DashboardLayout = () => {
  const { user, activeOrganization, memberships, logout, switchOrganization, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = React.useState(false);
  // No need for local isSearchOpen state anymore

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center animate-pulse">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="w-5 h-5 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Workflows', href: '/workflows', icon: WorkflowIcon },
    { name: 'Executions', href: '/executions', icon: Activity },
    { name: 'Settings', href: '/settings', icon: Settings },
  ].filter(nav => {
    if (!activeOrganization?.features) return true;
    if (nav.name === 'Webhooks' && !activeOrganization.features.includes('webhooks')) return false;
    if (nav.name === 'Audit Logs' && !activeOrganization.features.includes('audit_logs')) return false;
    return true;
  });

  // Get user initials for avatar
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="min-h-screen w-full bg-[#0a0e1a] flex">
      {/* ===== Sidebar ===== */}
      <div className="w-64 bg-[#0d1117] border-r border-white/[0.04] flex flex-col hidden md:flex">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-white/[0.04]">
          <Link to="/dashboard" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/15">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              FlowOps
            </span>
          </Link>
        </div>

        {/* Org Switcher */}
        <div className="px-3 pt-4 pb-2 relative">
          <button 
            onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
            className="w-full flex items-center justify-between glass-card rounded-xl px-3 py-2.5 hover:bg-white/[0.04] transition-all duration-200"
          >
            <div className="flex items-center truncate">
              <div className="w-6 h-6 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mr-2.5 flex-shrink-0">
                <Building className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <span className="text-sm font-medium text-gray-200 truncate">
                {activeOrganization?.name || 'Loading...'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${isOrgDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOrgDropdownOpen && (
            <div className="absolute top-full left-3 right-3 mt-1 glass-card-strong rounded-xl shadow-xl shadow-black/30 z-50 py-1 overflow-hidden">
              <div className="px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-widest border-b border-white/[0.04]">
                Organizations
              </div>
              {memberships.map((m) => (
                <button
                  key={m.organizationId}
                  onClick={() => {
                    switchOrganization(m.organizationId);
                    setIsOrgDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between hover:bg-white/[0.04] transition-colors ${
                    m.organizationId === activeOrganization?.id 
                      ? 'text-violet-400' 
                      : 'text-gray-300'
                  }`}
                >
                  <span className="truncate">{m.organizationName}</span>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-[10px] text-gray-500 bg-white/[0.04] px-1.5 py-0.5 rounded capitalize">
                      {m.role.toLowerCase()}
                    </span>
                    {m.organizationId === activeOrganization?.id && (
                      <Check className="w-3.5 h-3.5 text-violet-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'text-white bg-white/[0.06]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 gradient-primary rounded-r-full" />
                )}
                <item.icon className={`mr-3 h-[18px] w-[18px] transition-colors ${
                  isActive ? 'text-violet-400' : 'text-gray-500 group-hover:text-gray-400'
                }`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* User Profile Footer */}
        <div className="p-3 border-t border-white/[0.04]">
          <div className="flex items-center justify-between glass-card rounded-xl px-3 py-2.5">
            <div className="flex items-center truncate">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center mr-2.5 flex-shrink-0 text-[11px] font-bold text-white">
                {initials}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-sm font-medium text-white truncate">{user.name}</span>
                <span className="text-[11px] text-gray-500 truncate">{user.email}</span>
              </div>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 flex-shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ===== Main Content Area ===== */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-[#0a0e1a]/80 backdrop-blur-xl border-b border-white/[0.04] flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
          <div className="flex items-center md:hidden">
            <div className="w-7 h-7 gradient-primary rounded-lg flex items-center justify-center mr-2">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>FlowOps</span>
          </div>
          
          <div className="flex-1 flex items-center justify-end space-x-3">
            <button 
              onClick={() => document.dispatchEvent(new CustomEvent('open-command-palette'))}
              className="flex items-center text-sm text-gray-500 glass-card rounded-xl px-3 py-2 hover:bg-white/[0.04] transition-all duration-200 w-full max-w-xs md:max-w-sm justify-between group"
            >
              <div className="flex items-center">
                <Search className="w-4 h-4 mr-2 text-gray-500 group-hover:text-gray-400" />
                <span className="text-gray-500">Search...</span>
              </div>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 border border-white/[0.06] rounded bg-white/[0.03] ml-4">
                ⌘K
              </kbd>
            </button>
            <NotificationCenter />
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      <CommandPalette />
    </div>
  );
};
