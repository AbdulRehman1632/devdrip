import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";
import React, { useState } from "react";
import {
  Button,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  Box,
  IconButton,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { app, db } from "../../firebase";
import { FcGoogle } from "react-icons/fc";
import { doc, setDoc } from "firebase/firestore";

const SignupForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const auth = getAuth(app);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email,
        authorized: false,
        createdAt: new Date(),
      });

      toast.success("Google SignIn successful!");
      setTimeout(() => {
        navigate("/Login");
      }, 2000);
    } catch (error) {
      toast.error(error.message);
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const HandleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: name,
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: user.email,
        authorized: false,
        createdAt: new Date(),
      });

      toast.success("Signup successful!");
      setTimeout(() => {
        navigate("/Login");
      }, 2000);
    } catch (error) {
      toast.error(error.message);
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        // background: "linear-gradient(to bottom, #f8f9fa, #e9ecef)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 450,
          p: isMobile ? 2 : 4,
          borderRadius: 3,
         backgroundColor: 'rgba(255, 255, 255, 0)',
          
        }}
      >
        <Box textAlign="center" mb={2}>
          <img
            src="../assets/images/Conceptax.png"
            alt="Logo"
            style={{ width: "auto", maxWidth: "100%", height: "60px" }}
          />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Sign Up
          </Typography>
        </Box>

        <form onSubmit={HandleSignUp}>
          <TextField
            label="Full Name"
            fullWidth
            margin="normal"
            required
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
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
            Create Account
          </Button>
        </form>

        <Button
          variant="outlined"
          color="primary"
          fullWidth
          sx={{ mt: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}
          onClick={handleGoogleSignUp}
          disabled={loading}
        >
          <FcGoogle size={22} />
          {loading ? "Signing Up..." : "Sign Up with Google"}
        </Button>

        <Box sx={{ textAlign: "right", mt: 1 }}>
          <Typography
            variant="body2"
            component="a"
            href="/Login"
            sx={{ color: "primary.main", textDecoration: "none", cursor: "pointer" }}
          >
            Already have an Account?
          </Typography>
        </Box>

        {loading && (
          <CircularProgress
            size={40}
            sx={{
              display: "block",
              margin: "30px auto 0",
            }}
          />
        )}
      </Paper>
    </Box>
  );
};

export default SignupForm;