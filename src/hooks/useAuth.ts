
"use client"; 

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, signOut as firebaseSignOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, getFirestore } from "firebase/firestore"; // Added getDoc, getFirestore
import { app, db } from '@/lib/firebase'; // db should be exported from firebase

export type UserRole = 'voter' | 'candidate' | 'admin' | null;

export interface AuthUser {
  id: string;
  name: string; 
  role: UserRole;
  email?: string;
  // Voter specific flags from Firestore
  isEligible?: boolean; 
  isVerified?: boolean;
  // Candidate specific flags (can be expanded from Firestore if candidate details stored there)
  // isCandidateApproved?: boolean; 
}

const MOCK_USER_ROLE_STORAGE_KEY = 'ballotbox_mock_user_role';
const firebaseAuth = getAuth(app); // Renamed to avoid conflict

// Setup the global function once.
if (typeof window !== 'undefined' && !(window as any)._setMockUserRoleInitialized) {
  (window as any).setMockUserRole = async (newRole: UserRole | null) => {
    if (newRole === null || ['admin', 'candidate', 'voter'].includes(newRole!)) {
      if (newRole === 'admin' || newRole === 'candidate' || newRole === null) {
        if (firebaseAuth.currentUser) {
          try {
            await firebaseSignOut(firebaseAuth);
          } catch (error) {
            console.error("Error signing out Firebase user:", error);
          }
        }
      }
      localStorage.setItem(MOCK_USER_ROLE_STORAGE_KEY, newRole || '');
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
        id: 'mock-admin-id',
        name: 'Mock Admin',
        role: 'admin',
        email: 'admin@example.com',
      });
    } else if (mockRole === 'candidate') {
      setUser({
        id: 'mock-candidate-id',
        name: 'Mock Candidate',
        role: 'candidate',
        email: 'candidate@example.com',
        // isCandidateApproved: true, // Example if managing this locally
      });
    } else if (mockRole === 'voter') {
      setUser({
        id: 'mock-voter-id-fallback', 
        name: 'Mock Voter (No Firebase)',
        role: 'voter',
        email: 'mockvoter@example.com', 
        isEligible: true, // For pure mock voter, assume eligible & verified
        isVerified: true, 
      });
    } else {
      setUser(null); // Guest
    }
  };

  useEffect(() => {
    setIsLoadingAuth(true);
    const unsubscribeAuthState = onAuthStateChanged(firebaseAuth, async (firebaseUser: FirebaseUser | null) => {
      const mockRoleFromStorage = localStorage.getItem(MOCK_USER_ROLE_STORAGE_KEY) as UserRole;

      if (firebaseUser) {
        if (mockRoleFromStorage === 'admin' || mockRoleFromStorage === 'candidate') {
            updateUserFromMockRole(mockRoleFromStorage);
        } else {
            // Firebase user is logged in, attempt to fetch their voter/candidate specific data
            let userRole: UserRole = 'voter'; // Default to voter if firebase user
            let isEligible = false;
            let isVerified = false;
            // let isCandidateApproved = false;

            // Check if user is in 'voters' collection
            const voterDocRef = doc(db, "voters", firebaseUser.uid);
            const voterDocSnap = await getDoc(voterDocRef);
            if (voterDocSnap.exists()) {
                const voterData = voterDocSnap.data();
                isEligible = voterData.isEligible === true;
                isVerified = voterData.isVerified === true;
                userRole = 'voter'; 
            } else {
                // Check if user is in 'candidates' collection (if they logged in via candidate flow)
                const candidateDocRef = doc(db, "candidates", firebaseUser.uid);
                const candidateDocSnap = await getDoc(candidateDocRef);
                if (candidateDocSnap.exists()) {
                    // const candidateData = candidateDocSnap.data();
                    // isCandidateApproved = candidateData.isApproved === true; 
                    userRole = 'candidate';
                    // For candidates, eligibility/verification might be tied to their approval
                    // isEligible = isCandidateApproved; 
                    // isVerified = isCandidateApproved;
                }
            }
            
            setUser({
                id: firebaseUser.uid,
                name: firebaseUser.email || firebaseUser.displayName || (userRole === 'voter' ? 'Voter' : 'Candidate'),
                role: userRole,
                email: firebaseUser.email || undefined,
                isEligible: isEligible,
                isVerified: isVerified,
                // isCandidateApproved: isCandidateApproved,
            });
        }
      } else {
        // No Firebase user, rely on mock role from storage.
        updateUserFromMockRole(mockRoleFromStorage);
      }
      setIsLoadingAuth(false);
    });

    const handleMockAuthRoleChanged = async () => { 
        setIsLoadingAuth(true); 
        const currentFirebaseUser = firebaseAuth.currentUser; 
        const mockRoleFromStorage = localStorage.getItem(MOCK_USER_ROLE_STORAGE_KEY) as UserRole;

        if (currentFirebaseUser) {
             if (mockRoleFromStorage === 'admin' || mockRoleFromStorage === 'candidate') {
                updateUserFromMockRole(mockRoleFromStorage);
            } else { 
                // Existing Firebase user implies 'voter' or 'candidate' based on Firestore
                let userRole: UserRole = 'voter';
                let isEligible = false;
                let isVerified = false;

                const voterDocRef = doc(db, "voters", currentFirebaseUser.uid);
                const voterDocSnap = await getDoc(voterDocRef);
                 if (voterDocSnap.exists()) {
                    const voterData = voterDocSnap.data();
                    isEligible = voterData.isEligible === true;
                    isVerified = voterData.isVerified === true;
                    userRole = 'voter';
                } else {
                    const candidateDocRef = doc(db, "candidates", currentFirebaseUser.uid);
                    const candidateDocSnap = await getDoc(candidateDocRef);
                    if (candidateDocSnap.exists()) {
                        userRole = 'candidate';
                    }
                }
                 setUser({
                    id: currentFirebaseUser.uid,
                    name: currentFirebaseUser.email || currentFirebaseUser.displayName || (userRole === 'voter' ? 'Voter' : 'Candidate'),
                    role: userRole,
                    email: currentFirebaseUser.email || undefined,
                    isEligible,
                    isVerified,
                });
            }
        } else {
            updateUserFromMockRole(mockRoleFromStorage);
        }
        setIsLoadingAuth(false);
    };

    window.addEventListener('mockAuthRoleChanged', handleMockAuthRoleChanged);
    window.addEventListener('storage', (event) => { 
        if (event.key === MOCK_USER_ROLE_STORAGE_KEY) {
            handleMockAuthRoleChanged(); 
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
