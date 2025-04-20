import { createContext, useEffect, useState, ReactNode } from "react";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { app } from "../../firebase";

const AuthContext = createContext<{
  user: User | null;
  login: () => void;
  logout: () => void;
  loading: boolean; // ✅ Add this
  justSignedOut: boolean;
}>({
  user: null,
  login: () => {},
  logout: () => {},
  loading: true,
  justSignedOut: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // ✅ loading state added
  const [justSignedOut, setJustSignedOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser !== null) setJustSignedOut(false);
      setLoading(false); // ✅ auth has finished checking
      // if (firebaseUser === null) setJustSignedOut(true);
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
    signOut(auth)
      .then(() => setJustSignedOut(true))
      .catch((err) => console.error(err));
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, justSignedOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
