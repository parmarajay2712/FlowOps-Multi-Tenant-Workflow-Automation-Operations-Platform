import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios.js';
import { ArrowLeft, Save, Play, Plus, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MarkerType,
  MiniMap,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const nodeStyle = {
  trigger: {
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: '#fff',
    border: '1px solid rgba(139,92,246,0.3)',
    borderRadius: '12px',
    padding: '12px 24px',
    fontWeight: '600',
    fontSize: '13px',
    fontFamily: "'Inter', sans-serif",
    boxShadow: '0 4px 20px rgba(139,92,246,0.25)',
  },
  action: {
    background: 'linear-gradient(135deg, #059669, #10b981)',
    color: '#fff',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: '12px',
    padding: '12px 24px',
    fontWeight: '500',
    fontSize: '13px',
    fontFamily: "'Inter', sans-serif",
    boxShadow: '0 4px 20px rgba(16,185,129,0.2)',
  }
};

const initialNodes = [
  {
    id: 'trigger',
    type: 'default',
    position: { x: 250, y: 50 },
    data: { label: 'Webhook Trigger' },
    style: nodeStyle.trigger
  }
];

export const WorkflowBuilder = () => {
  const { id } = useParams();
  const isEditing = id && id !== 'new';
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('New Workflow');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState([]);

  const { data: existingWorkflow, isLoading } = useQuery({
    queryKey: ['workflow', id],
    queryFn: async () => {
      const { data } = await api.get(`/workflows/${id}`);
      return data.workflow;
    },
    enabled: !!isEditing,
  });

  useEffect(() => {
    if (existingWorkflow) {
      setName(existingWorkflow.name);
      setDescription(existingWorkflow.description || '');
      setStatus(existingWorkflow.status);
      
      const newNodes = [
        {
          id: 'trigger',
          type: 'default',
          position: { x: 250, y: 50 },
          data: { label: `${existingWorkflow.trigger?.type || 'WEBHOOK'} Trigger` },
          style: nodeStyle.trigger
        }
      ];
      
      const newEdges = [];
      let previousId = 'trigger';
      let currentY = 150;

      existingWorkflow.actions?.forEach((action, index) => {
        newNodes.push({
          id: action.id,
          position: { x: 250, y: currentY },
          data: { label: action.type === 'webhook' ? 'Call Webhook' : action.type },
          style: nodeStyle.action
        });
        
        newEdges.push({
          id: `e-${previousId}-${action.id}`,
          source: previousId,
          target: action.id,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: 'rgba(139,92,246,0.4)', strokeWidth: 2 }
        });
        
        previousId = action.id;
        currentY += 100;
      });

      setNodes(newNodes);
      setEdges(newEdges);
    }
  }, [existingWorkflow]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ 
      ...params, 
      type: 'smoothstep', 
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: 'rgba(139,92,246,0.4)', strokeWidth: 2 }
    }, eds)),
    []
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, name]); // Re-bind when data changes to save latest state

  const addActionNode = (type) => {
    const newNodeId = `action_${Date.now()}`;
    const lastNode = nodes[nodes.length - 1];
    
    let label = 'New Action';
    let config = {};
    if (type === 'send_email') { label = 'Send Email'; config = { to: '', subject: '' }; }
    else if (type === 'delay') { label = 'Delay'; config = { ms: 1000 }; }
    else if (type === 'webhook') { label = 'Webhook'; config = { url: '', method: 'POST' }; }

    const newNode = {
      id: newNodeId,
      position: { x: lastNode.position.x, y: lastNode.position.y + 100 },
      data: { label, type, config },
      style: nodeStyle.action
    };
    
    setNodes((nds) => [...nds, newNode]);
    
    if (nodes.length > 0) {
      setEdges((eds) => [...eds, {
        id: `e-${lastNode.id}-${newNodeId}`,
        source: lastNode.id,
        target: newNodeId,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: 'rgba(139,92,246,0.4)', strokeWidth: 2 }
      }]);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (isEditing) {
        return api.put(`/workflows/${id}`, payload);
      }
      return api.post('/workflows', payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow saved successfully!');
      if (!isEditing && response?.data?.workflow?._id) {
        navigate(`/workflows/${response.data.workflow._id}`, { replace: true });
      }
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast.error('Error saving workflow: ' + (error.response?.data?.message || error.message));
    }
  });

  const triggerMutation = useMutation({
    mutationFn: async () => {
      return api.post(`/workflows/${id}/trigger`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['executions'] });
      toast.success('Workflow executed successfully! Check Executions tab.');
    },
    onError: (error) => {
      toast.error('Failed to execute workflow: ' + (error.response?.data?.message || error.message));
    }
  });

  const handleSave = () => {
    if (nodes.length <= 1) {
      toast.error('Please add at least one action to the workflow.');
      return;
    }
    
    // Quick validation: Check if there are disconnected nodes
    const connectedNodeIds = new Set(edges.map(e => e.target));
    connectedNodeIds.add('trigger');
    const disconnected = nodes.find(n => !connectedNodeIds.has(n.id));
    if (disconnected) {
      toast.error('Please connect all nodes in the workflow.');
      return;
    }

    const actions = nodes.filter(n => n.id !== 'trigger').map(n => ({
      id: n.id,
      type: n.data.type || 'webhook',
      config: n.data.config || { url: 'https://api.example.com', method: 'POST' }
    }));

    const payload = {
      name,
      description,
      status,
      trigger: { type: 'WEBHOOK', config: {} },
      conditions: [],
      actions
    };

    saveMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="w-5 h-5 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col space-y-0 -m-6 md:-m-8">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#0d1117] border-b border-white/[0.04]">
        <div className="flex items-center space-x-4">
          <Link to="/workflows" className="p-2 hover:bg-white/[0.04] rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div className="w-px h-6 bg-white/[0.06]" />
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            className="text-base font-semibold bg-transparent border-none focus:ring-0 p-0 text-white placeholder-gray-500 focus:outline-none"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          />
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-white/[0.04] rounded-xl overflow-hidden">
            <button onClick={() => addActionNode('webhook')} className="px-3 py-2 text-gray-300 text-sm font-medium hover:bg-white/[0.04] transition-all border-r border-white/[0.04]">
              + Webhook
            </button>
            <button onClick={() => addActionNode('send_email')} className="px-3 py-2 text-gray-300 text-sm font-medium hover:bg-white/[0.04] transition-all border-r border-white/[0.04]">
              + Email
            </button>
            <button onClick={() => addActionNode('delay')} className="px-3 py-2 text-gray-300 text-sm font-medium hover:bg-white/[0.04] transition-all">
              + Delay
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => triggerMutation.mutate()}
              disabled={!isEditing || triggerMutation.isPending || saveMutation.isPending}
              className="inline-flex items-center px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium rounded-xl hover:bg-emerald-500/20 transition-all duration-200 disabled:opacity-50"
              title={!isEditing ? "Save workflow first to run" : "Run workflow"}
            >
              <Play className="w-4 h-4 mr-2" />
              Run
            </button>
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="inline-flex items-center px-4 py-2 gradient-primary text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-200 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save Workflow'}
            </button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 w-full bg-[#080b14] relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          snapToGrid={true}
          snapGrid={[20, 20]}
          deleteKeyCode={['Backspace', 'Delete']}
          style={{ background: '#080b14' }}
        >
          <Background color="rgba(139,92,246,0.08)" gap={20} size={1} />
          <Controls />
          <MiniMap 
            nodeColor={(n) => {
              if (n.style?.background?.includes('7c3aed')) return '#8b5cf6';
              return '#10b981';
            }}
            maskColor="rgba(0,0,0,0.2)"
            className="rounded-xl border border-white/[0.04] bg-[#0d1117] overflow-hidden shadow-2xl"
          />
        </ReactFlow>
      </div>
    </div>
  );
};
