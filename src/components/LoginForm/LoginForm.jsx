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
    //   try {
    //     await signInWithEmailAndPassword(auth, email, password);
    //     toast.success('Login successful!');
    //     setTimeout(() => {
    //       navigate('/Dashboard');
    //     }, 2000);
    //     console.log('User Logged In successfully');
    //   } catch (error) {
    //     toast.error('Login failed! Please check your credentials.');
    //     console.log(error);
    //   }
    // };


// const handleSubmit = async (e) => {
//   e.preventDefault();
//   setLoading(true);

//   try {
//     const res = await signInWithEmailAndPassword(auth, email, password);
//     toast.success('Login successful!');

//     const user = res.user;
//     const username = user.displayName || email.split('@')[0];
//     const now = new Date();

//     const todayDate = now.toISOString().slice(0, 10); // "YYYY-MM-DD"
//     const currentTime = now.toLocaleTimeString('en-GB', { hour12: false }); // "HH:mm:ss" 24-hour format

//     // 1. Create or update user doc in 'allUsers'
//     const userDocRef = doc(db, 'allUsers', username);
//     await setDoc(userDocRef, {
//       name: username,
//       lastLogin: serverTimestamp()
//     }, { merge: true });

//     // 2. Attendance subcollection
//     const attendanceRef = collection(db, 'allUsers', username, 'attendance');

//     // Check if attendance for today exists
//     const attendanceQuery = query(attendanceRef, where("date", "==", todayDate));
//     const attendanceSnapshot = await getDocs(attendanceQuery);

//     if (attendanceSnapshot.empty) {
//       await addDoc(attendanceRef, {
//         date: todayDate,      // string date
//         time: currentTime,    // string time
//         present: true,
//         timestamp: serverTimestamp() // firestore timestamp
//       });
//       console.log('Attendance marked for today');
//     } else {
//       console.log('Attendance already marked for today');
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

    // 1. Get user doc
    const userDocRef = doc(db, 'allUsers', username);
    const userDocSnap = await getDoc(userDocRef);

    let lastLoginDate;

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      if (data.lastLogin?.toDate) {
        lastLoginDate = data.lastLogin.toDate();
      }
    }

    // 2. Update user with new login time
    await setDoc(userDocRef, {
      name: username,
      lastLogin: serverTimestamp()
    }, { merge: true });

    const attendanceRef = collection(db, 'allUsers', username, 'attendance');

    // 3. Get all missed dates
  const startDate = lastLoginDate
  ? new Date(lastLoginDate)
  : new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // fallback if no login date
startDate.setHours(0, 0, 0, 0);

const endDate = new Date();
endDate.setHours(0, 0, 0, 0);

for (
  let d = new Date(startDate);
  d <= endDate;
  d.setDate(d.getDate() + 1)
) {
  const dateStr = d.toISOString().slice(0, 10);

  // Step 1: Check if attendance already marked
  const attendanceQuery = query(attendanceRef, where("date", "==", dateStr));
  const attendanceSnap = await getDocs(attendanceQuery);

  if (!attendanceSnap.empty) {
    console.log(`📌 Already marked: ${dateStr}`);
    continue;
  }

  // Step 2: Check if user was on leave
  const leaveQuery = query(
    attendanceRef,
    where("date", "==", dateStr),
    where("leave", "==", true)
  );
  const leaveSnap = await getDocs(leaveQuery);

  let present = false;
  let leave = false;
  let time = null;

  if (!leaveSnap.empty) {
    // On leave, so no need to mark present
    present = null;
    leave = true;
  } else if (dateStr === todayDate) {
    // Aaj ka din hai aur leave pe nahi to mark as present
    present = true;
    time = currentTime;
  }

  await addDoc(attendanceRef, {
    date: dateStr,
    present,
    leave,
    time,
    timestamp: serverTimestamp(),
  });

  console.log(`✅ Marked: ${dateStr}, present: ${present}, leave: ${leave}`);
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
    mt: { xs: 4, sm: 8 },
    p: { xs: 2, sm: 3 },
    backgroundColor: 'rgba(255, 255, 255, 0)',
  }}
>
        <Box textAlign="center" mb={2}>
        <img
  src="../assets/images/rihla.png"
  alt="Logo"
  style={{ width: "auto", maxWidth: "100%", height: "60px" }}
/>
  <Typography variant="h5" gutterBottom fontWeight={"bold"}>
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
  


