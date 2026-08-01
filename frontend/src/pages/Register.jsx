import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/axios.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Zap, Mail, Lock, User, Building, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/register', formData);
      login(data.token, data.user, data.organization, [{
        role: 'OWNER',
        organizationId: data.organization.id,
        organizationName: data.organization.name
      }]);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'John Doe' },
    { key: 'email', label: 'Email address', type: 'email', icon: Mail, placeholder: 'you@company.com' },
    { key: 'password', label: 'Password', type: 'password', icon: Lock, placeholder: '••••••••', minLength: 8 },
    { key: 'organizationName', label: 'Organization Name', type: 'text', icon: Building, placeholder: 'Acme Corp' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[120px] animate-orb-1" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full bg-cyan-500/6 blur-[100px] animate-orb-2" />
      <div className="absolute top-[50%] left-[50%] w-[300px] h-[300px] rounded-full bg-fuchsia-500/4 blur-[80px] animate-orb-3" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10 py-12"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Start automating in under 60 seconds
          </p>
        </div>

        {/* Register Card */}
        <div className="glass-card-strong rounded-2xl p-8 glow-violet">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-3 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
                <div className="relative">
                  <field.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    id={`register-${field.key}`}
                    type={field.key === 'password' ? (showPassword ? 'text' : 'password') : field.type}
                    required
                    minLength={field.minLength}
                    value={formData[field.key]}
                    onChange={(e) => setFormData({...formData, [field.key]: e.target.value})}
                    placeholder={field.placeholder}
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all duration-200"
                  />
                  {field.key === 'password' && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              id="register-submit"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white gradient-primary shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Trust note */}
        <p className="text-center text-[11px] text-gray-600 mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
};
