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
//  const handleTabClose = () => {
//     const auth = getAuth();
//     const user = auth.currentUser;
//     if (!user) return;

//     const logoutTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
//     const date = new Date().toISOString().split("T")[0];
//     const docPath = `Attendance/${user.uid}_${date}`;
//     const projectId = app.options.projectId;

//     // 👇 Move async code to a separate function
//     user.getIdToken().then((token) => {
//       const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${docPath}?updateMask.fieldPaths=logoutTime&currentDocument.exists=true&access_token=${token}`;

//       const data = {
//         fields: {
//           logoutTime: { stringValue: logoutTime },
//         },
//       };

//       const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });

//       navigator.sendBeacon(url, blob);
//     }).catch((error) => {
//       console.error("❌ Failed to get token for sendBeacon logout:", error);
//     });
//   };

//   window.addEventListener("unload", handleTabClose);

//   return () => {
//     window.removeEventListener("unload", handleTabClose);
//   };
// }, []);

//   return (
//     <div>
//       <Routes>
//         {routes.map((item, index) => {
//           const routeElement = item.element;
//           const needsLayout = [
//             "/Dashboard", "/user/:userId", "/LeaveForm", "/ratings/:userId",
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

import { getAuth, signOut } from "firebase/auth";
// import { app } from "./firebase";
import { doc, setDoc, getFirestore, getDoc, updateDoc } from "firebase/firestore";
import { app } from "./firebase";

const App = () => {
  const auth = getAuth(app);
  const db = getFirestore(app);




// useEffect(() => {
//   const handleTabClose = () => {
//     const auth = getAuth();
//     const user = auth.currentUser;
//     if (!user) return;

//     const username = user.displayName || user.email.split('@')[0];
//     const todayDate = new Date().toISOString().slice(0, 10);
//     const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });

//     const logoutPayload = {
//       username,
//       todayDate,
//       currentTime,
//     };

//     // 1️⃣ Save to localStorage for recovery
//     localStorage.setItem('pendingLogoutRecord', JSON.stringify(logoutPayload));

//     // 2️⃣ Send to backend instantly using Beacon
//     navigator.sendBeacon(
//       'https://your-backend.com/log-out-tracker', // 🟡 replace with your API
//       new Blob([JSON.stringify(logoutPayload)], { type: 'application/json' })
//     );

//     // 3️⃣ Try local signout quickly
//     auth.signOut().catch(() => {
//       // Silent fail
//     });
//   };

//   window.addEventListener('visibilitychange', () => {
//     if (document.visibilityState === 'hidden') {
//       handleTabClose();
//     }
//   });

//   window.addEventListener("beforeunload", handleTabClose);
//   return () => {
//     window.removeEventListener("beforeunload", handleTabClose);
//     window.removeEventListener("visibilitychange", handleTabClose);
//   };
// }, []);


//   // 2️⃣ On App Open: Check localStorage and force logout
//   useEffect(() => {
//   const logoutPayload = JSON.parse(localStorage.getItem('pendingLogoutRecord'));
//   if (!logoutPayload) return;

//   const { username, todayDate, currentTime } = logoutPayload;

//   const saveLogout = async () => {
//     const auth = getAuth();
//     const today = new Date().toISOString().slice(0, 10);
//     const isNextDay = today !== todayDate;

//     const shouldBackdate = currentTime < '07:00:00' && !isNextDay;
//     const finalLogoutDate = shouldBackdate
//       ? new Date(new Date(todayDate).getTime() - 86400000).toISOString().slice(0, 10)
//       : todayDate;

//     const docRef = doc(db, 'allUsers', username, 'attendance', finalLogoutDate);
//     const docSnap = await getDoc(docRef);

//     try {
//       if (docSnap.exists()) {
//         await updateDoc(docRef, { logoutTime: currentTime });
//       } else {
//         await setDoc(docRef, {
//           date: finalLogoutDate,
//           present: true,
//           time: null,
//           leave: false,
//           logoutTime: currentTime,
//           timestamp: serverTimestamp(),
//         });
//       }

//       await signOut(auth);
//       localStorage.removeItem('pendingLogoutRecord');
//       console.log("✅ Recovered and signed out on app open");
//     } catch (err) {
//       console.error("❌ Recovery logout failed", err);
//     }
//   };

//   saveLogout();
// }, []);




useEffect(() => {
  const handleTabClose = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const username = user.displayName || user.email.split('@')[0];
    const todayDate = new Date().toISOString().slice(0, 10);
    const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });

    // Just store this for backup (optional)
    const logoutPayload = {
      username,
      todayDate,
      currentTime,
    };
    localStorage.setItem('pendingLogoutRecord', JSON.stringify(logoutPayload));

    // ✅ Sign out user
    try {
      await signOut(auth);
      console.log("✅ User auto-signed out on tab close or shutdown.");
    } catch (error) {
      console.error("❌ Error during signout on tab close:", error);
    }
  };

  // `unload` is better than `beforeunload` for silent tasks
  window.addEventListener("unload", handleTabClose);
  return () => window.removeEventListener("unload", handleTabClose);
}, []);



// ==========================recent code============================ 

// useEffect(() => {
//   const handleTabClose = () => {
//     const auth = getAuth();
//     const user = auth.currentUser;
//     if (!user) return;

//     const username = user.displayName || user.email.split('@')[0];
//     const todayDate = new Date().toISOString().slice(0, 10);
//     const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });

//     const logoutPayload = {
//       username,
//       todayDate,
//       currentTime,
//     };

//     localStorage.setItem('pendingLogoutRecord', JSON.stringify(logoutPayload));
//   };

//   window.addEventListener("beforeunload", handleTabClose);
//   return () => window.removeEventListener("beforeunload", handleTabClose);
// }, []);



// useEffect(() => {
//   const logoutPayload = JSON.parse(localStorage.getItem('pendingLogoutRecord'));
//   if (!logoutPayload) return;

//   const { username, todayDate, currentTime } = logoutPayload;

//   const saveLogout = async () => {
//     const today = new Date().toISOString().slice(0, 10);
//     const logoutTime = currentTime;
//     const logoutDate = todayDate;

//     const isNextDay = today !== logoutDate;

//     // ✅ Only backdate if logout happened before 7am AND on same day (means user worked late night)
//     const shouldBackdate = logoutTime < '07:00:00' && !isNextDay;

//     const finalLogoutDate = shouldBackdate
//       ? new Date(new Date(logoutDate).getTime() - 86400000).toISOString().slice(0, 10)
//       : logoutDate;

//     const docRef = doc(db, 'allUsers', username, 'attendance', finalLogoutDate);
//     const docSnap = await getDoc(docRef);

//     try {
//       if (docSnap.exists()) {
//         await updateDoc(docRef, {
//           logoutTime: logoutTime,
//         });
//       } else {
//         await setDoc(docRef, {
//           date: finalLogoutDate,
//           present: true,
//           time: null,
//           leave: false,
//           logoutTime: logoutTime,
//           timestamp: serverTimestamp(),
//         });
//       }

//       localStorage.removeItem('pendingLogoutRecord');
//       console.log(`✅ Logout time saved for ${finalLogoutDate} at ${logoutTime}`);
//     } catch (err) {
//       console.error("❌ Error saving logout time:", err);
//     }
//   };

//   saveLogout();
// }, []);










// olddd working codee
  
//   useEffect(() => {
//     const handleTabClose = () => {
//       const user = auth.currentUser;
//       if (!user) return;

//       const username = user.displayName || user.email.split('@')[0];
//       const todayDate = new Date().toISOString().slice(0, 10);
//       const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });

//       const logoutPayload = {
//         username,
//         todayDate,
//         currentTime,
//       };

//       localStorage.setItem('pendingLogoutRecord', JSON.stringify(logoutPayload));
//     };

//     window.addEventListener("beforeunload", handleTabClose);
//     return () => window.removeEventListener("beforeunload", handleTabClose);
//   }, []);

  
//  useEffect(() => {
//   const logoutPayload = JSON.parse(localStorage.getItem('pendingLogoutRecord'));
//   if (!logoutPayload) return;

//   const { username, todayDate, currentTime } = logoutPayload;

//   const saveLogout = async () => {
//     const today = new Date().toISOString().slice(0, 10);
//     const logoutTime = currentTime;
//     const logoutDate = todayDate;

//     // ✅ Adjust date if logout was before 4 AM and not on same day
//     const shouldBackdate = (logoutTime < '07:00:00') && (logoutDate !== today);
//     const finalLogoutDate = shouldBackdate
//       ? new Date(new Date(logoutDate).getTime() - 86400000).toISOString().slice(0, 10)
//       : logoutDate;

//     const docRef = doc(db, 'allUsers', username, 'attendance', finalLogoutDate);
//     const docSnap = await getDoc(docRef);

//     try {
//       if (docSnap.exists()) {
//         await updateDoc(docRef, {
//           logoutTime: logoutTime,
//         });
//       } else {
//         await setDoc(docRef, {
//           date: finalLogoutDate,
//           present: true,
//           time: null,
//           leave: false,
//           logoutTime: logoutTime,
//           timestamp: serverTimestamp(),
//         });
//       }

//       localStorage.removeItem('pendingLogoutRecord');
//       console.log(`✅ Logout time saved for ${finalLogoutDate} at ${logoutTime}`);
//     } catch (err) {
//       console.error("❌ Error saving logout time:", err);
//     }
//   };

//   saveLogout();
// }, []);


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