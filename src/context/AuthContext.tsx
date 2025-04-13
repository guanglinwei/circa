import { createContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '../../firebase';

const AuthContext = createContext<{
    user: User | null;
    login: () => void;
    logout: () => void;
    loading: boolean; // ✅ Add this
  }>({
    user: null,
    login: () => {},
    logout: () => {},
    loading: true,
  });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
  
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // ✅ loading state added
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false); // ✅ auth has finished checking
      });
  
      return () => unsubscribe();
    }, [auth]);
  
    const login = () => {
      signInWithPopup(auth, provider)
        .then((user) => {
          console.log(user.user.email);
        })
        .catch((err) => {
          console.error(err);
        });
    };
  
    const logout = () => {
      signOut(auth).catch((err) => console.error(err));
    };
  
    return (
      <AuthContext.Provider value={{ user, login, logout, loading }}>
        {children}
      </AuthContext.Provider>
    );
  };
  

export default AuthContext;