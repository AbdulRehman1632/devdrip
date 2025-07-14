// import {
//     Button,
//     Paper,
//     TextField,
//     Typography,
//     IconButton,
//     InputAdornment,
//     Box,
//   } from '@mui/material';
//   import {
//     getAuth,
//     signInWithEmailAndPassword,
//     sendPasswordResetEmail,
//   } from 'firebase/auth';
//   import React, { useState } from 'react';
//   import { Visibility, VisibilityOff } from '@mui/icons-material';
//   import { app, db } from '../../firebase';
//   import { useNavigate } from 'react-router';
//   import { toast } from 'react-toastify';
// import { addDoc, collection, doc, getDoc, getDocs, increment, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
  
//   const LoginForm = () => {
//     const navigate = useNavigate();
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [resetEmail, setResetEmail] = useState('');
//     const [isReset, setIsReset] = useState(false);
//     const [showPassword, setShowPassword] = useState(false); 
//      const [loading, setLoading] = useState(false);
  
//     const auth = getAuth(app);


// const handleSubmit = async (e) => {
//   e.preventDefault();
//   setLoading(true);

//   try {
//     const res = await signInWithEmailAndPassword(auth, email, password);
//     toast.success('Login successful!');

//     const user = res.user;
//     const username = user.displayName || email.split('@')[0];
//     const now = new Date();
//     const todayDate = now.toISOString().slice(0, 10);
//     const currentTime = now.toLocaleTimeString('en-GB', { hour12: false });

// const userDocRef = doc(db, 'allUsers', username);
// const userDocSnap = await getDoc(userDocRef);

// let lastLoginDate;
// let lastLoginDateStr = null;
// let hasLastLogin = false;

// if (userDocSnap.exists()) {
//   const data = userDocSnap.data();
//   if (data.lastLogin?.toDate) {
//     lastLoginDate = data.lastLogin.toDate();
//     lastLoginDateStr = lastLoginDate.toISOString().slice(0, 10);
//     hasLastLogin = true;
//   }
// }


// await setDoc(userDocRef, {
//   name: username,
//   lastLogin: serverTimestamp()
// }, { merge: true });


// const attendanceRef = collection(db, 'allUsers', username, 'attendance');
// const today = new Date();
// // const todayDate = today.toISOString().slice(0, 10);

// const todayDocRef = doc(db, 'allUsers', username, 'attendance', todayDate);
// const todayDocSnap = await getDoc(todayDocRef);

// if (!todayDocSnap.exists()) {
//   await setDoc(todayDocRef, {
//     date: todayDate,
//     present: true,
//     leave: false,
//     time: currentTime,
//     timestamp: serverTimestamp(),
//   });
//   console.log(`✅ Marked today as present: ${todayDate}`);
// }


// if (hasLastLogin && lastLoginDateStr !== todayDate) {
//   const yesterday = new Date();
//   yesterday.setDate(yesterday.getDate() - 1);
//   const yesterdayDate = yesterday.toISOString().slice(0, 10);

//   const yesterdayDocRef = doc(db, 'allUsers', username, 'attendance', yesterdayDate);
//   const yesterdayDocSnap = await getDoc(yesterdayDocRef);

//   if (!yesterdayDocSnap.exists()) {
//     const day = yesterday.getDay(); 

//     const leaveSnap = await getDocs(
//       query(
//         collection(db, 'allUsers', username, 'attendance'),
//         where("date", "==", yesterdayDate),
//         where("leave", "==", true)
//       )
//     );

//     if (leaveSnap.empty) {
//       if (day === 0) {
//         await setDoc(yesterdayDocRef, {
//           date: yesterdayDate,
//           present: null,
//           leave: false,
//           holiday: true,
//           time: null,
//           timestamp: serverTimestamp(),
//         });
//         console.log(`📅 ${yesterdayDate} was Sunday, marked as holiday.`);
//       } else {
//         await setDoc(yesterdayDocRef, {
//           date: yesterdayDate,
//           present: false,
//           leave: false,
//           holiday: false,
//           time: null,
//           timestamp: serverTimestamp(),
//         });
//         console.log(`❌ ${yesterdayDate} was absent.`);
//       }
//     }
//   }
// }

// // ✅ Redirect
// setTimeout(() => {
//   navigate('/Dashboard');
// }, 2000);


//   } catch (error) {
//     toast.error('Login failed! Please check your credentials.');
//     console.error(error);
//   } finally {
//     setLoading(false);
//   }
// };



//     const handlePasswordReset = async (e) => {
//       e.preventDefault();
//       if (!resetEmail) {
//         toast.error('Please enter your email address.');
//         return;
//       }
//       try {
//         await sendPasswordResetEmail(auth, resetEmail);
//         toast.success('Password reset email sent!');
//         setIsReset(false);
//       } catch (error) {
//         toast.error('Error sending password reset email.');
//         console.log(error);
//       }
//     };
  
//     const handleClickShowPassword = () => {
//       setShowPassword((prev) => !prev);
//     };
  
//     return (
//       <Paper
//   elevation={3}
//   sx={{
//     width: "90%",
//     maxWidth: 400,
//     mx: "auto",
//     mt: { xs: 15, sm: 8 },
//     p: { xs: 2, sm: 3 },
    
//     backgroundColor: 'rgba(255, 255, 255, 0)',
//   }}
// >
//         <Box textAlign="center" mb={2}>
//         <img
//   src="../assets/images/Conceptax.png"
//   alt="Logo"
//   style={{ width: "auto", maxWidth: "100%", height: "60px" }}
// />
//   <Typography variant="h5" gutterBottom fontWeight={"bold"} marginTop={"10px"}>
//     {isReset ? 'Reset Password' : 'Log In'}
//   </Typography>
// </Box>
//         <form onSubmit={isReset ? handlePasswordReset : handleSubmit}>
//           {isReset ? (
//             <>
//               <TextField
//                 label="Email"
//                 name="resetEmail"
//                 type="email"
//                 fullWidth
//                 margin="normal"
//                 required
//                 onChange={(e) => setResetEmail(e.target.value)}
//               />
//               <Button
//                 type="submit"
//                 variant="contained"
//                 color="primary"
//                 fullWidth
//                 sx={{ mt: 2 }}
//               >
//                 Send Reset Email
//               </Button>
//             </>
//           ) : (
//             <>
//               <TextField
//                 label="Email"
//                 name="email"
//                 type="email"
//                 fullWidth
//                 margin="normal"
//                 required
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//               <TextField
//                 label="Password"
//                 name="password"
//                 type={showPassword ? 'text' : 'password'}
//                 fullWidth
//                 margin="normal"
//                 required
//                 onChange={(e) => setPassword(e.target.value)}
//                 InputProps={{
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <IconButton onClick={handleClickShowPassword} edge="end">
//                         {showPassword ? <VisibilityOff /> : <Visibility />}
//                       </IconButton>
//                     </InputAdornment>
//                   ),
//                 }}
//               />
//                  <Button
//         type="submit"
//         variant="contained"
//         color="primary"
//         fullWidth
//         sx={{ mt: 2 }}
//         disabled={loading}
//       >
//         {loading ? "Logging In..." : "Log In"}
//       </Button>
//             </>
//           )}
//         </form>

//         <Box sx={{ width: "100%", textAlign: "right", marginTop: "4px" }}>
//           <Typography
//             variant="body2"
//             component="a"
//             href="/SignUp"
//             sx={{ textDecoration: "none", color: "primary.main", cursor: "pointer" }}
//           >
//            Don't have an account? Sign up
//           </Typography>
//         </Box>


//         <Typography variant="body2" align="center" sx={{ mt: 2 }}>
//           {isReset ? (
//             <span
//               onClick={() => setIsReset(false)}
//               style={{ cursor: 'pointer', color: 'primary.main' }}
//             >
//               Back to Log In
//             </span>
//           ) : (
//             <span
//               onClick={() => setIsReset(true)}
//               style={{ cursor: 'pointer', color: 'primary.main' }}
//             >
//               Forgot Password?
//             </span>
//           )}
//         </Typography>
//       </Paper>
//     );
//   };
  
//   export default LoginForm;
  



import {
  Button,
  Paper,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Box,
} from '@mui/material';
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import React, { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { app, db } from '../../firebase';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isReset, setIsReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const auth = getAuth(app);

    const checkIfHoliday = async (db, dateToCheck) => {
    const holidayCollection = collection(db, 'holidays');
    const holidayDocs = await getDocs(holidayCollection);

    for (const docSnap of holidayDocs.docs) {
      const data = docSnap.data();
      if (data[dateToCheck]) {
        return { isHoliday: true, name: docSnap.id }; // e.g. Eid-ul-Adha
      }
    }

    return { isHoliday: false };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Login successful!');

      const user = res.user;
      const username = user.displayName || email.split('@')[0];

      // ✅ Use Firebase server time
      const now = Timestamp.now().toDate();
      const todayDate = now.toISOString().slice(0, 10);
      const currentTime = now.toLocaleTimeString('en-GB', { hour12: false });

      const userDocRef = doc(db, 'allUsers', username);
      const userDocSnap = await getDoc(userDocRef);

      let lastLoginDate;
      let lastLoginDateStr = null;
      let hasLastLogin = false;

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        if (data.lastLogin?.toDate) {
          lastLoginDate = data.lastLogin.toDate();
          lastLoginDateStr = lastLoginDate.toISOString().slice(0, 10);
          hasLastLogin = true;
        }
      }

      await setDoc(
        userDocRef,
        {
          name: username,
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );

      const todayDocRef = doc(db, 'allUsers', username, 'attendance', todayDate);
      const todayDocSnap = await getDoc(todayDocRef);

      if (!todayDocSnap.exists()) {
        await setDoc(todayDocRef, {
          date: todayDate,
          present: true,
          leave: false,
          time: currentTime,
          logoutTime: "-",
          timestamp: serverTimestamp(),
        });
        console.log(`✅ Marked today as present: ${todayDate}`);
      } else {
        console.log(`⚠️ Already marked today (${todayDate}), skipping...`);
      }



    // =============================  first old code working ===========================


      //  if (hasLastLogin && lastLoginDateStr !== todayDate) {
      //   const yesterday = new Date(now);
      //   yesterday.setDate(yesterday.getDate() - 1);
      //   const yesterdayDate = yesterday.toISOString().slice(0, 10);
      //   const yesterdayDocRef = doc(db, 'allUsers', username, 'attendance', yesterdayDate);
      //   const yesterdayDocSnap = await getDoc(yesterdayDocRef);

      //   if (!yesterdayDocSnap.exists()) {
      //     const day = yesterday.getDay();

      //     const leaveSnap = await getDocs(
      //       query(
      //         collection(db, 'allUsers', username, 'attendance'),
      //         where('date', '==', yesterdayDate),
      //         where('leave', '==', true)
      //       )
      //     );

      //     if (leaveSnap.empty) {
      //       if (day === 0) {
      //         await setDoc(yesterdayDocRef, {
      //           date: yesterdayDate,
      //           present: null,
      //           leave: false,
      //           holiday: true,
      //           time: null,
      //           timestamp: serverTimestamp(),
      //         });
      //         console.log(📅 ${yesterdayDate} was Sunday, marked as holiday.);
      //       } else {
      //         await setDoc(yesterdayDocRef, {
      //           date: yesterdayDate,
      //           present: false,
      //           leave: false,
      //           holiday: false,
      //           time: null,
      //           timestamp: serverTimestamp(),
      //         });
      //         console.log(❌ ${yesterdayDate} was absent.);
      //       }
      //     }
      //   }
      // }


          // =============================  first old code working ===========================



      // Check for yesterday's absence


// if (hasLastLogin && lastLoginDateStr !== todayDate) {
//   const yesterday = new Date(now);
//   yesterday.setDate(yesterday.getDate() - 1);
//   const yesterdayDate = yesterday.toISOString().slice(0, 10);
//   const yesterdayDocRef = doc(db, 'allUsers', username, 'attendance', yesterdayDate);
//   const yesterdayDocSnap = await getDoc(yesterdayDocRef);

//   if (!yesterdayDocSnap.exists()) {
//     const day = yesterday.getDay(); // Sunday = 0

//     const leaveSnap = await getDocs(
//       query(
//         collection(db, 'allUsers', username, 'attendance'),
//         where('date', '==', yesterdayDate),
//         where('leave', '==', true)
//       )
//     );

//     const { isHoliday, name: holidayName } = await checkIfHoliday(db, yesterdayDate);

//     if (leaveSnap.empty) {
//       if (day === 0 || isHoliday) {
//         await setDoc(yesterdayDocRef, {
//           date: yesterdayDate,
//           present: null,
//           leave: false,
//           holiday: true,
//           holidayName: day === 0 ? "Sunday" : holidayName,
//           time: null,
//           timestamp: serverTimestamp(),
//         });
//         console.log(`📅 ${yesterdayDate} marked as holiday: ${day === 0 ? "Sunday" : holidayName}`);
//       } else {
//         await setDoc(yesterdayDocRef, {
//           date: yesterdayDate,
//           present: false,
//           leave: false,
//           holiday: false,
//           time: null,
//           timestamp: serverTimestamp(),
//         });
//         console.log(`❌ ${yesterdayDate} was absent.`);
//       }
//     }
//   }
// }




// ================last working code==================== 

// if (hasLastLogin && lastLoginDateStr !== todayDate) {
//   const currentDate = new Date(lastLoginDate);
//   currentDate.setDate(currentDate.getDate() + 1);

//   const endDate = new Date(now);

//   while (currentDate <= endDate) {
//     const dateStr = currentDate.toISOString().slice(0, 10);
//     const day = currentDate.getDay();

//     const docRef = doc(db, 'allUsers', username, 'attendance', dateStr);
//     const docSnap = await getDoc(docRef);

//     if (!docSnap.exists()) {
//       const leaveSnap = await getDocs(
//         query(
//           collection(db, 'allUsers', username, 'attendance'),
//           where('date', '==', dateStr),
//           where('leave', '==', true)
//         )
//       );

//       const { isHoliday, name: holidayName } = await checkIfHoliday(db, dateStr);

//       if (leaveSnap.empty) {
//         if (day === 0 || isHoliday) {
//           await setDoc(docRef, {
//             date: dateStr,
//             present: null,
//             leave: false,
//             holiday: true,
//             holidayName: day === 0 ? 'Sunday' : holidayName,
//             time: null,
//             timestamp: serverTimestamp(),
//           });
//           console.log(`📅 ${dateStr} marked as holiday`);
//         } else {
//           await setDoc(docRef, {
//             date: dateStr,
//             present: false,
//             leave: false,
//             holiday: false,
//             time: null,
//             timestamp: serverTimestamp(),
//           });
//           console.log(`❌ ${dateStr} marked as absent`);
//         }
//       }
//     }

//     currentDate.setDate(currentDate.getDate() + 1);
//   }
// }



if (hasLastLogin && lastLoginDateStr !== todayDate) {
  const currentDate = new Date(lastLoginDate);
  currentDate.setDate(currentDate.getDate() + 1);

  const endDate = new Date(now);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().slice(0, 10);
    const day = currentDate.getDay();

    const docRef = doc(db, 'allUsers', username, 'attendance', dateStr);
    const docSnap = await getDoc(docRef);

    // if (docSnap.exists()) {
    //   const data = docSnap.data();

    //   if (data.present === true && !data.logoutTime) {
    //     await updateDoc(docRef, {
    //       logoutTime: "-",
    //     });
    //     console.log(`⛔ No logout detected for ${dateStr}, set to "-"`);
    //   }

    // } 

    if (docSnap.exists()) {
  const data = docSnap.data();

  // ✅ ONLY add logoutTime: "-" if missing
  if (data.present === true && !("logoutTime" in data)) {
    await updateDoc(docRef, {
      logoutTime: "-",
    });
    console.log(`⛔ No logout detected for ${dateStr}, set to "-"`);
  }
}

    
    else {
      // ✅ Absent or Holiday logic — your existing code
      const leaveSnap = await getDocs(
        query(
          collection(db, 'allUsers', username, 'attendance'),
          where('date', '==', dateStr),
          where('leave', '==', true)
        )
      );

      const { isHoliday, name: holidayName } = await checkIfHoliday(db, dateStr);

      if (leaveSnap.empty) {
        if (day === 0 || isHoliday) {
          await setDoc(docRef, {
            date: dateStr,
            present: null,
            leave: false,
            holiday: true,
            holidayName: day === 0 ? 'Sunday' : holidayName,
            time: null,
            logoutTime: "-",
            timestamp: serverTimestamp(),
          });
          console.log(`📅 ${dateStr} marked as holiday`);
        } else {
          await setDoc(docRef, {
            date: dateStr,
            present: false,
            leave: false,
            holiday: false,
            time: null,
            logoutTime: "-",
            timestamp: serverTimestamp(),
          });
          console.log(`❌ ${dateStr} marked as absent`);
        }
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }
}



      setTimeout(() => {
        navigate('/Dashboard');
      }, 2000);
    } catch (error) {
      toast.error('Login failed! Please check your credentials.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email address.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success('Password reset email sent!');
      setIsReset(false);
    } catch (error) {
      toast.error('Error sending password reset email.');
      console.log(error);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: '90%',
        maxWidth: 400,
        mx: 'auto',
        mt: { xs: 15, sm: 8 },
        p: { xs: 2, sm: 3 },
        backgroundColor: 'rgba(255, 255, 255, 0)',
      }}
    >
      <Box textAlign="center" mb={2}>
        <img
          src="../assets/images/Conceptax.png"
          alt="Logo"
          style={{ width: 'auto', maxWidth: '100%', height: '60px' }}
        />
        <Typography variant="h5" gutterBottom fontWeight={'bold'} marginTop={'10px'}>
          {isReset ? 'Reset Password' : 'Log In'}
        </Typography>
      </Box>
      <form onSubmit={isReset ? handlePasswordReset : handleSubmit}>
        {isReset ? (
          <>
            <TextField
              label="Email"
              name="resetEmail"
              type="email"
              fullWidth
              margin="normal"
              required
              onChange={(e) => setResetEmail(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Send Reset Email
            </Button>
          </>
        ) : (
          <>
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              margin="normal"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              required
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClickShowPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'Log In'}
            </Button>
          </>
        )}
      </form>

      <Box sx={{ width: '100%', textAlign: 'right', marginTop: '4px' }}>
        <Typography
          variant="body2"
          component="a"
          href="/SignUp"
          sx={{ textDecoration: 'none', color: 'primary.main', cursor: 'pointer' }}
        >
          Don't have an account? Sign up
        </Typography>
      </Box>

      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        {isReset ? (
          <span
            onClick={() => setIsReset(false)}
            style={{ cursor: 'pointer', color: 'primary.main' }}
          >
            Back to Log In
          </span>
        ) : (
          <span
            onClick={() => setIsReset(true)}
            style={{ cursor: 'pointer', color: 'primary.main' }}
          >
            Forgot Password?
          </span>
        )}
      </Typography>
    </Paper>
  );
};

export default LoginForm;
