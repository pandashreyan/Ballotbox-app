
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


async function fetchUserProfile(uid: string) {
  try {
    const voterRes = await fetch(`/api/voters/${uid}`);
    if (voterRes.ok) {
      const data = await voterRes.json();
      return { role: 'voter' as UserRole, isEligible: data.isEligible === true, isVerified: data.isVerified === true };
    }
  } catch (err) {
    console.warn("Voter profile API fetch failed:", err);
  }

  try {
    const candidateRes = await fetch(`/api/candidates/${uid}`);
    if (candidateRes.ok) {
      const data = await candidateRes.json();
      return { role: 'candidate' as UserRole, isEligible: data.isApproved === true && data.isVerified === true, isVerified: data.isVerified === true };
    }
  } catch (err) {
    console.warn("Candidate profile API fetch failed:", err);
  }

  return null;
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
      });
    } else if (mockRole === 'voter') {
      setUser({
        id: 'mock-voter-id-fallback', 
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

            const mongoProfile = await fetchUserProfile(firebaseUser.uid);
            if (mongoProfile) {
                userRole = mongoProfile.role;
                isEligible = mongoProfile.isEligible;
                isVerified = mongoProfile.isVerified;
            } else {
                try {
                  // Fallback to Firestore
                  const voterDocRef = doc(db, "voters", firebaseUser.uid);
                  const voterDocSnap = await getDoc(voterDocRef);
                  if (voterDocSnap.exists()) {
                      const voterData = voterDocSnap.data();
                      isEligible = voterData.isEligible === true;
                      isVerified = voterData.isVerified === true;
                      userRole = 'voter'; 
                  } else {
                      const candidateDocRef = doc(db, "candidates", firebaseUser.uid);
                      const candidateDocSnap = await getDoc(candidateDocRef);
                      if (candidateDocSnap.exists()) {
                          userRole = 'candidate';
                      }
                  }
                } catch (fsErr) {
                  console.warn("Firestore fallback lookup failed:", fsErr);
                }
            }
            
            setUser({
                id: firebaseUser.uid,
                name: firebaseUser.email || firebaseUser.displayName || (userRole === 'voter' ? 'Voter' : 'Candidate'),
                role: userRole,
                email: firebaseUser.email || undefined,
                isEligible: isEligible,
                isVerified: isVerified,
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
                let userRole: UserRole = 'voter';
                let isEligible = false;
                let isVerified = false;

                const mongoProfile = await fetchUserProfile(currentFirebaseUser.uid);
                if (mongoProfile) {
                    userRole = mongoProfile.role;
                    isEligible = mongoProfile.isEligible;
                    isVerified = mongoProfile.isVerified;
                } else {
                    try {
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
                    } catch (fsErr) {
                      console.warn("Firestore fallback lookup failed:", fsErr);
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
