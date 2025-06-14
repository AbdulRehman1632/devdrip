import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Pagination,
  Stack
} from '@mui/material';
import {
  getAuth,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { app } from '../../firebase';
import { useNavigate } from 'react-router';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';

const Dashboard = () => {
  const auth = getAuth(app);
  const navigate = useNavigate();
  const db = getFirestore(app);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  const filteredUsers = allUsers.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setUserEmail(user.email);

        if (user.email === 'info@conceptax.com') {
          const allUsersCollectionRef = collection(db, 'allUsers');
          const allUsersSnapshot = await getDocs(allUsersCollectionRef);
          const usersList = allUsersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setAllUsers(usersList);
        } else {
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

  const handleLogout = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const username = user.displayName || user.email.split('@')[0];
    const todayDate = new Date().toISOString().slice(0, 10);
    const currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });

    try {
      const attendanceRef = collection(db, 'allUsers', username, 'attendance');
      const q = query(attendanceRef, where('date', '==', todayDate));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          logoutTime: currentTime,
        });
      } else {
        await addDoc(attendanceRef, {
          date: todayDate,
          logoutTime: currentTime,
          present: true,
          timestamp: serverTimestamp(),
        });
      }

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

  const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
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
      <Button variant='contained' onClick={handleLogout} sx={{ mb: 2,backgroundColor:"Gray" }}>
        Logout
      </Button>

      {userEmail === 'info@conceptax.com' ? (
        <>
          <h3>All Users:</h3>

          <TextField
            label="Search by Employee Name"
            variant="outlined"
            size="small"
            sx={{ mb: 2, maxWidth: 400, width: '100%' }}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />

          <TableContainer  sx={{ maxWidth: 700, mt: 2  }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1em" }}>S.No</TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1em" }}>Employee Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "1em" }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell>{indexOfFirstUser + index + 1}</TableCell>
                      <TableCell>{capitalize(user.name) || 'No Name'}</TableCell>
                      <TableCell>
                     <Stack
  direction={{ xs: "column", sm: "row" }}
  spacing={1}
  alignItems="flex-start" // or "center" as needed
>
  <Button
    variant="contained"
    size="small"
    sx={{backgroundColor:"#3388FF"}}
    onClick={() => navigate(`/user/${user.id}`)}
  >
    View
  </Button>
  <Button
    variant="contained"
    color="error"
    size="small"
    onClick={() => {
      setSelectedUserId(user.id);
      setOpenDialog(true);
    }}
  >
    Delete
  </Button>
</Stack>
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

          {/* Pagination */}
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            sx={{ mt: 2 }}
            color="primary"
          />

          {/* Confirm Delete Dialog */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
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
        <>
          <h2 style={{ fontSize: "2.5em" }}>
  Hi 👋 {currentUser?.displayName
    ? currentUser.displayName.charAt(0).toUpperCase() + currentUser.displayName.slice(1)
    : ""}
</h2>

          <h2 style={{ fontSize: "2.5em", color: "green", marginTop: "-15px" }}>You're Present</h2>  
        </>
      )}
    </div>
  );
};

export default Dashboard;
