import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Shield, Building, Mail, CheckCircle2, Key, List, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios.js';
import toast from 'react-hot-toast';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }
  })
};

export const Settings = () => {
  const { user, activeOrganization, memberships } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const queryClient = useQueryClient();

  const currentMembership = memberships.find(m => m.organizationId === activeOrganization?.id);
  const userRole = currentMembership ? currentMembership.role : 'Member';
  const isAdmin = userRole === 'OWNER' || userRole === 'ADMIN';

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

  const { data: apiKeys, isLoading: loadingKeys } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: async () => {
      const { data } = await api.get('/apikeys');
      return data.apiKeys;
    },
    enabled: activeTab === 'apikeys' && isAdmin,
  });

  const { data: auditData, isLoading: loadingAudit } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: async () => {
      const { data } = await api.get('/auditlogs?limit=20');
      return data.logs;
    },
    enabled: activeTab === 'audit' && isAdmin,
  });

  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');

  const createKeyMutation = useMutation({
    mutationFn: async (name) => {
      const { data } = await api.post('/apikeys', { name });
      return data.apiKey;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      setGeneratedKey(data.key);
      setNewKeyName('');
    }
  });

  const revokeKeyMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/apikeys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      toast.success('API key revoked successfully');
    },
    onError: (error) => {
      toast.error('Failed to revoke API key: ' + (error.response?.data?.message || error.message));
    }
  });

  const { data: teamMembers, isLoading: loadingTeam } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      const { data } = await api.get('/team');
      return data.members;
    },
    enabled: activeTab === 'team',
  });

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');

  const inviteMutation = useMutation({
    mutationFn: async (payload) => {
      await api.post('/team/invite', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      setInviteEmail('');
      toast.success('Member invited successfully!');
    },
    onError: (error) => {
      toast.error('Error inviting member: ' + (error.response?.data?.message || error.message));
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/team/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      toast.success('Member removed successfully');
    },
    onError: (error) => {
      toast.error('Error removing member: ' + (error.response?.data?.message || error.message));
    }
  });

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'apikeys', label: 'API Keys', icon: Key, restricted: true },
    { id: 'audit', label: 'Audit Logs', icon: List, restricted: true },
    { id: 'team', label: 'Team', icon: Shield, restricted: false },
  ];

  return (
    <motion.div
      initial="hidden" animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
      className="max-w-5xl mx-auto space-y-6"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences and organization settings.</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeInUp} className="flex space-x-1 border-b border-white/[0.04] pb-px">
        {tabs.map(tab => {
          if (tab.restricted && !isAdmin) return null;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setGeneratedKey(''); }}
              className={`flex items-center px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-violet-500 text-violet-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      <div className="pt-4">
        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div variants={fadeInUp} className="md:col-span-1 space-y-6">
              <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-[40px] -mr-10 -mt-10" />
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 mx-auto rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-violet-500/20 mb-4">
                    {initials}
                  </div>
                  <h2 className="text-lg font-bold text-white">{user?.name}</h2>
                  <div className="flex items-center justify-center text-sm text-gray-400 mt-1">
                    <Mail className="w-3.5 h-3.5 mr-1.5" />
                    {user?.email}
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/[0.04]">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified Account
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="md:col-span-2 space-y-6">
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center">
                  <Building className="w-4 h-4 mr-2 text-violet-400" />
                  Active Organization
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Organization Name</p>
                    <p className="text-base font-semibold text-white">{activeOrganization?.name}</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Your Role</p>
                    <p className="text-base font-semibold text-white capitalize">{userRole.toLowerCase()}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* API KEYS TAB */}
        {activeTab === 'apikeys' && (
          <motion.div variants={fadeInUp} className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">API Keys</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage keys used to authenticate API requests.</p>
                </div>
                <div className="mt-4 sm:mt-0 flex gap-2">
                  <input
                    type="text"
                    placeholder="Key name..."
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                  <button
                    onClick={() => createKeyMutation.mutate(newKeyName)}
                    disabled={!newKeyName || createKeyMutation.isPending}
                    className="inline-flex items-center px-4 py-2 gradient-primary text-white text-sm font-semibold rounded-xl disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Create Key
                  </button>
                </div>
              </div>

              {generatedKey && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm text-emerald-400 font-semibold mb-2">Key generated successfully! Copy it now, you won't see it again.</p>
                  <code className="block p-3 bg-[#0d1117] rounded-lg text-emerald-300 break-all">{generatedKey}</code>
                </div>
              )}

              {loadingKeys ? (
                <div className="h-32 flex items-center justify-center"><div className="w-6 h-6 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" /></div>
              ) : apiKeys?.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/[0.04] rounded-xl">
                  <Key className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No API keys generated yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.04] text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="pb-3 px-4">Name</th>
                        <th className="pb-3 px-4">Created</th>
                        <th className="pb-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {apiKeys?.map(key => (
                        <tr key={key._id} className="hover:bg-white/[0.01]">
                          <td className="py-4 px-4 text-sm text-white font-medium">{key.name}</td>
                          <td className="py-4 px-4 text-sm text-gray-400">{new Date(key.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => { if (confirm('Revoke this key?')) revokeKeyMutation.mutate(key._id) }}
                              disabled={revokeKeyMutation.isPending}
                              className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-400/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* AUDIT LOGS TAB */}
        {activeTab === 'audit' && (
          <motion.div variants={fadeInUp} className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">Audit Logs</h3>
                <p className="text-sm text-gray-500 mt-1">Track security and configuration changes.</p>
              </div>

              {loadingAudit ? (
                <div className="h-32 flex items-center justify-center"><div className="w-6 h-6 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" /></div>
              ) : auditData?.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/[0.04] rounded-xl">
                  <List className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No audit logs found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.04] text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="pb-3 px-4">Action</th>
                        <th className="pb-3 px-4">Actor</th>
                        <th className="pb-3 px-4">Resource</th>
                        <th className="pb-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {auditData?.map(log => (
                        <tr key={log._id} className="hover:bg-white/[0.01]">
                          <td className="py-4 px-4 text-sm text-violet-300 font-medium">{log.action}</td>
                          <td className="py-4 px-4 text-sm text-gray-300">{log.actorId?.name || 'System'}</td>
                          <td className="py-4 px-4 text-sm text-gray-400">{log.resourceType}</td>
                          <td className="py-4 px-4 text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
        {/* TEAM TAB */}
        {activeTab === 'team' && (
          <motion.div variants={fadeInUp} className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Team Members</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage who has access to this organization.</p>
                </div>
                {isAdmin && (
                  <div className="mt-4 sm:mt-0 flex gap-2">
                    <input
                      type="email"
                      placeholder="Email address..."
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500 w-48"
                    />
                    <select
                      value={inviteRole}
                      onChange={e => setInviteRole(e.target.value)}
                      className="bg-white/[0.02] border border-white/[0.04] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="MEMBER">Member</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                    <button
                      onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })}
                      disabled={!inviteEmail || inviteMutation.isPending}
                      className="inline-flex items-center px-4 py-2 gradient-primary text-white text-sm font-semibold rounded-xl disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Invite
                    </button>
                  </div>
                )}
              </div>

              {loadingTeam ? (
                <div className="h-32 flex items-center justify-center"><div className="w-6 h-6 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" /></div>
              ) : teamMembers?.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/[0.04] rounded-xl">
                  <User className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No team members found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.04] text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="pb-3 px-4">User</th>
                        <th className="pb-3 px-4">Role</th>
                        <th className="pb-3 px-4">Joined</th>
                        {isAdmin && <th className="pb-3 px-4 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {teamMembers?.map(member => (
                        <tr key={member._id} className="hover:bg-white/[0.01]">
                          <td className="py-4 px-4">
                            <p className="text-sm text-white font-medium">{member.userId?.name}</p>
                            <p className="text-xs text-gray-400">{member.userId?.email}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-1 bg-white/[0.05] border border-white/[0.05] rounded-md text-xs font-medium text-gray-300">
                              {member.role}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-400">{new Date(member.createdAt).toLocaleDateString()}</td>
                          {isAdmin && (
                            <td className="py-4 px-4 text-right">
                              {member.role !== 'OWNER' && member.userId?._id !== user.id && (
                                <button
                                  onClick={() => { if (confirm('Remove this member?')) removeMemberMutation.mutate(member._id) }}
                                  disabled={removeMemberMutation.isPending}
                                  className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-400/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
