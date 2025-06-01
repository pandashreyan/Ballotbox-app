
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

// Setup the global function once.
if (typeof window !== 'undefined' && !(window as any)._setMockUserRoleInitialized) {
  (window as any).setMockUserRole = (newRole: UserRole | null) => {
    if (newRole === null || ['admin', 'candidate', 'voter'].includes(newRole)) {
      localStorage.setItem(MOCK_USER_ROLE_STORAGE_KEY, newRole || '');
      // Dispatch a custom event that useAuth can listen to for same-page updates,
      // as 'storage' event doesn't reliably fire for the originating page.
      window.dispatchEvent(new Event('mockAuthRoleChanged'));
    } else {
      console.error("Invalid role. Use 'admin', 'candidate', 'voter', or null.");
    }
  };
  (window as any)._setMockUserRoleInitialized = true;
}


export function useAuth() {
  const [role, setRole] = useState<UserRole>(null); 
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); 

  const updateRoleFromStorage = () => {
    const storedRole = localStorage.getItem(MOCK_USER_ROLE_STORAGE_KEY) as UserRole;
    let determinedRole: UserRole = null;

    if (['admin', 'candidate', 'voter'].includes(storedRole)) {
      determinedRole = storedRole;
    } else if (storedRole === '' || storedRole === null) { 
      determinedRole = null; 
    } else { // Any other string, or unexpected value
      determinedRole = 'voter'; // Default to voter
      localStorage.setItem(MOCK_USER_ROLE_STORAGE_KEY, 'voter'); // And fix it in storage
    }
    setRole(determinedRole);
  };


  useEffect(() => {
    updateRoleFromStorage(); // Initial load from localStorage
    setIsLoadingAuth(false);

    const handleStorageChange = () => { // For changes from other tabs/windows
      updateRoleFromStorage();
    };
    
    const handleMockAuthRoleChanged = () => { // For changes triggered by (window as any).setMockUserRole on the same page
        updateRoleFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('mockAuthRoleChanged', handleMockAuthRoleChanged);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('mockAuthRoleChanged', handleMockAuthRoleChanged);
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
        fullName: 'Mock Voter User', // Defaulting fullName to name for simplicity here
        role: 'voter',
        dob: "", 
        email: "voter@example.com", 
        nationalId: "", 
        isEligible: true, 
        isVerified: true, 
      };
    } else {
      // Role is null, so user is guest
      mockUser = null;
    }
  }
  
  return {
    user: mockUser,
    isLoadingAuth: isLoadingAuth,
  };
}
