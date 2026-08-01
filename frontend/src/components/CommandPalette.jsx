import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Workflow, Settings, Zap, Play } from 'lucide-react';
import './CommandPalette.css';

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    
    const openCustom = () => setOpen(true);

    document.addEventListener('keydown', down);
    document.addEventListener('open-command-palette', openCustom);
    
    return () => {
      document.removeEventListener('keydown', down);
      document.removeEventListener('open-command-palette', openCustom);
    };
  }, []);

  const runCommand = (command) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-[20vh] bg-black/50 backdrop-blur-sm">
      <Command 
        className="w-full max-w-lg bg-[#0d1117] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
      >
        <div className="flex items-center px-4 py-3 border-b border-white/[0.08]">
          <Search className="w-5 h-5 text-gray-500 mr-3" />
          <Command.Input 
            autoFocus 
            placeholder="Type a command or search..." 
            className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder-gray-500"
          />
        </div>

        <Command.List className="max-h-[300px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-gray-500">No results found.</Command.Empty>
          
          <Command.Group heading="Navigation">
            <Command.Item onSelect={() => runCommand(() => navigate('/dashboard'))}>
              <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => navigate('/workflows'))}>
              <Workflow className="w-4 h-4 mr-2" /> Workflows
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => navigate('/executions'))}>
              <Play className="w-4 h-4 mr-2" /> Executions
            </Command.Item>
            <Command.Item onSelect={() => runCommand(() => navigate('/settings'))}>
              <Settings className="w-4 h-4 mr-2" /> Settings
            </Command.Item>
          </Command.Group>

          <Command.Group heading="Actions">
            <Command.Item onSelect={() => runCommand(() => navigate('/workflows/new'))}>
              <Zap className="w-4 h-4 mr-2 text-amber-400" /> Create new workflow
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
};
