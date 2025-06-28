
// import { useEffect } from "react";
// import { Route, Routes } from "react-router";
// import { routes } from "./routes";
// import DashboardLayoutNavigationLinks from "./Layout/DashboardLayoutNaviagtionLinks";
// import { ToastContainer } from "react-toastify";
// import 'react-toastify/dist/ReactToastify.css';

// import { browserSessionPersistence, getAuth, setPersistence, signOut } from "firebase/auth";
// import { app } from "./firebase";

// const App = () => {
//   const auth = getAuth(app);
//   setPersistence(auth, browserSessionPersistence);


// useEffect(() => {
//   const auth = getAuth(app);
//   console.log("Current user on unload: ", auth.currentUser);

//   const handleTabClose = async () => {
//     const user = auth.currentUser;
//     if (!user) return;

//     const logoutTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
//     const date = new Date().toISOString().split("T")[0];
//     const docPath = `Attendance/${user.uid}_${date}`;
//     const projectId = app.options.projectId;

//     const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${docPath}?updateMask.fieldPaths=logoutTime&currentDocument.exists=true`;

//     const data = {
//       fields: {
//         logoutTime: { stringValue: logoutTime }
//       }
//     };

//     try {
//       const token = await user.getIdToken(); // get auth token
//       const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });

//       navigator.sendBeacon(`${url}&access_token=${token}`, blob);
//       console.log("Logout time sent:", logoutTime);
//     } catch (err) {
//       console.error("SendBeacon error:", err);
//     }
//   };

//   // Use `beforeunload` for more reliability
//   window.addEventListener("beforeunload", handleTabClose);
//   return () => window.removeEventListener("beforeunload", handleTabClose);
// }, []);
//   return (
//     <div>
//       <Routes>
//         {routes.map((item, index) => {
//           const routeElement = item.element;
//           const needsLayout = [
//             "/Dashboard", "/user/:userId", "/LeaveForm", , "/ratings/:userId",
//             "/AdminLeaveQueue", "/", "/MyAttendance", "/PaidHolidays","yourPerformance","/RulesAndRegulations","/Tickets","/HelpDesk"
//           ].includes(item.path);

//           return (
//             <Route
//               key={index}
//               path={item.path}
//               element={
//                 needsLayout ? (
//                   <DashboardLayoutNavigationLinks>
//                     {routeElement}
//                   </DashboardLayoutNavigationLinks>
//                 ) : (
//                   routeElement
//                 )
//               }
//             />
//           );
//         })}
//       </Routes>

//       <ToastContainer position="top-right" autoClose={3000} />
//     </div>
//   );
// };

// export default App;


import { useEffect } from "react";
import { Route, Routes } from "react-router";
import { routes } from "./routes";
import DashboardLayoutNavigationLinks from "./Layout/DashboardLayoutNaviagtionLinks";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import { getAuth } from "firebase/auth";
// import { app } from "./firebase";
import { doc, setDoc, getFirestore, getDoc, updateDoc } from "firebase/firestore";
import { app } from "./firebase";

const App = () => {
  const auth = getAuth(app);
  const db = getFirestore(app);

  // ✅ Save to localStorage on tab close
  useEffect(() => {
    const handleTabClose = () => {
      const user = auth.currentUser;
      if (!user) return;

      const username = user.displayName || user.email.split('@')[0];
      const todayDate = new Date().toISOString().slice(0, 10);
      const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });

      const logoutPayload = {
        username,
        todayDate,
        currentTime,
      };

      localStorage.setItem('pendingLogoutRecord', JSON.stringify(logoutPayload));
    };

    window.addEventListener("beforeunload", handleTabClose);
    return () => window.removeEventListener("beforeunload", handleTabClose);
  }, []);

  // ✅ On next load: Check localStorage and save logoutTime
  useEffect(() => {
    const logoutPayload = JSON.parse(localStorage.getItem('pendingLogoutRecord'));
    if (!logoutPayload) return;

    const { username, todayDate, currentTime } = logoutPayload;

    const saveLogout = async () => {
      const docRef = doc(db, 'allUsers', username, 'attendance', todayDate);
      const docSnap = await getDoc(docRef);

      try {
        if (docSnap.exists()) {
          await updateDoc(docRef, {
            logoutTime: currentTime,
          });
        } else {
          await setDoc(docRef, {
            date: todayDate,
            present: true,
            time: null,
            leave: false,
            logoutTime: currentTime,
            timestamp: serverTimestamp(),
          });
        }

        localStorage.removeItem('pendingLogoutRecord');
        console.log('✅ Logout time saved after tab close');
      } catch (err) {
        console.error("❌ Error saving logout time:", err);
      }
    };

    saveLogout();
  }, []);

  return (
     <div>
      <Routes>
        {routes.map((item, index) => {
          const routeElement = item.element;
          const needsLayout = [
            "/Dashboard", "/user/:userId", "/LeaveForm", , "/ratings/:userId",
            "/AdminLeaveQueue", "/", "/MyAttendance", "/PaidHolidays","yourPerformance","/RulesAndRegulations","/Tickets","/HelpDesk"
          ].includes(item.path);

          return (
            <Route
              key={index}
              path={item.path}
              element={
                needsLayout ? (
                  <DashboardLayoutNavigationLinks>
                    {routeElement}
                  </DashboardLayoutNavigationLinks>
                ) : (
                  routeElement
                )
              }
            />
          );
        })}
      </Routes>

       <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default App;



// AdminLeaveQueue
// dashboard
// dashboardlayoutnavigation