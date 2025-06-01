
// For now, a mock. In a real app, this would use a real auth provider.
"use client"; 

import { useState, useEffect } from 'react';

export type UserRole = 'voter' | 'candidate' | 'admin' | null;

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

const MOCK_USER_ROLE_STORAGE_KEY = 'ballotbox_mock_user_role';

export function useAuth() {
  const [role, setRole] = useState<UserRole>(null); // Initial state is null
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Start in loading state

  useEffect(() => {
    // This effect runs only on the client, after initial mount
    let determinedRole: UserRole = null;
    const storedRole = localStorage.getItem(MOCK_USER_ROLE_STORAGE_KEY) as UserRole;

    if (['admin', 'candidate', 'voter'].includes(storedRole)) {
      determinedRole = storedRole;
    } else if (storedRole === '' || storedRole === null) { // Handle empty or null as guest
      determinedRole = null; 
    } else {
      // If localStorage has an invalid value, or is not set, default to 'voter'
      // This default is applied client-side after the initial "loading" phase.
      determinedRole = 'voter';
      localStorage.setItem(MOCK_USER_ROLE_STORAGE_KEY, 'voter'); // Persist this default if not set
    }
    
    setRole(determinedRole);
    setIsLoadingAuth(false);

    const handleStorageChange = () => {
      let newDeterminedRole: UserRole = null;
      const newStoredRole = localStorage.getItem(MOCK_USER_ROLE_STORAGE_KEY) as UserRole;
      if (['admin', 'candidate', 'voter'].includes(newStoredRole)) {
        newDeterminedRole = newStoredRole;
      } else if (newStoredRole === '' || newStoredRole === null) {
        newDeterminedRole = null;
      } else {
        newDeterminedRole = 'voter'; 
        // Optionally update localStorage here if it was invalid
        // localStorage.setItem(MOCK_USER_ROLE_STORAGE_KEY, 'voter');
      }
      setRole(newDeterminedRole);
      // No need to setIsLoadingAuth again unless a full re-auth flow happens
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array ensures this runs once on mount (client-side)

  let mockUser: AuthUser | null = null;

  if (!isLoadingAuth) { // Only construct user if not loading
    if (role) {
      mockUser = {
        id: 'mock-user-id-' + role,
        name: role === 'admin' ? 'Mock Admin User' :
              role === 'candidate' ? 'Mock Candidate User' :
              'Mock Voter User', // Covers 'voter'
        role: role,
      };
    } else {
      // Role is null, so user is guest
      mockUser = null;
    }
  }
  // If isLoadingAuth is true, mockUser remains null (initial value)

  // Helper to simulate changing roles for testing (call from browser console)
  if (typeof window !== 'undefined') {
    (window as any).setMockUserRole = (newRole: UserRole | null) => {
      // The reload will cause useEffect to pick up the new value.
      // No need to directly call setRole or setIsLoadingAuth here.
      if (newRole === null || ['admin', 'candidate', 'voter'].includes(newRole)) {
        localStorage.setItem(MOCK_USER_ROLE_STORAGE_KEY, newRole || '');
        window.location.reload(); 
      } else {
        console.error("Invalid role. Use 'admin', 'candidate', 'voter', or null.");
      }
    };
  }

  return {
    user: mockUser,
    isLoadingAuth: isLoadingAuth,
  };
}
