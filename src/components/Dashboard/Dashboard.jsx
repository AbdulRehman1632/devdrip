import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField } from '@mui/material';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { app } from '../../firebase';
import { useNavigate } from 'react-router';
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';

const Dashboard = () => {
  const auth = getAuth(app);
  const navigate = useNavigate();
  const db = getFirestore(app);
  const [openDialog, setOpenDialog] = useState(false);
const [selectedUserId, setSelectedUserId] = useState(null);

  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');

  // Filter allUsers by search term (case insensitive)
  const filteredUsers = allUsers.filter(user => {
  if (user.name) {
    return user.name.toLowerCase().includes(searchTerm.toLowerCase());
  } else {
    return searchTerm === '';
  }
});
  console.log(allUsers)
  console.log(filteredUsers)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // if (user) {
      //   setUserEmail(user.email);

      //   if (user.email === 'mr@gmail.com') {
      //     const allUsersCollectionRef = collection(db, 'allUsers');
      //     const allUsersSnapshot = await getDocs(allUsersCollectionRef);
      //     const usersList = allUsersSnapshot.docs.map(doc => ({
      //       id: doc.id,
      //       ...doc.data()
      //     }));
      //     setAllUsers(usersList);
      //   }
      // } 
      // 

       if (user) {
  setUserEmail(user.email);

  // Admin logic
  if (user.email === 'mr@gmail.com') {
    const allUsersCollectionRef = collection(db, 'allUsers');
    const allUsersSnapshot = await getDocs(allUsersCollectionRef);
    const usersList = allUsersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setAllUsers(usersList);
  } else {
    // ✅ Check leave notifications for normal user
    const q = query(
      collection(db, 'leaves'),
      where('userName', '==', user.displayName),
      where('notified', '==', false)
    );
    const snapshot = await getDocs(q);
    snapshot.forEach(async (docSnap) => {
      const data = docSnap.data();
      if (data.status === 'rejected') {
        toast.error(`Your leave was rejected: ${data.adminMessage || 'No message'}`);
      } else if (data.status === 'approved') {
        toast.success(`Your leave was approved!`);
      }

      // ✅ Update notified to true
      await updateDoc(doc(db, 'leaves', docSnap.id), { notified: true });
    });
  }
} else {
        navigate('/Login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, db, navigate]);

  // const handleLogout = async () => {
  //   try {
  //     await signOut(auth);
  //     toast.success('Logged out successfully!');
  //     setTimeout(() => {
  //       navigate('/Login');
  //     }, 2000);
  //   } catch (error) {
  //     toast.error('Logout failed!');
  //     console.error(error);
  //   }
  // };


const handleLogout = async () => {
  const auth = getAuth(app);
  const user = auth.currentUser;
  if (!user) return;

  const username = user.displayName || user.email.split('@')[0];
  const todayDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });

  try {
    // Attendance collection ref
    const attendanceRef = collection(db, 'allUsers', username, 'attendance');

    // Query attendance doc for today
    const q = query(attendanceRef, where('date', '==', todayDate));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Get first document for today (should be only one)
      const docRef = querySnapshot.docs[0].ref;

      // Update logoutTime field
      await updateDoc(docRef, {
        logoutTime: currentTime,
      });
      console.log('Logout time saved in attendance');
    } else {
      // Agar attendance document aaj ka nahi mila, toh ek naya document bana do
      // (optional, depends on your logic)
      await addDoc(attendanceRef, {
        date: todayDate,
        logoutTime: currentTime,
        present: true,
        timestamp: serverTimestamp(),
      });
      console.log('No attendance for today found, created new with logoutTime');
    }

    // Firestore update ke baad sign out kar do
    await signOut(auth);
    toast.success('Logged out successfully!');
    setTimeout(() => {
      window.location.href = '/Login';
    }, 2000);

  } catch (error) {
    toast.error('Logout failed!');
    console.error(error);
  }
};


const handleDelete = async (userId) => {
  if (!window.confirm('Are you sure you want to delete this user?')) return;

  try {
    await deleteDoc(doc(db, 'allUsers', userId));
    toast.success('User deleted successfully!');
    setAllUsers(prev => prev.filter(user => user.id !== userId));
  } catch (error) {
    toast.error('Failed to delete user.');
    console.error('Delete error:', error);
  }
};


  if (isLoading) return <p>Loading...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
  <Button variant='contained' onClick={handleLogout} sx={{ mb: 2 }}>
    Logout
  </Button>

  {userEmail === 'mr@gmail.com' ? (
    <>
      <h3>All Users:</h3>

        <TextField
            label="Search by Employee Name"
            variant="outlined"
            size="small"
            sx={{ mb: 2, maxWidth: 400, width: '100%' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

      <TableContainer component={Paper} sx={{ maxWidth: 700, mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{fontWeight:"bold",fontSize:"1em"}}>Sno</TableCell>
              <TableCell sx={{fontWeight:"bold",fontSize:"1em"}}>Employee Name</TableCell>
              <TableCell sx={{fontWeight:"bold",fontSize:"1em"}}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{user.name || 'No Name'}</TableCell>
                  <TableCell>
                    <Button 
                      variant="contained" 
                      size="small" 
                      onClick={() => navigate(`/user/${user.id}`)}
                    >
                      View
                    </Button>

                    <Button
  sx={{ marginLeft: "5px" }}
  variant="outlined"
  color="error"
  size="small"
  onClick={() => {
    setSelectedUserId(user.id);
    setOpenDialog(true);
  }}
>
  Delete
</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3}>No users found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
  open={openDialog}
  onClose={() => setOpenDialog(false)}
>
  <DialogTitle>Confirm Delete</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Are you sure you want to delete this user?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
    <Button
      onClick={async () => {
        try {
          await deleteDoc(doc(db, 'allUsers', selectedUserId));
          toast.success('User deleted successfully!');
          setAllUsers(prev => prev.filter(user => user.id !== selectedUserId));
        } catch (error) {
          toast.error('Failed to delete user.');
          console.error('Delete error:', error);
        } finally {
          setOpenDialog(false);
        }
      }}
      color="error"
    >
      Yes, Delete
    </Button>
  </DialogActions>
</Dialog>
    </>
  ) : (
    <h2 style={{fontSize:"2.5em",color:"green"}}>You're Present</h2>
  )}
</div>

    
  );
};

export default Dashboard;
