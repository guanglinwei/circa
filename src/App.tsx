// import { useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css'
import Results from './pages/Results';
import EnergyForm from './pages/EnergyForm';
import Starting from './pages/Starting';
import Add from './pages/Add';
import { useContext } from 'react';
import AuthContext from './context/AuthContext';
import { DataProvider } from './context/DataContext';



function App() {
    // const [count, setCount] = useState(0)

    const navigate = useNavigate();
    const { user, login, logout } = useContext(AuthContext);
    const location = useLocation();
    const shouldLoadUserData = location.pathname === '/results';

    return (
        <div className='min-h-screen w-full flex flex-col text-center items-center justify-center'>
            
            <DataProvider loadData={shouldLoadUserData}>
                <Routes>
                    <Route index element={<Starting />} />
                    <Route path='add' element={<Add />} />
                    <Route path='home' element={<EnergyForm />} />
                    <Route path='results' element={<Results />} />
                    <Route path='/*' element={<Navigate to='/' />} />
                </Routes>
            </DataProvider>
        </div>
    )
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

export default App
