import { useEffect, useState } from "react";
import Plot from "../components/Plot";

function EnergyForm() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h1>Energy Graph</h1>
            <div className='m-2 p-2'>
                <p>{now.toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                })}</p>
            </div>
            <Plot />
        </div>
    );
}

export default EnergyForm;