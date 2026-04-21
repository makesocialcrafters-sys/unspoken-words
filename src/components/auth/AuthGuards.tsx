import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const AuthLoader = () => (
  <div className="min-h-screen bg-deep flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="h-1.5 w-32 overflow-hidden bg-cream/10">
        <div className="h-full w-1/3 bg-rose animate-[slide_1.2s_ease-in-out_infinite]" />
      </div>
      <p className="text-[0.65rem] tracking-[0.3em] uppercase text-cream/50">
        Einen Moment
      </p>
    </div>
    <style>{`@keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }`}</style>
  </div>
);

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return <AuthLoader />;
  if (!session) return <Navigate to="/signin" replace state={{ from: location }} />;
  return children;
};

export const RedirectIfAuthed = ({ children }: { children: JSX.Element }) => {
  const { session, loading } = useAuth();
  if (loading) return <AuthLoader />;
  if (session) return <Navigate to="/app" replace />;
  return children;
};
