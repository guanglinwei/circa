import { createContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { app } from '../../firebase';

const AuthContext = createContext<{
    user: User | null,
    login: () => void,
    logout: () => void,
}>({ user: null, login: () => {}, logout: () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        return onAuthStateChanged(auth, setUser);
    }, [auth]);

    const login = () => {
        signInWithPopup(auth, provider).then((user) => {
            console.log(user.user.email);
        }).catch((err) => {
            console.error(err);
        })
    };

    const logout = () => {
        signOut(auth).catch((err) => console.error(err));
    };

    return (
        <AuthContext value={{ user, login, logout }}>
            {children}
        </AuthContext>
    )
};

export default AuthContext;