import { addDoc, collection, doc, getDocs, getFirestore, query, setDoc, Timestamp, where } from "firebase/firestore";
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
    uploadEnergyGraph: ((points: Point[], currDate: Date, replace?: boolean, alwaysAddNew?: boolean) => Promise<boolean>) | null,
    getGraphForDate: ((date: Date) => Promise<GraphData | null>) | null
}>({ userData: [], loading: false, loadFirebaseUserData: null, uploadEnergyGraph: null, getGraphForDate: null });

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

    const getGraphForDate = async (date: Date): Promise<GraphData | null> => {
        if (!user) return new Promise(() => false);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const ref = collection(db, 'users', user?.uid, 'graphs');
        const q = query(
            ref,
            where('created', '>=', Timestamp.fromDate(startOfDay)),
            where('created', '<=', Timestamp.fromDate(endOfDay)),
        );

        setLoading(true);
        try {
            console.log('Check if entry in this day exists')
            const querySnap = await getDocs(q);
            if (querySnap.empty) {
                return null;
            }
            else {
                const existingDoc = querySnap.docs[0];
                return existingDoc.data() as GraphData;
            }
        }
        catch (err) {
            console.error(err);
            return null;
        }
        finally {
            setLoading(false);
        }
    };

    const uploadEnergyGraph: (points: Point[], currDate: Date, replace?: boolean, alwaysAddNew?: boolean) => Promise<boolean> =
        async (points, currDate, replace = true, alwaysAddNew = false) => {
            if (!user) return new Promise(() => false);

            const startOfDay = new Date(currDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(currDate);
            endOfDay.setHours(23, 59, 59, 999);

            const ref = collection(db, 'users', user?.uid, 'graphs');
            const q = query(
                ref,
                where('created', '>=', Timestamp.fromDate(startOfDay)),
                where('created', '<=', Timestamp.fromDate(endOfDay)),
            );

            setLoading(true);
            try {
                // console.log('Check if entry in this day exists')
                const querySnap = await getDocs(q);
                if (alwaysAddNew || querySnap.empty) {
                    await addDoc(ref, {
                        points: points,
                        created: Timestamp.fromDate(currDate)
                    });
                    return true;
                }
                else if (replace) {
                    const existingDoc = querySnap.docs[0];
                    const ref = doc(db, 'users', user?.uid, 'graphs', existingDoc.id);
                    await setDoc(ref, {
                        points: points,
                        created: Timestamp.fromDate(currDate)
                    });

                    return true;
                }

                return false;
            }
            catch (err) {
                console.error(err);
                return false
            }
            finally {
                loadFirebaseUserData().then(() => setLoading(false));
                // setLoading(false);
            }
        };

    return (
        <DataContext.Provider value={{ userData, loading, loadFirebaseUserData, uploadEnergyGraph, getGraphForDate }}>
            {children}
        </DataContext.Provider>
    )
};

export default DataContext;