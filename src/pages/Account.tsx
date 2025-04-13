"use client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useNavigate } from "react-router-dom";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useContext, useEffect } from "react";
import AuthContext from "@/context/AuthContext";
import DataContext from "@/context/DataContext";
import { Timestamp } from "firebase/firestore";

function Account({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { user, logout } = useContext(AuthContext);
    const { deleteAllGraphs, userData, loadFirebaseUserData } = useContext(DataContext);
    // const [deleting, setDeleting] = useState(false);
    // const [deleteButtonUsable, setDeleteButtonUsable] = useState(true);

    const navigate = useNavigate();

    // const initiateGraphDeletion = () => {
    //     if (!deleting) {
    //         setDeleting(true);
    //     } else {
    //         if (!deleteButtonUsable) return;
    //         setDeleteButtonUsable(false);
    //         deleteAllGraphs?.().finally(() => {
    //             setDeleting(false);
    //             setDeleteButtonUsable(true);
    //         });
    //     }
    // };
    const handleLogout = async () => {
        try {
            await logout(); // Sign out
            navigate("/"); // Redirect to starting page
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };
    const handleLogoutWithToast = () => {
        toast("Successfully Signed Out!", {
            description: "See you soon 👋",
            className: "text-left",
        });

        handleLogout(); // your original logout function
    };

    useEffect(() => {
        console.log(open)
        if (open) {
            // console.log(user)
            // console.log(userData)
            loadFirebaseUserData?.();
        }
    }, [open]);

    // useEffect(() => {
    //     console.log(userData);
    // }, [userData])

    const timestampToTime = (ts: Timestamp) => {
        const pad = (n: number) => String(n).padStart(2, "0");
        const date = ts.toDate();
        return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const timestampToDate = (ts: Timestamp) => {
        const pad = (n: number) => String(n).padStart(2, "0");
        const date = ts.toDate();
        return `${date.getFullYear()}/${pad(
            date.getMonth() + 1
        )}/${date.getDate()}`;
    };

    return (
        <div>
            <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="account" className="cursor-pointer">Account</TabsTrigger>
                    <TabsTrigger value="data" className="cursor-pointer">Data</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account</CardTitle>
                            <CardDescription>
                                Make changes to your account here.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center mt-2">
                            <div className="flex flex-row space-x-4 items-center w-full">
                                <Avatar>
                                    <AvatarImage
                                        src={user?.photoURL || undefined}
                                        alt="userimg"
                                    />
                                    <AvatarFallback>
                                        <img src="/circa/profile.svg" height={40} width={40} />
                                    </AvatarFallback>
                                </Avatar>

                                <div>{user?.displayName}</div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between items-center w-full mt-4">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="cursor-pointer">Delete Data</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Are you absolutely sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently remove
                                            your data from our server and reset your cycle.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="cursor-pointer bg-destructive hover:bg-destructive/90"
                                            onClick={() => deleteAllGraphs?.()}
                                        >
                                            Continue
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button className="cursor-pointer" onClick={handleLogoutWithToast}>
                                Sign Out
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
                <TabsContent value="data">
                    <Table>
                        <TableCaption>A list of your recent energy levels.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-40">Date</TableHead>
                                <TableHead className="text-left">Time</TableHead>
                                <TableHead className="text-right">Daily Average</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {userData.map(({ points, created }, i) =>
                                i < 10 ? (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium text-left">
                                            {timestampToDate(created)}
                                        </TableCell>
                                        <TableCell className="text-left">
                                            {timestampToTime(created)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {(
                                                points.reduce((sum, point) => sum + point.y, 0) /
                                                points.length
                                            ).toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <></>
                                )
                            )}
                        </TableBody>
                        <TableFooter></TableFooter>
                    </Table>
                </TabsContent>

                <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full cursor-pointer mt-1"
                >
                    Back
                </Button>
            </Tabs>
        </div>

    );
}

export default Account;
