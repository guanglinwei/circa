import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Link, useNavigate } from "react-router-dom";

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
import { useContext, useState } from "react";
import AuthContext from "@/context/AuthContext";
import DataContext from "@/context/DataContext";

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
];

function Account() {
  const { user, logout } = useContext(AuthContext);
  const { deleteAllGraphs } = useContext(DataContext);
  const [deleting, setDeleting] = useState(false);
  const [deleteButtonUsable, setDeleteButtonUsable] = useState(true);
  const navigate = useNavigate();

  const initiateGraphDeletion = () => {
    if (!deleting) {
      setDeleting(true);
    } else {
      if (!deleteButtonUsable) return;
      setDeleteButtonUsable(false);
      deleteAllGraphs?.().finally(() => {
        setDeleting(false);
        setDeleteButtonUsable(true);
      });
    }
  };
  const handleLogout = async () => {
    try {
      await logout(); // Sign out
      navigate("/"); // Redirect to starting page
    } catch (error) {
      console.error("Logout failed:", error);
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
            <CardContent className="flex flex-col items-center mt-2">
              <div className="flex flex-row space-x-4 items-center w-full">
                <Avatar>
                  <AvatarImage src={user?.photoURL} alt="userimg" />
                  <AvatarFallback>None :(</AvatarFallback>
                </Avatar>

                <div>{user?.displayName}</div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center w-full mt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Data</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently remove
                      your data from our servers and reset your cycle.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive hover:bg-destructive/90"
                      onClick={initiateGraphDeletion}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button className="" onClick={handleLogout}>
                Sign Out
              </Button>
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
                  <TableCell className="font-medium">
                    {invoice.invoice}
                  </TableCell>
                  <TableCell>{invoice.paymentStatus}</TableCell>
                  <TableCell>{invoice.paymentMethod}</TableCell>
                  <TableCell className="text-right">
                    {invoice.totalAmount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter></TableFooter>
          </Table>
        </TabsContent>
        <Link to="/">
        <Button variant="outline" className="mt-5 w-full">Back</Button>
      </Link>
      </Tabs>
      
    </div>
  );
}

export default Account;
