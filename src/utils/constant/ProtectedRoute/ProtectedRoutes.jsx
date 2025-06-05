// components/ProtectedRoute.js
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../../firebase";

const ProtectedRoute = ({ children }) => {

     const auth = getAuth(app);

  const [user, setUser] = useState(undefined); // `undefined` initially to wait for auth

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  if (user === undefined) return null; // can show loading here

  return user ? children : <Navigate to="/Login" />;
};

export default ProtectedRoute;
