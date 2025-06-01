// For now, a mock. In a real app, this would use a real auth provider.
"use client"; // Hooks that might use state or client-side logic are client components

import { useState, useEffect } from 'react';

export type UserRole = 'voter' | 'candidate' | 'admin' | null;

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

// SIMULATED LOGGED-IN USER
// To test different roles, change this value in your browser's localStorage
// under the key 'ballotbox_mock_user_role' and refresh the page.
// Valid values: "admin", "candidate", "voter", or leave empty/null for unauthenticated.

const MOCK_USER_ROLE_STORAGE_KEY = 'ballotbox_mock_user_role';

const getInitialMockRole = (): UserRole => {
  if (typeof window !== 'undefined') {
    const storedRole = localStorage.getItem(MOCK_USER_ROLE_STORAGE_KEY) as UserRole;
    if (['admin', 'candidate', 'voter'].includes(storedRole)) {
      return storedRole;
    }
  }
  return 'voter'; // Default role if nothing is set or invalid
};

export function useAuth() {
  const [role, setRole] = useState<UserRole>(getInitialMockRole());

  useEffect(() => {
    // This effect allows the role to be somewhat dynamic for testing
    // without full auth. You can change it in localStorage.
    const handleStorageChange = () => {
      setRole(getInitialMockRole());
    };

    window.addEventListener('storage', handleStorageChange);
    // Set initial role on mount
    setRole(getInitialMockRole());


    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  let mockUser: AuthUser | null = null;

  if (role) {
    mockUser = {
      id: 'mock-user-id-' + role,
      name: role === 'candidate' ? 'Mock Candidate User' : role === 'admin' ? 'Mock Admin User' : 'Mock Voter User',
      role: role,
    };
  }

  // Helper to simulate changing roles for testing (call from browser console)
  if (typeof window !== 'undefined') {
    (window as any).setMockUserRole = (newRole: UserRole) => {
      if (newRole === null || ['admin', 'candidate', 'voter'].includes(newRole)) {
        localStorage.setItem(MOCK_USER_ROLE_STORAGE_KEY, newRole || '');
        setRole(newRole); // Update state immediately
        window.location.reload(); // Refresh to see changes globally
      } else {
        console.error("Invalid role. Use 'admin', 'candidate', 'voter', or null.");
      }
    };
  }

  return {
    user: mockUser,
    // In a real app, you'd also have login, logout, isLoading state, etc.
  };
}
