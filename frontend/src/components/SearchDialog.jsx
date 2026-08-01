import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, FileText, Activity, Users, ShieldAlert, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/axios.js';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

export const SearchDialog = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        isOpen ? onClose() : document.dispatchEvent(new CustomEvent('open-search'));
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return null;
      const { data } = await api.get(`/search?q=${debouncedQuery}`);
      return data;
    },
    enabled: debouncedQuery.length >= 2,
  });

  const handleSelect = (item) => {
    onClose();
    if (item.type === 'workflow') navigate(`/workflows/${item.id}`);
    if (item.type === 'execution') navigate(`/executions/${item.id}`);
    setQuery('');
  };

  const getIcon = (type) => {
    switch (type) {
      case 'workflow': return <Activity className="w-4 h-4 text-violet-400" />;
      case 'execution': return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'member': return <Users className="w-4 h-4 text-cyan-400" />;
      case 'auditlog': return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      default: return <Command className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[12vh]">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={onClose} 
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl glass-card-strong rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
          >
            {/* Gradient top border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

            <div className="flex items-center border-b border-white/[0.04] px-4 py-3.5">
              <Search className="w-5 h-5 text-gray-500 mr-3" />
              <input
                ref={inputRef}
                type="text"
                className="flex-1 bg-transparent border-0 focus:ring-0 text-white placeholder-gray-500 outline-none text-sm"
                placeholder="Search workflows, executions, members..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-semibold text-gray-600 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {isLoading && (
                <div className="p-6 text-center">
                  <div className="w-4 h-4 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Searching...</p>
                </div>
              )}
              
              {!isLoading && results && (
                <div className="space-y-3">
                  {['workflows', 'executions', 'members', 'auditLogs'].map(category => {
                    const items = results[category];
                    if (!items || items.length === 0) return null;
                    
                    return (
                      <div key={category} className="px-1">
                        <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5 px-2">
                          {category}
                        </h3>
                        <ul className="space-y-0.5">
                          {items.map((item) => (
                            <li key={item.id}>
                              <button
                                onClick={() => handleSelect(item)}
                                className="w-full flex items-center px-3 py-2.5 text-sm rounded-xl hover:bg-white/[0.04] text-left transition-all duration-150 group"
                              >
                                <div className="flex-shrink-0 mr-3">
                                  {getIcon(item.type)}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                  <p className="font-medium text-gray-200 truncate text-sm">{item.title}</p>
                                  <p className="text-[11px] text-gray-500 truncate">{item.subtitle}</p>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}

              {!isLoading && results && Object.values(results).every(arr => arr.length === 0) && query.length >= 2 && (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-500">No results found for "<span className="text-gray-300">{query}</span>"</p>
                </div>
              )}

              {!query && (
                <div className="p-6 text-center">
                  <Search className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Type at least 2 characters to search.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
