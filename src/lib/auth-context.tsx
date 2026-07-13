"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  signInWithPopup, 
  signOut as fbSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isApproved: boolean | null;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isApproved: null,
  signInWithGoogle: async () => {},
  signUpWithEmail: async () => {},
  signInWithEmail: async () => {},
  resetPassword: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Admin email is always approved
        if (
          currentUser.email === "admin@cashix.fun" ||
          currentUser.email === "mitheshhb0@gmail.com"
        ) {
          setIsApproved(true);
          setLoading(false);
        } else {
          const cleanEmail = currentUser.email?.toLowerCase() || "";
          let approved = false;

          // Helper function to fetch approval with a timeout to prevent hanging on blackholed connections
          const checkApprovalWithTimeout = async () => {
            const fetchPromise = (async () => {
              const emailDoc = await getDoc(
                doc(db, "approved_emails", cleanEmail)
              );
              const isApp = emailDoc.exists() && emailDoc.data()?.approved === true;
              if (typeof window !== "undefined") {
                localStorage.setItem(`cashix_approved_${cleanEmail}`, isApp ? "true" : "false");
              }
              return isApp;
            })();

            const timeoutPromise = new Promise<boolean>((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), 2500)
            );

            return Promise.race([fetchPromise, timeoutPromise]);
          };

          try {
            approved = await checkApprovalWithTimeout();
          } catch (error: any) {
            console.warn("Firestore approval check failed or timed out:", error);
            
            // Read cached approval state from localStorage
            if (typeof window !== "undefined") {
              const cachedApproval = localStorage.getItem(`cashix_approved_${cleanEmail}`);
              if (cachedApproval !== null) {
                approved = cachedApproval === "true";
                console.log(`Bypassing Firestore check using cached approval state: ${approved}`);
              }
            }
          }

          // If not approved, record user in users and pending_signups collections (non-blocking).
          // Since Firestore offline persistence is enabled, if offline/blocked, these writes
          // will be queued in local storage and synced automatically when back online.
          if (!approved) {
            // Register/update user profile in Firestore users directory (non-blocking)
            setDoc(doc(db, "users", cleanEmail), {
              email: cleanEmail,
              displayName: currentUser.displayName || cleanEmail.split("@")[0],
              joinedDate: new Date().toISOString().split("T")[0],
              status: "ACTIVE",
              role: "MEMBER"
            }, { merge: true }).catch((uErr) => {
              console.warn("Users directory write failed:", uErr);
            });

            // Register email in pending approvals queue (non-blocking)
            setDoc(doc(db, "pending_signups", cleanEmail), {
              email: cleanEmail,
              displayName: currentUser.displayName || cleanEmail.split("@")[0],
              requestedAt: new Date().toISOString()
            }).catch((pErr) => {
              console.warn("Pending queue registration failed:", pErr);
            });
          }

          setIsApproved(approved);
          setLoading(false);
        }
      } else {
        setIsApproved(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await fbSignOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
    setUser(null);
    setIsApproved(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isApproved,
      signInWithGoogle, 
      signUpWithEmail, 
      signInWithEmail, 
      resetPassword, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
