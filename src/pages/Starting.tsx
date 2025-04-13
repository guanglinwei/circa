import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"


function Starting() {
    const [pageVisible, setPageVisible] = useState(false);
    useEffect(() => {
        setPageVisible(true);
    }, []);

    return (
        <div className={`min-h-screen flex flex-col items-center pt-[25vh] ${pageVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-600`}>
            <h1 style={{ fontSize: '200px', fontFamily: "Jacques Francois" }}>Circa.</h1>
            <div className="mt-25"></div>
            <Link to="/home"><Button variant="starting" className="cursor-pointer bg-stone-600 w-50">Get Started</Button></Link>
        </div>
    );
}

export default Starting;