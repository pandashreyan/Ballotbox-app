
// For now, a mock. In a real app, this would use a real auth provider.
"use client"; 

import { useState, useEffect } from 'react';

export type UserRole = 'voter' | 'candidate' | 'admin' | null;

export interface AuthUser {
  id: string;
  name: string; // General display name or username
  role: UserRole;
  // Optional detailed fields, primarily for 'voter' role in mock
  fullName?: string;
  dob?: string;       // Expected format: YYYY-MM-DD
  email?: string;
  nationalId?: string;
  isEligible?: boolean;
  isVerified?: boolean;
}

const MOCK_USER_ROLE_STORAGE_KEY = 'ballotbox_mock_user_role';

export function useAuth() {
  const [role, setRole] = useState<UserRole>(null); 
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); 

  useEffect(() => {
    let determinedRole: UserRole = null;
    const storedRole = localStorage.getItem(MOCK_USER_ROLE_STORAGE_KEY) as UserRole;

    if (['admin', 'candidate', 'voter'].includes(storedRole)) {
      determinedRole = storedRole;
    } else if (storedRole === '' || storedRole === null) { 
      determinedRole = null; 
    } else {
      determinedRole = 'voter';
      localStorage.setItem(MOCK_USER_ROLE_STORAGE_KEY, 'voter'); 
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
      }
      setRole(newDeterminedRole);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); 

  let mockUser: AuthUser | null = null;

  if (!isLoadingAuth) { 
    if (role === 'admin') {
      mockUser = {
        id: 'mock-user-id-admin',
        name: 'Mock Admin User',
        fullName: 'Mock Admin User',
        role: 'admin',
        email: 'admin@example.com',
      };
    } else if (role === 'candidate') {
      mockUser = {
        id: 'mock-user-id-candidate',
        name: 'Mock Candidate User',
        fullName: 'Mock Candidate User',
        role: 'candidate',
        email: 'candidate@example.com',
      };
    } else if (role === 'voter') {
      mockUser = {
        id: 'mock-user-id-voter',
        name: 'Mock Voter User',
        fullName: 'Mock Voter User',
        role: 'voter',
        dob: "", // Default as per your spec
        email: "voter@example.com", // Mock email
        nationalId: "", // Default as per your spec
        isEligible: true, // Default as per your spec
        isVerified: true, // Default as per your spec
      };
    } else {
      // Role is null, so user is guest
      mockUser = null;
    }
  }
  
  if (typeof window !== 'undefined') {
    (window as any).setMockUserRole = (newRole: UserRole | null) => {
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
