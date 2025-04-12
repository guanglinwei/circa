import { addDoc, collection, getDocs, getFirestore, Timestamp } from "firebase/firestore";
import { app } from "../../firebase";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import AuthContext from "./AuthContext";
import { Point } from "../components/Plot";

// TODO: Database-related functions to have:
//  - for a given user, write energy graph
//      - (x, y) points
//      - date
//  - for a given user, read all previous writes
// Firebase structure
//  users/{user_id}/graphs/{graph_id}: list
//      - points: array<x, y> 
//      - created: timestamp
export interface GraphData {
    points: Point[];
    created: Timestamp;
}

const DataContext = createContext<{
    userData: GraphData[],
    loading: boolean,
    loadFirebaseUserData: (() => Promise<boolean>) | null,
    uploadEnergyGraph: ((points: Point[]) => Promise<boolean>) | null,
}>({ userData: [], loading: false, loadFirebaseUserData: null, uploadEnergyGraph: null });

export const DataProvider = ({ children, loadData = true }: { children: ReactNode, loadData: boolean }) => {
    const [userData, setUserData] = useState<GraphData[]>([]);
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
        if (!user) return new Promise(() => false);
        console.log('loading')
        setLoading(true);
        return getDocs(collection(db, 'users', user.uid, 'graphs'))
            .then((value) => {
                const data = value.docs.map(doc => doc.data() as GraphData);
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

    const uploadEnergyGraph: (points: Point[]) => Promise<boolean> = (points) => {
        if (!user) return new Promise(() => false);
        setLoading(true);
        console.log('up')
        return addDoc(collection(db, 'users', user?.uid, 'graphs'), {
            points: points,
            created: Timestamp.now()
        })
            .then(() => true)
            .catch((err) => {
                console.error(err);
                return false;
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <DataContext.Provider value={{ userData, loading, loadFirebaseUserData, uploadEnergyGraph }}>
            {children}
        </DataContext.Provider>
    )
};

export default DataContext;