import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"
import { useContext } from "react";
import AuthContext from '@/context/AuthContext';

function Starting() {
    const [pageVisible, setPageVisible] = useState(false);
    const { login } = useContext(AuthContext);

    useEffect(() => {
        setPageVisible(true);
    }, []);

    return (
        <div className={`min-h-screen flex flex-col items-center pt-[25vh] ${pageVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-600`}>
            <h1 style={{ fontSize: '175px', fontFamily: "Jacques Francois" }}>Circa.</h1>
            <div className="mt-25"></div>
            <Link to="/home"><Button variant="starting" className="cursor-pointer bg-stone-600 w-50" onClick={login}>Get Started</Button></Link>
        </div>
    );
}

export default Starting;