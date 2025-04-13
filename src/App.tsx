// import { useState } from 'react'
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Results from "./pages/Results";
import EnergyForm from "./pages/EnergyForm";
import Starting from "./pages/Starting";
import Add from "./pages/Add";
import Header from "./components/Header";
import { Toaster } from "sonner";
// import { useContext } from 'react';
// import AuthContext from './context/AuthContext';
import { DataProvider } from "./context/DataContext";

import { useState } from "react";

import AccountDialog from "./components/AccountDialog";

function App() {
    // const [count, setCount] = useState(0)

    // const navigate = useNavigate();
    // const { user, login, logout } = useContext(AuthContext);
    // const location = useLocation();
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

// {/* <div className='w-100 grow'> {/* Header */}
//                 <div>
//                     <button onClick={() => console.log(user)}>Who am i</button>
//                     <button onClick={login}>Login</button>
//                     <button onClick={logout}>Logout</button>

//                 </div>

//                 <button onClick={() => navigate('/')}>Home</button>
//                 <button onClick={() => navigate('/results')}>Results</button>
//             </div> */}

export default App;
