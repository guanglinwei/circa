import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthContext from "@/context/AuthContext";

function Starting() {
  const [pageVisible, setPageVisible] = useState(false);
  const { user, login, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // If user is logged in and auth state has finished loading, redirect
  useEffect(() => {
    if (!user) setPageVisible(true);
    if (!loading && user) {
        setPageVisible(false);
        setTimeout(() => {
            navigate("/home");
            setPageVisible(true);
        }, 500)
    }
  }, [user, loading, navigate]);

  // Handle fade-in animation
  useEffect(() => {
    setPageVisible(true);
  }, []);

  useEffect(() => {
    // console.log(location.pathname)
    // setPageVisible(location.pathname === '/');
  }, [location]);

  // Show loading spinner while Firebase is checking
  if (loading || !pageVisible) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center pt-[25vh] ${
        pageVisible ? "opacity-100" : "opacity-0"
      } transition-opacity duration-600`}
    >
      <h1 style={{ fontSize: "144px", fontFamily: "Jacques Francois" }}>
        Circa.
      </h1>
      <div className="mt-25"></div>
      <Button
        variant="starting"
        className="cursor-pointer bg-stone-600 w-50"
        onClick={login}
      >
        Get Started
      </Button>
    </div>
  );
}

export default Starting;
