import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"


function Starting() {
    return (
        <div className="min-h-screen flex flex-col items-center pt-[25vh]">
    <h1 style={{ fontSize: '200px', fontFamily: "Jacques Francois" }}>Circa.</h1>
    <div className="mt-25"></div>
    <Link to="/home"><Button variant="starting" className="cursor-pointer bg-stone-600 w-50">Get Started</Button></Link>
  </div>
    );
}

export default Starting;