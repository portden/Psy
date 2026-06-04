import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User,
  AuthProvider as FirebaseAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUserToFirestore = async (firebaseUser: User) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // New user
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
    } else {
      // Existing user, update last login
      await setDoc(userRef, {
        lastLogin: serverTimestamp(),
      }, { merge: true });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await syncUserToFirestore(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithProvider = async (provider: FirebaseAuthProvider) => {
    console.log('Login attempt started with provider:', provider);
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Login successful:', result.user.email);
    } catch (error: any) {
      console.error('Firebase Login Error Full Object:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        console.warn('User closed the login popup.');
        return;
      }
      
      const errorDetail = error.message || 'Unknown error';
      const errorCode = error.code || 'no-code';
      
      // Attempt to show error to user via standard alert as fallback
      alert(`AUTH ERROR [${errorCode}]: ${errorDetail}`);
      
      if (errorCode === 'auth/unauthorized-domain') {
        console.error(`HELP: Domain "${window.location.hostname}" is NOT authorized. Add it to Firebase Console > Auth > Settings > Authorized Domains.`);
      }
      
      throw error;
    }
  };

  const loginWithGoogle = () => loginWithProvider(googleProvider);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
