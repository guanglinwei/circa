import { collection, DocumentData, getDocs, getFirestore } from "firebase/firestore";
import { app } from "../../firebase";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import AuthContext from "./AuthContext";

// TODO: Database-related functions to have:
//  - for a given user, write energy graph
//      - (x, y) points
//      - date
//  - for a given user, read all previous writes
// Firebase structure
//  users/{user_id}/graphs/{graph_id}: list
//      - points: array<string: "{x}_{y}"> 
//      - timestamp: timestamp

const DataContext = createContext<{
    userData: DocumentData[],
    loading: boolean,
    loadFirebaseUserData: () => Promise<boolean> | null,
    uploadFirebaseUserData: () => Promise<boolean> | null,
}>({ userData: [], loading: false, loadFirebaseUserData: () => null, uploadFirebaseUserData: () => null });

export const DataProvider = ({ children, loadData = true }: { children: ReactNode, loadData: boolean }) => {
    const [userData, setUserData] = useState<DocumentData[]>([]);
    const [loading, setLoading] = useState(false);
    const db = getFirestore(app);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!loadData) return;
        if (!user) {
            setUserData([]);
            setLoading(false);
            return;
        }

        loadFirebaseUserData();
    }, [user, loadData]);

    // Loads the user data into userData and returns a promise of whether or not successful
    const loadFirebaseUserData: () => Promise<boolean> = () => {
        console.log('loading')
        setLoading(true);
        return getDocs(collection(db, 'users'))
            .then((value) => {
                const data = value.docs.map(doc => doc.data());
                console.log(data);
                setUserData(data);
                return true;
            })
            .catch((err) => {
                console.log(err);
                return false;
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const uploadFirebaseUserData: () => Promise<boolean> = () => {
        // ...
        return new Promise(() => false);
    };

    return (
        <DataContext.Provider value={{ userData, loading, loadFirebaseUserData, uploadFirebaseUserData }}>
            {children}
        </DataContext.Provider>
    )
};

export default DataContext;