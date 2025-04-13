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
import { useContext, useState } from "react"
import AuthContext from "@/context/AuthContext"
import DataContext from "@/context/DataContext"

const invoices = [
    {
        invoice: "INV001",
        paymentStatus: "Paid",
        totalAmount: "$250.00",
        paymentMethod: "Credit Card",
    },
    {
        invoice: "INV002",
        paymentStatus: "Pending",
        totalAmount: "$150.00",
        paymentMethod: "PayPal",
    },
    {
        invoice: "INV003",
        paymentStatus: "Unpaid",
        totalAmount: "$350.00",
        paymentMethod: "Bank Transfer",
    },
    {
        invoice: "INV004",
        paymentStatus: "Paid",
        totalAmount: "$450.00",
        paymentMethod: "Credit Card",
    },
    {
        invoice: "INV005",
        paymentStatus: "Paid",
        totalAmount: "$550.00",
        paymentMethod: "PayPal",
    },
    {
        invoice: "INV006",
        paymentStatus: "Pending",
        totalAmount: "$200.00",
        paymentMethod: "Bank Transfer",
    },
    {
        invoice: "INV007",
        paymentStatus: "Unpaid",
        totalAmount: "$300.00",
        paymentMethod: "Credit Card",
    },
]

function Account() {
    const { user, logout } = useContext(AuthContext);
    const { deleteAllGraphs } = useContext(DataContext);
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
                        <TableCaption>A list of your recent data.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Date</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead className="text-right">X</TableHead>
                                <TableHead className="text-right">Y</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow key={invoice.invoice}>
                                    <TableCell className="font-medium">{invoice.invoice}</TableCell>
                                    <TableCell>{invoice.paymentStatus}</TableCell>
                                    <TableCell>{invoice.paymentMethod}</TableCell>
                                    <TableCell className="text-right">{invoice.totalAmount}</TableCell>
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