import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="mb-4 text-7xl font-display font-extrabold text-navy">404</h1>
        <p className="mb-8 text-xl text-slate-500 font-body">Oops! This page has vanished into thin air.</p>
        <a href="/" className="btn-gold px-8 py-3 rounded-xl font-body font-bold shadow-lg">
          Return to Excellence
        </a>
      </div>
    </div>
  );
};

export default NotFound;
