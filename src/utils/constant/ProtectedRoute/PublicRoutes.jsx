// // components/PublicRoute.js
// import { Navigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { app } from "../../../firebase";

// const PublicRoute = ({ children }) => {
//   const auth = getAuth(app);
//   const [user, setUser] = useState(undefined);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser);
//     });

//     return () => unsubscribe();
//   }, []);

//   if (user === undefined) return null;

//   return user ? <Navigate to="/Dashboard" /> : children;
// };

// export default PublicRoute;
