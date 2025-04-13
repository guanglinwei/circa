import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Link } from "react-router-dom"

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useContext, useEffect, useState } from "react"
import AuthContext from "@/context/AuthContext"
import DataContext from "@/context/DataContext"
import { Timestamp } from "firebase/firestore"

function Account() {
    const { user, logout } = useContext(AuthContext);
    const { deleteAllGraphs, userData, loadFirebaseUserData } = useContext(DataContext);
    const [deleting, setDeleting] = useState(false);
    const [deleteButtonUsable, setDeleteButtonUsable] = useState(true);

    const initiateGraphDeletion = () => {
        if (!deleting) {
            setDeleting(true);
        }
        else {
            if (!deleteButtonUsable) return;
            setDeleteButtonUsable(false);
            deleteAllGraphs?.().finally(() => { setDeleting(false); setDeleteButtonUsable(true) });
        }
    };

    useEffect(() => {
        loadFirebaseUserData?.();
    }, []);

    const timestampToTime = (ts: Timestamp) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        const date = ts.toDate();
        return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const timestampToDate = (ts: Timestamp) => {
        const pad = (n: number) => String(n).padStart(2, '0');
        const date = ts.toDate();
        return `${date.getFullYear()}/${pad(date.getMonth()+1)}/${date.getDate()}`;
    };

    return (
        <div>
            <Tabs defaultValue="account" className="w-[400px]">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="data">Data</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account</CardTitle>
                            <CardDescription>
                                Make changes to your account here.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="space-y-1 flex items-center">
                                {user?.photoURL ? (
                                    <img className="rounded-full border-foreground border-2" src={user?.photoURL}
                                        height={80} width={80}
                                        referrerPolicy="no-referrer" />
                                ) : (
                                    <img src='/circa/profile.svg' height={80} width={80} />
                                )}

                                <div className="flex flex-col align-middle text-center">
                                    <div className="align-middle">{user?.displayName}</div>
                                </div>

                            </div>
                            <div className="space-y-1">
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center w-full">
                            <Link to="/"><Button variant="outline">Back</Button></Link>
                            <Button variant="destructive" onClick={initiateGraphDeletion}>{deleting ? 'Click again to confirm' : 'Delete Data'}</Button>
                            <Button className="" onClick={logout}>Sign Out</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="data">
                    <Table>
                        <TableCaption>A list of your recent energy levels.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-40">Date <span className="text-gray-500 font-normal text-xs"> YYYY/MM/DD</span></TableHead>
                                <TableHead className="text-left">Time</TableHead>
                                <TableHead className="text-right">Daily Average</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userData.map(({ points, created }, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium text-left">{timestampToDate(created)}</TableCell>
                                    <TableCell className="text-left">{timestampToTime(created)}</TableCell>
                                    <TableCell className="text-right">{(points.reduce((sum, point) => sum + point.y, 0) / points.length).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>

                        </TableFooter>

                    </Table>

                </TabsContent>
            </Tabs>
        </div>
    );
}

export default Account;