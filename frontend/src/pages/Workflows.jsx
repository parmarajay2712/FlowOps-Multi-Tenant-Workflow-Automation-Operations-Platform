import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios.js';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Play, MoreVertical, Zap, Upload, Download, ArrowRight, Workflow, Trash2, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }
  })
};

export const Workflows = () => {
  const { data: workflows, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data } = await api.get('/workflows');
      return data.workflows;
    },
  });

  const queryClient = useQueryClient();
  const fileInputRef = React.useRef(null);

  const importMutation = useMutation({
    mutationFn: async (workflowData) => {
      return api.post('/workflows/import', workflowData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow imported successfully!');
    },
    onError: (error) => {
      toast.error('Failed to import workflow. Ensure it is valid JSON.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return api.delete(`/workflows/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete workflow: ' + (error.response?.data?.message || error.message));
    }
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, name }) => {
      return api.put(`/workflows/${id}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow renamed successfully');
    },
    onError: (error) => {
      toast.error('Failed to rename workflow: ' + (error.response?.data?.message || error.message));
    }
  });

  const handleRename = (workflow) => {
    const newName = prompt('Enter new workflow name:', workflow.name);
    if (newName && newName.trim() !== '' && newName !== workflow.name) {
      renameMutation.mutate({ id: workflow._id, name: newName.trim() });
    }
  };

  const triggerMutation = useMutation({
    mutationFn: async (id) => {
      return api.post(`/workflows/${id}/trigger`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      toast.success('Workflow executed successfully!');
    },
    onError: (error) => {
      toast.error('Failed to execute workflow: ' + (error.response?.data?.message || error.message));
    }
  });

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.name || !data.actions) {
          toast.error('Invalid JSON file format for workflow');
          return;
        }
        importMutation.mutate(data);
      } catch (e) {
        toast.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleExport = async (id, name) => {
    try {
      const { data } = await api.get(`/workflows/${id}/export`);
      const blob = new Blob([JSON.stringify(data.workflow, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name.replace(/\s+/g, '_').toLowerCase()}_export.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Workflow exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export workflow.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
      case 'PAUSED': return { dot: 'bg-amber-400', text: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' };
      default: return { dot: 'bg-gray-400', text: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' };
    }
  };

  return (
    <motion.div 
      initial="hidden" animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Workflows
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage and create automated workflows for your organization.</p>
        </div>
        <div className="flex items-center space-x-3">
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImport} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={importMutation.isPending}
            className="inline-flex items-center px-4 py-2.5 glass-card rounded-xl text-gray-300 text-sm font-medium hover:bg-white/[0.04] transition-all duration-200 disabled:opacity-50"
          >
            <Upload className="w-4 h-4 mr-2 text-gray-500" />
            Import
          </button>
          <Link 
            to="/workflows/new" 
            className="inline-flex items-center px-4 py-2.5 gradient-primary text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.02] transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </Link>
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 glass-card rounded-2xl skeleton" />
          ))}
        </div>
      ) : workflows?.length === 0 ? (
        <motion.div variants={fadeInUp} className="text-center py-24 glass-card rounded-2xl">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
            <Workflow className="w-8 h-8 text-violet-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No workflows yet</h3>
          <p className="text-sm text-gray-500 mb-6">Get started by creating your first automated workflow.</p>
          <Link 
            to="/workflows/new" 
            className="inline-flex items-center px-6 py-3 gradient-primary text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows?.map((workflow, i) => {
            const statusColor = getStatusColor(workflow.status);
            return (
              <motion.div 
                key={workflow._id} 
                variants={fadeInUp} 
                custom={i}
                className="glass-card rounded-2xl p-6 group hover:bg-white/[0.04] transition-all duration-300 relative overflow-hidden"
              >
                {/* Hover glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/0 group-hover:bg-violet-500/5 rounded-full blur-[50px] transition-all duration-500" />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => triggerMutation.mutate(workflow._id)}
                        disabled={triggerMutation.isPending && triggerMutation.variables === workflow._id}
                        className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center hover:bg-violet-500/20 hover:scale-110 transition-all duration-300 disabled:opacity-50"
                        title="Run Workflow"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      <div>
                        <h3 className="font-semibold text-white text-sm">{workflow.name}</h3>
                        <div className="flex items-center mt-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${statusColor.dot} mr-1.5`} />
                          <span className={`text-[11px] ${statusColor.text}`}>{workflow.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleRename(workflow)}
                        disabled={renameMutation.isPending}
                        className="text-gray-500 hover:text-violet-400 transition-colors p-1.5 rounded-lg hover:bg-violet-400/10"
                        title="Rename Workflow"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => { if(confirm('Delete this workflow?')) deleteMutation.mutate(workflow._id) }}
                        disabled={deleteMutation.isPending}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10"
                        title="Delete Workflow"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-gray-500 line-clamp-2 leading-relaxed">
                    {workflow.description || 'No description provided.'}
                  </p>

                  <div className="mt-5 flex items-center justify-between text-xs border-t border-white/[0.04] pt-4">
                    <span className="text-gray-600 flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      {workflow.trigger.type}
                    </span>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => handleExport(workflow._id, workflow.name)} 
                        className="text-gray-500 hover:text-gray-300 font-medium flex items-center transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> Export
                      </button>
                      <Link 
                        to={`/workflows/${workflow._id}`} 
                        className="text-violet-400 hover:text-violet-300 font-semibold flex items-center transition-colors"
                      >
                        Edit <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
