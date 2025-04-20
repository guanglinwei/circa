import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Results from "./pages/Results";
import EnergyForm from "./pages/EnergyForm";
import Starting from "./pages/Starting";
import Add from "./pages/Add";
import Header from "./components/Header";
import { Toaster } from "sonner";
import { DataProvider } from "./context/DataContext";

import { useState } from "react";

import AccountDialog from "./components/AccountDialog";

function App() {
  const shouldLoadUserData = true; //location.pathname === '/results';
  const [showAccountDialog, setShowAccountDialog] = useState(false);

  return (
    <div className="min-h-screen w-full flex flex-col text-center items-center justify-center">
      <DataProvider loadData={shouldLoadUserData}>
        <Header onAvatarClick={() => setShowAccountDialog(true)} />
        <AccountDialog
          open={showAccountDialog}
          onOpenChange={setShowAccountDialog}
        />
        <Routes>
          <Route index element={<Starting />} />
          <Route path="add" element={<Add />} />
          <Route path="home" element={<EnergyForm />} />
          <Route path="results" element={<Results />} />
          <Route path="/*" element={<Navigate to="/" />} />
        </Routes>
        <Toaster richColors />
      </DataProvider>
    </div>
  );
}

export default App;
