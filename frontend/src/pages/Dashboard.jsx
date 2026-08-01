import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios.js';
import { Activity, Zap, CheckCircle, XCircle, Clock, Plus, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
  })
};

export const Dashboard = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats');
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 glass-card rounded-2xl skeleton" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-96 glass-card rounded-2xl skeleton" />
          <div className="h-96 glass-card rounded-2xl skeleton" />
        </div>
      </div>
    );
  }

  const statCards = [
    { name: 'Total Executions', value: metrics?.totalExecutions || 0, icon: Activity, iconColor: 'text-blue-400', bg: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
    { name: 'Active Workflows', value: metrics?.activeWorkflows || 0, icon: Zap, iconColor: 'text-violet-400', bg: 'bg-violet-500/10', borderColor: 'border-violet-500/20' },
    { name: 'Success Rate', value: `${metrics?.successRate || 0}%`, icon: CheckCircle, iconColor: 'text-emerald-400', bg: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
    { name: 'Avg Duration', value: `${metrics?.avgExecutionTimeMs || 0}ms`, icon: Clock, iconColor: 'text-amber-400', bg: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
  ];

  const trendData = metrics?.executionTrend || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card-strong rounded-xl px-4 py-3 shadow-xl">
          <p className="text-xs text-gray-400 mb-1">{label}</p>
          {payload.map((item, idx) => (
            <p key={idx} className="text-sm font-semibold" style={{ color: item.color }}>
              {item.name}: {item.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial="hidden" animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your workflow operations and performance.</p>
        </div>
        <Link 
          to="/workflows/new" 
          className="inline-flex items-center px-4 py-2.5 gradient-primary text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.02] transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Link>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div 
            key={stat.name} 
            variants={fadeInUp} 
            custom={i}
            className={`glass-card rounded-2xl p-5 group hover:bg-white/[0.04] transition-all duration-300 cursor-default`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} border ${stat.borderColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.name}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={fadeInUp} className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-white flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-violet-400" />
              Execution Trend (30 Days)
            </h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                <YAxis stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="success" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSuccess)" name="Successful" />
                <Area type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorFailed)" name="Failed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="glass-card rounded-2xl p-6 flex flex-col">
          <h2 className="text-sm font-semibold text-white mb-6 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-fuchsia-400" />
            Success vs Failed
          </h2>
          <div className="flex-1 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData.slice(-7)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="date" stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                <YAxis stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', color: '#6b7280' }}
                />
                <Bar dataKey="success" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} name="Successful" />
                <Bar dataKey="failed" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-center text-gray-600 mt-3">Last 7 days execution breakdown</p>
        </motion.div>
      </div>
    </motion.div>
  );
};
