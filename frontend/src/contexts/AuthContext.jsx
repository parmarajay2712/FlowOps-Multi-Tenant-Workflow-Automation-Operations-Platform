import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/axios.js';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeOrganization, setActiveOrganization] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
        setMemberships(data.memberships);
        
        const storedOrgId = localStorage.getItem('activeOrgId');
        if (storedOrgId) {
          const org = data.memberships.find(m => m.organizationId === storedOrgId);
          if (org) {
            setActiveOrganization({ id: org.organizationId, name: org.organizationName, features: org.features });
          } else if (data.memberships.length > 0) {
            setActiveOrganization({ id: data.memberships[0].organizationId, name: data.memberships[0].organizationName, features: data.memberships[0].features });
            localStorage.setItem('activeOrgId', data.memberships[0].organizationId);
          }
        } else if (data.memberships.length > 0) {
          setActiveOrganization({ id: data.memberships[0].organizationId, name: data.memberships[0].organizationName, features: data.memberships[0].features });
          localStorage.setItem('activeOrgId', data.memberships[0].organizationId);
        }
      } catch (error) {
        console.error('Failed to authenticate:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('activeOrgId');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);


  const login = (token, userData, orgData, orgMemberships) => {
    localStorage.setItem('token', token);
    localStorage.setItem('activeOrgId', orgData.id);
    setUser(userData);
    setActiveOrganization(orgData);
    setMemberships(orgMemberships);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('activeOrgId');
    setUser(null);
    setActiveOrganization(null);
    setMemberships([]);
  };

  const switchOrganization = (orgId) => {
    const org = memberships.find(m => m.organizationId === orgId);
    if (org) {
      setActiveOrganization({ id: org.organizationId, name: org.organizationName, features: org.features });
      localStorage.setItem('activeOrgId', orgId);
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider value={{ user, activeOrganization, memberships, isLoading, login, logout, switchOrganization }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
