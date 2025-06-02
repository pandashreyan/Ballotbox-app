
// For now, a mock. In a real app, this would use a real auth provider.
"use client"; 

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth';
import { app } from '@/lib/firebase';

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
const auth = getAuth(app);

// Setup the global function once.
if (typeof window !== 'undefined' && !(window as any)._setMockUserRoleInitialized) {
  (window as any).setMockUserRole = async (newRole: UserRole | null) => {
    if (newRole === null || ['admin', 'candidate', 'voter'].includes(newRole!)) {
      // If switching to a non-voter mock role or logging out, sign out any Firebase user.
      if (newRole === 'admin' || newRole === 'candidate' || newRole === null) {
        if (auth.currentUser) {
          try {
            await firebaseSignOut(auth);
            // Firebase sign-out will trigger onAuthStateChanged, which will then update the user state.
          } catch (error) {
            console.error("Error signing out Firebase user:", error);
          }
        }
      }
      // Set the mock role in localStorage. This will be used if no Firebase user is active.
      localStorage.setItem(MOCK_USER_ROLE_STORAGE_KEY, newRole || '');
      // Dispatch event for same-page updates.
      window.dispatchEvent(new Event('mockAuthRoleChanged'));
    } else {
      console.error("Invalid role. Use 'admin', 'candidate', 'voter', or null.");
    }
  };
  (window as any)._setMockUserRoleInitialized = true;
}


export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); 

  const updateUserFromMockRole = (mockRole: UserRole | null) => {
    if (mockRole === 'admin') {
      setUser({
        id: 'mock-user-id-admin',
        name: 'Mock Admin',
        role: 'admin',
        email: 'admin@example.com',
      });
    } else if (mockRole === 'candidate') {
      setUser({
        id: 'mock-user-id-candidate',
        name: 'Mock Candidate',
        role: 'candidate',
        email: 'candidate@example.com',
      });
    } else if (mockRole === 'voter') {
      // This is for a purely mock voter, not authenticated via Firebase
      setUser({
        id: 'mock-user-id-voter-fallback', // Use a distinct ID for purely mock voters
        name: 'Mock Voter (No Firebase)',
        role: 'voter',
        email: 'mockvoter@example.com', 
        isEligible: true, 
        isVerified: true, 
      });
    } else {
      setUser(null); // Guest
    }
  };

  useEffect(() => {
    setIsLoadingAuth(true);
    const unsubscribeAuthState = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      const mockRoleFromStorage = localStorage.getItem(MOCK_USER_ROLE_STORAGE_KEY) as UserRole;

      if (firebaseUser) {
        // Firebase user is logged in. They are treated as a 'voter'.
        // The mock role is ignored if it's 'voter' or null.
        // If mock role was 'admin' or 'candidate', setMockUserRole should have signed out Firebase.
         if (mockRoleFromStorage === 'admin' || mockRoleFromStorage === 'candidate') {
            // This state implies that setMockUserRole to admin/candidate was called
            // but onAuthStateChanged might be firing *after* that localStorage update
            // but *before* its own Firebase signout completed and re-triggered onAuthStateChanged.
            // So, if mock is admin/candidate, respect that and assume Firebase user is about to be null.
            updateUserFromMockRole(mockRoleFromStorage);
        } else {
             setUser({
                id: firebaseUser.uid,
                name: firebaseUser.email || firebaseUser.displayName || 'Voter',
                role: 'voter',
                email: firebaseUser.email || undefined,
                isEligible: true, 
                isVerified: true, 
            });
        }
      } else {
        // No Firebase user, rely on mock role from storage.
        updateUserFromMockRole(mockRoleFromStorage);
      }
      setIsLoadingAuth(false);
    });

    const handleMockAuthRoleChanged = () => { // For changes triggered by (window as any).setMockUserRole
        setIsLoadingAuth(true); // Briefly set loading during transition
        const currentFirebaseUser = auth.currentUser; // Re-check Firebase state
        const mockRoleFromStorage = localStorage.getItem(MOCK_USER_ROLE_STORAGE_KEY) as UserRole;

        if (currentFirebaseUser) {
            // If a Firebase user is still somehow active (e.g. signout didn't complete before this event)
            // AND the desired mock role is admin/candidate, this means we *want* the mock role.
            // (setMockUserRole already attempted Firebase signout for admin/candidate).
             if (mockRoleFromStorage === 'admin' || mockRoleFromStorage === 'candidate') {
                updateUserFromMockRole(mockRoleFromStorage);
            } else { // Otherwise, Firebase user implies 'voter'
                 setUser({
                    id: currentFirebaseUser.uid,
                    name: currentFirebaseUser.email || currentFirebaseUser.displayName || 'Voter',
                    role: 'voter',
                    email: currentFirebaseUser.email || undefined,
                    isEligible: true,
                    isVerified: true,
                });
            }
        } else {
            // No Firebase user, purely mock.
            updateUserFromMockRole(mockRoleFromStorage);
        }
        setIsLoadingAuth(false);
    };

    window.addEventListener('mockAuthRoleChanged', handleMockAuthRoleChanged);
    window.addEventListener('storage', (event) => { // For cross-tab changes
        if (event.key === MOCK_USER_ROLE_STORAGE_KEY) {
            handleMockAuthRoleChanged(); // Re-evaluate based on new storage value
        }
    });

    return () => {
      unsubscribeAuthState();
      window.removeEventListener('mockAuthRoleChanged', handleMockAuthRoleChanged);
      window.removeEventListener('storage', (event) => {
         if (event.key === MOCK_USER_ROLE_STORAGE_KEY) {
            handleMockAuthRoleChanged();
        }
      });
    };
  }, []); 
  
  return {
    user,
    isLoadingAuth: isLoadingAuth,
  };
}
