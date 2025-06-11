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
import { addDoc, collection, doc, getDoc, getDocs, increment, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
  
  const LoginForm = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [isReset, setIsReset] = useState(false);
    const [showPassword, setShowPassword] = useState(false); 
     const [loading, setLoading] = useState(false);
  
    const auth = getAuth(app);




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

//     // 1. Get user doc
//     const userDocRef = doc(db, 'allUsers', username);
//     const userDocSnap = await getDoc(userDocRef);

//     let lastLoginDate;
// let isFirstLogin = false;

// if (userDocSnap.exists()) {
//   const data = userDocSnap.data();
//   if (data.lastLogin?.toDate) {
//     lastLoginDate = data.lastLogin.toDate();
//   } else {
//     isFirstLogin = true;  // 👈 Ye important flag hai
//   }
// } else {
//   isFirstLogin = true; // 👈 User document hi nahi mila
// }

// // 2. Update login time
// await setDoc(userDocRef, {
//   name: username,
//   lastLogin: serverTimestamp()
// }, { merge: true });

// const attendanceRef = collection(db, 'allUsers', username, 'attendance');

// // 3. Set attendance based on whether it's first login
// const startDate = isFirstLogin
//   ? new Date() // 👈 Pehli dafa login kar raha hai to sirf aaj
//   : new Date(lastLoginDate);

// startDate.setHours(0, 0, 0, 0);

// const endDate = new Date();
// endDate.setHours(0, 0, 0, 0);

// for (
//   let d = new Date(startDate);
//   d <= endDate;
//   d.setDate(d.getDate() + 1)
// ) {
//   const dateStr = d.toISOString().slice(0, 10);

//   const attendanceQuery = query(attendanceRef, where("date", "==", dateStr));
//   const attendanceSnap = await getDocs(attendanceQuery);

//   if (!attendanceSnap.empty) continue;

//   const leaveQuery = query(attendanceRef, where("date", "==", dateStr), where("leave", "==", true));
//   const leaveSnap = await getDocs(leaveQuery);

//   let present = false;
//   let leave = false;
//   let time = null;

//   if (!leaveSnap.empty) {
//     present = null;
//     leave = true;
//   } else if (dateStr === todayDate) {
//     present = true;
//     time = currentTime;
//   }

//   await addDoc(attendanceRef, {
//     date: dateStr,
//     present,
//     leave,
//     time,
//     timestamp: serverTimestamp(),
//   });

//   console.log(`✅ Marked: ${dateStr}, present: ${present}, leave: ${leave}`);
// }


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

//     const userDocRef = doc(db, 'allUsers', username);
//     const userDocSnap = await getDoc(userDocRef);

//     let lastLoginDate;
//     let isFirstLogin = false;

//     if (userDocSnap.exists()) {
//       const data = userDocSnap.data();
//       if (data.lastLogin?.toDate) {
//         lastLoginDate = data.lastLogin.toDate();
//       } else {
//         isFirstLogin = true;
//       }
//     } else {
//       isFirstLogin = true;
//     }

//     // Update login time
//     await setDoc(userDocRef, {
//       name: username,
//       lastLogin: serverTimestamp()
//     }, { merge: true });

//     const attendanceRef = collection(db, 'allUsers', username, 'attendance');

//     // 🚫 Agar first login hai, pechlay dino ko skip karo
//     if (!isFirstLogin) {
//       const startDate = new Date(lastLoginDate);
//       startDate.setHours(0, 0, 0, 0);

//       const endDate = new Date();
//       endDate.setHours(0, 0, 0, 0);

//       for (
//         let d = new Date(startDate);
//         d <= endDate;
//         d.setDate(d.getDate() + 1)
//       ) {
//         const dateStr = d.toISOString().slice(0, 10);

//         const attendanceQuery = query(attendanceRef, where("date", "==", dateStr));
//         const attendanceSnap = await getDocs(attendanceQuery);

//         if (!attendanceSnap.empty) continue;

//         const leaveQuery = query(attendanceRef, where("date", "==", dateStr), where("leave", "==", true));
//         const leaveSnap = await getDocs(leaveQuery);

//         let present = false;
//         let leave = false;
//         let time = null;

//         if (!leaveSnap.empty) {
//           present = null;
//           leave = true;
//         } else if (dateStr === todayDate) {
//           present = true;
//           time = currentTime;
//         }

//         await addDoc(attendanceRef, {
//           date: dateStr,
//           present,
//           leave,
//           time,
//           timestamp: serverTimestamp(),
//         });

//         console.log(`✅ Marked: ${dateStr}, present: ${present}, leave: ${leave}`);
//       }
//     } else {
//       // Sirf aaj ki attendance mark karo
//       await addDoc(attendanceRef, {
//         date: todayDate,
//         present: true,
//         leave: false,
//         time: currentTime,
//         timestamp: serverTimestamp(),
//       });

//       console.log(`✅ First login - Marked only today as present: ${todayDate}`);
//     }


//     setTimeout(() => {
//       navigate('/Dashboard');
//     }, 2000);

//   } catch (error) {
//     toast.error('Login failed! Please check your credentials.');
//     console.error(error);
//   } finally {
//     setLoading(false);
//   }
// };









const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    toast.success('Login successful!');

    const user = res.user;
    const username = user.displayName || email.split('@')[0];
    const now = new Date();
    const todayDate = now.toISOString().slice(0, 10);
    const currentTime = now.toLocaleTimeString('en-GB', { hour12: false });

//     const userDocRef = doc(db, 'allUsers', username);
//     const userDocSnap = await getDoc(userDocRef);

//     let lastLoginDate;
//     let isFirstLogin = false;

//   if (userDocSnap.exists()) {
//   const data = userDocSnap.data();
//   if (data.lastLogin?.toDate) {
//     lastLoginDate = data.lastLogin.toDate();
//     const lastLoginDateStr = lastLoginDate.toISOString().slice(0, 10);
//     if (lastLoginDateStr !== todayDate) {
//       isFirstLogin = false; // different day → purana user
//     } else {
//       isFirstLogin = true; // same day login already marked
//     }
//   } else {
//     isFirstLogin = true;
//   }
// } else {
//   isFirstLogin = true;
// }
//     // ✅ Update last login timestamp
//     await setDoc(userDocRef, {
//       name: username,
//       lastLogin: serverTimestamp()
//     }, { merge: true });

//     const attendanceRef = collection(db, 'allUsers', username, 'attendance');

//     // ✅ Sirf aaj ki attendance lagao agar first login hai
//     if (isFirstLogin) {
//   const todayAttendanceQuery = query(attendanceRef, where("date", "==", todayDate));
//   const todaySnap = await getDocs(todayAttendanceQuery);

//   if (todaySnap.empty) {
//     await addDoc(attendanceRef, {
//       date: todayDate,
//       present: true,
//       leave: false,
//       time: currentTime,
//       timestamp: serverTimestamp(),
//     });
//     console.log(`✅ First login - Marked today as present: ${todayDate}`);
//   } else {
//     console.log(`⚠️ First login - Attendance for today already exists. Skipping.`);
//   }
// } else {
//       // ✅ Pehle check kro aaj ki attendance lagi hai ya nahi
//       const todayAttendanceQuery = query(attendanceRef, where("date", "==", todayDate));
//       const todaySnap = await getDocs(todayAttendanceQuery);

//       if (todaySnap.empty) {
//         await addDoc(attendanceRef, {
//           date: todayDate,
//           present: true,
//           leave: false,
//           time: currentTime,
//           timestamp: serverTimestamp(),
//         });
//         console.log(`✅ Marked today as present: ${todayDate}`);
//       }

//       // ✅ Kal ka date check kro
//       const yesterday = new Date();
//       yesterday.setDate(yesterday.getDate() - 1);
//       yesterday.setHours(0, 0, 0, 0);
//       const yesterdayDate = yesterday.toISOString().slice(0, 10);

//       const ySnap = await getDocs(query(attendanceRef, where("date", "==", yesterdayDate)));
//       if (ySnap.empty) {
//         const leaveSnap = await getDocs(
//           query(attendanceRef, where("date", "==", yesterdayDate), where("leave", "==", true))
//         );

//         const day = yesterday.getDay(); // 0 = Sunday
//         if (leaveSnap.empty) {
//           if (day === 0) {
//             // ✅ Sunday → holiday mark
//             await addDoc(attendanceRef, {
//               date: yesterdayDate,
//               present: null,
//               leave: false,
//               holiday: true,
//               time: null,
//               timestamp: serverTimestamp(),
//             });
//             console.log(`📅 ${yesterdayDate} was Sunday, marked as holiday.`);
//           } else {
//             // ✅ Absent mark
//             await addDoc(attendanceRef, {
//               date: yesterdayDate,
//               present: false,
//               leave: false,
//               holiday: false,
//               time: null,
//               timestamp: serverTimestamp(),
//             });
//             console.log(`❌ ${yesterdayDate} was absent.`);
//           }
//         }
//       }
//     }




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

// ✅ Update last login timestamp
await setDoc(userDocRef, {
  name: username,
  lastLogin: serverTimestamp()
}, { merge: true });

// ✅ Always mark today (if not already)
const attendanceRef = collection(db, 'allUsers', username, 'attendance');
const todaySnap = await getDocs(query(attendanceRef, where("date", "==", todayDate)));
if (todaySnap.empty) {
  await addDoc(attendanceRef, {
    date: todayDate,
    present: true,
    leave: false,
    time: currentTime,
    timestamp: serverTimestamp(),
  });
  console.log(`✅ Marked today as present: ${todayDate}`);
}

// ✅ Kal ki attendance sirf agar:
// 1. lastLogin hai, aur
// 2. lastLogin ≠ today
if (hasLastLogin && lastLoginDateStr !== todayDate) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDate = yesterday.toISOString().slice(0, 10);

  const ySnap = await getDocs(query(attendanceRef, where("date", "==", yesterdayDate)));
  if (ySnap.empty) {
    const leaveSnap = await getDocs(
      query(attendanceRef, where("date", "==", yesterdayDate), where("leave", "==", true))
    );

    const day = yesterday.getDay(); // 0 = Sunday
    if (leaveSnap.empty) {
      if (day === 0) {
        await addDoc(attendanceRef, {
          date: yesterdayDate,
          present: null,
          leave: false,
          holiday: true,
          time: null,
          timestamp: serverTimestamp(),
        });
        console.log(`📅 ${yesterdayDate} was Sunday, marked as holiday.`);
      } else {
        await addDoc(attendanceRef, {
          date: yesterdayDate,
          present: false,
          leave: false,
          holiday: false,
          time: null,
          timestamp: serverTimestamp(),
        });
        console.log(`❌ ${yesterdayDate} was absent.`);
      }
    }
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
    width: "90%",
    maxWidth: 400,
    mx: "auto",
    mt: { xs: 25, sm: 8 },
    p: { xs: 2, sm: 3 },
    
    backgroundColor: 'rgba(255, 255, 255, 0)',
  }}
>
        <Box textAlign="center" mb={2}>
        <img
  src="../assets/images/Conceptax.png"
  alt="Logo"
  style={{ width: "auto", maxWidth: "100%", height: "60px" }}
/>
  <Typography variant="h5" gutterBottom fontWeight={"bold"} marginTop={"10px"}>
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
        {loading ? "Logging In..." : "Log In"}
      </Button>
            </>
          )}
        </form>

        <Box sx={{ width: "100%", textAlign: "right", marginTop: "4px" }}>
          <Typography
            variant="body2"
            component="a"
            href="/SignUp"
            sx={{ textDecoration: "none", color: "primary.main", cursor: "pointer" }}
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
  


