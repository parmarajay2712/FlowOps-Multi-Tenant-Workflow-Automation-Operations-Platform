import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios.js';
import { CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, Cpu, Network, RotateCcw, Activity, Trash2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }
  })
};

export const Executions = () => {
  const [expandedId, setExpandedId] = useState(null);

  const queryClient = useQueryClient();

  const { data: executions, isLoading } = useQuery({
    queryKey: ['executions'],
    queryFn: async () => {
      const { data } = await api.get('/executions');
      return data.executions;
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      return api.delete('/executions');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      toast.success('Execution history cleared successfully');
    },
    onError: (error) => {
      toast.error('Failed to clear history: ' + (error.response?.data?.message || error.message));
    }
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case 'SUCCESS': return {
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        badge: <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Success</span>,
        dot: 'bg-emerald-400',
        timeline: 'bg-emerald-500'
      };
      case 'FAILED': return {
        icon: <XCircle className="w-4 h-4 text-red-400" />,
        badge: <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">Failed</span>,
        dot: 'bg-red-400',
        timeline: 'bg-red-500'
      };
      default: return {
        icon: <Clock className="w-4 h-4 text-amber-400" />,
        badge: <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>,
        dot: 'bg-amber-400',
        timeline: 'bg-amber-500'
      };
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <motion.div 
      initial="hidden" animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      className="max-w-7xl mx-auto space-y-6"
    >
      <motion.div variants={fadeInUp} className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Execution History
          </h1>
          <p className="text-sm text-gray-500 mt-1">Detailed observability and logs for recent workflow runs.</p>
        </div>
        
        {executions?.length > 0 && (
          <button 
            onClick={() => { if(confirm('Are you sure you want to clear all execution history? This cannot be undone.')) clearHistoryMutation.mutate() }}
            disabled={clearHistoryMutation.isPending}
            className="inline-flex items-center px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium rounded-xl hover:bg-red-500/20 transition-all duration-200 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear History
          </button>
        )}
      </motion.div>

      <motion.div variants={fadeInUp} className="glass-card rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="w-5 h-5 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">Loading executions...</p>
          </div>
        ) : executions?.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
              <Activity className="w-7 h-7 text-violet-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">No executions found</h3>
            <p className="text-sm text-gray-500">Run a workflow to see execution history here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th scope="col" className="px-5 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-widest w-10"></th>
                  <th scope="col" className="px-5 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Status</th>
                  <th scope="col" className="px-5 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Workflow</th>
                  <th scope="col" className="px-5 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Started</th>
                  <th scope="col" className="px-5 py-3.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Duration</th>
                </tr>
              </thead>
              <tbody>
                {executions.map((execution) => {
                  const statusConfig = getStatusConfig(execution.status);
                  return (
                    <React.Fragment key={execution._id}>
                      <tr 
                        onClick={() => setExpandedId(expandedId === execution._id ? null : execution._id)}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer group"
                      >
                        <td className="px-5 py-4 whitespace-nowrap text-gray-600 group-hover:text-gray-400 transition-colors">
                          {expandedId === execution._id 
                            ? <ChevronUp className="w-4 h-4" /> 
                            : <ChevronDown className="w-4 h-4" />
                          }
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {statusConfig.icon}
                            {statusConfig.badge}
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {execution.workflowId?.name || 'Deleted Workflow'}
                          </div>
                          <div className="text-[10px] text-gray-600 font-mono mt-0.5">{execution._id}</div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-400">{formatDistanceToNow(new Date(execution.startedAt), { addSuffix: true })}</div>
                          <div className="text-[10px] text-gray-600 mt-0.5">{format(new Date(execution.startedAt), 'PP pp')}</div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-300 font-mono">
                            {execution.durationMs ? `${execution.durationMs}ms` : '-'}
                          </span>
                        </td>
                      </tr>
                      
                      {/* Expanded Detail */}
                      {expandedId === execution._id && (
                        <tr>
                          <td colSpan={5} className="px-5 py-6 border-b border-white/[0.04] bg-white/[0.01]">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              
                              {/* Metrics */}
                              <div className="space-y-4">
                                <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Metrics & Info</h4>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="glass-card rounded-xl p-3">
                                    <div className="flex items-center text-gray-500 mb-1.5">
                                      <Cpu className="w-3.5 h-3.5 mr-1.5" />
                                      <span className="text-[10px] font-medium">Est. Memory</span>
                                    </div>
                                    <div className="text-sm font-semibold text-white">{formatBytes(execution.memoryUsed)}</div>
                                  </div>
                                  <div className="glass-card rounded-xl p-3">
                                    <div className="flex items-center text-gray-500 mb-1.5">
                                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                      <span className="text-[10px] font-medium">Retries</span>
                                    </div>
                                    <div className="text-sm font-semibold text-white">{execution.retryCount || 0}</div>
                                  </div>
                                </div>
                                
                                {execution.error && (
                                  <div className="bg-red-500/5 border border-red-500/15 text-red-400 p-3 rounded-xl text-xs font-mono break-all">
                                    <strong className="block mb-1 text-red-300">Error:</strong>
                                    {execution.error}
                                  </div>
                                )}
                              </div>

                              {/* Timeline */}
                              <div className="space-y-4">
                                <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Execution Timeline</h4>
                                <div className="relative border-l border-white/[0.06] ml-3 space-y-4 pb-2">
                                  <div className="relative pl-6">
                                    <div className="absolute w-2.5 h-2.5 bg-gray-600 rounded-full -left-[5.5px] top-1.5 border-2 border-[#0a0e1a]" />
                                    <p className="text-sm font-medium text-white">Triggered</p>
                                    <p className="text-[10px] text-gray-500">{format(new Date(execution.startedAt), 'HH:mm:ss.SSS')}</p>
                                  </div>
                                  
                                  {execution.steps?.map((step, idx) => (
                                    <div key={idx} className="relative pl-6">
                                      <div className={`absolute w-2.5 h-2.5 rounded-full -left-[5.5px] top-1.5 border-2 border-[#0a0e1a] ${
                                        step.status === 'SUCCESS' ? 'bg-emerald-500' : step.status === 'FAILED' ? 'bg-red-500' : 'bg-amber-500'
                                      }`} />
                                      <p className="text-sm font-medium text-white">Action: {step.actionId}</p>
                                      <p className="text-[10px] text-gray-500">{format(new Date(step.startedAt), 'HH:mm:ss.SSS')} • {step.status}</p>
                                      {step.error && <p className="text-[10px] text-red-400 mt-1 truncate">{step.error}</p>}
                                    </div>
                                  ))}

                                  {execution.completedAt && (
                                    <div className="relative pl-6">
                                      <div className={`absolute w-2.5 h-2.5 rounded-full -left-[5.5px] top-1.5 border-2 border-[#0a0e1a] ${
                                        execution.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-red-500'
                                      }`} />
                                      <p className="text-sm font-medium text-white">Completed</p>
                                      <p className="text-[10px] text-gray-500">{format(new Date(execution.completedAt), 'HH:mm:ss.SSS')}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Payloads */}
                              <div className="space-y-4">
                                <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Payloads</h4>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-[10px] text-gray-500 mb-1.5 flex items-center"><Network className="w-3 h-3 mr-1" /> Trigger Payload</p>
                                    <pre className="glass-card rounded-xl p-3 text-[10px] font-mono text-gray-300 overflow-x-auto max-h-28">
                                      {JSON.stringify(execution.triggerPayload || execution.triggerEventData || {}, null, 2)}
                                    </pre>
                                  </div>
                                  {execution.response && (
                                    <div>
                                      <p className="text-[10px] text-gray-500 mb-1.5 flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> Final Response</p>
                                      <pre className="glass-card rounded-xl p-3 text-[10px] font-mono text-gray-300 overflow-x-auto max-h-28">
                                        {JSON.stringify(execution.response, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
