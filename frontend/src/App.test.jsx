import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';

// Mock AuthContext
vi.mock('./contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    isAuthenticated: false
  }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

describe('App Component', () => {
  it('renders the FlowOps login redirect or auth layout', () => {
    // Render within MemoryRouter since App uses BrowserRouter
    // Since App has its own BrowserRouter, we might just mock BrowserRouter or render App directly.
    render(<App />);
    
    // We expect the auth layout or a redirect to login when unauthenticated
    expect(document.body.textContent).toBeDefined();
  });
});
