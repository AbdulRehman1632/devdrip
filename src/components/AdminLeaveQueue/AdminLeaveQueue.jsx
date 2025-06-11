import React, { useEffect, useState } from 'react';
import {
  collection,
  getFirestore,
  getDocs,
  updateDoc,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebase';
import {
  Button,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from '@mui/material';
import { toast } from 'react-toastify';

const AdminLeaveQueue = () => {
  const [leaves, setLeaves] = useState([]);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectionMessage, setRejectionMessage] = useState('');

  const auth = getAuth(app);
  const user = auth.currentUser;
  const db = getFirestore(app);

  useEffect(() => {
    const fetchLeaves = async () => {
      const snapshot = await getDocs(collection(db, 'leaves'));
      const pendingLeaves = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(leave => leave.status === 'pending');
      setLeaves(pendingLeaves);
    };

    if (user?.email === 'info@conceptax.com' ) fetchLeaves();
  }, [user]);

  const approveLeave = async (leave) => {
    try {
      const { fromDate, toDate, userName } = leave;
      const start = new Date(fromDate);
      const end = new Date(toDate);

      while (start <= end) {
        const dateStr = start.toISOString().slice(0, 10);
        const attendanceRef = doc(db, 'allUsers', userName, 'attendance', dateStr);
        await setDoc(attendanceRef, {
          date: dateStr,
          present: false,
          leave: true,
          timestamp: serverTimestamp(),
        });
        start.setDate(start.getDate() + 1);
      }

      const leaveRef = doc(db, 'leaves', leave.id);
      await updateDoc(leaveRef, { status: 'approved', adminMessage: '', notified: false });

      toast.success(`Approved leave for ${leave.userName}`);
      setLeaves(prev => prev.filter(l => l.id !== leave.id));
    } catch (err) {
      toast.error('Failed to approve leave');
      console.error(err);
    }
  };

  const handleRejectClick = (leave) => {
    setSelectedLeave(leave);
    setRejectionMessage('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedLeave) return;

    try {
      const leaveRef = doc(db, 'leaves', selectedLeave.id);
      await updateDoc(leaveRef, {
        status: 'rejected',
        adminMessage: rejectionMessage || 'Your leave request was rejected',
        notified: false,
      });

      toast.info(`Rejected leave for ${selectedLeave.userName}`);
      setLeaves(prev => prev.filter(l => l.id !== selectedLeave.id));
    } catch (err) {
      toast.error('Failed to reject leave');
      console.error(err);
    } finally {
      setRejectDialogOpen(false);
      setSelectedLeave(null);
    }
  };

  if (user?.email !== 'info@conceptax.com') return null;

  return (
    <Paper
      sx={{
        padding: 3,
        margin: '2rem auto',
        maxWidth: '800px',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          textAlign: 'center',
          fontSize: { xs: '1.2em', sm: '1.7em' },
        }}
      >
        Leave Approval Queue
      </Typography>

      {leaves.length === 0 ? (
        <Typography>No pending leaves</Typography>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>From</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>To</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>{leave.userName}</TableCell>
                  <TableCell>{leave.fromDate}</TableCell>
                  <TableCell>{leave.toDate}</TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.8em',
                      fontWeight: 'bold',
                    }}
                  >
                    {leave.description}
                  </TableCell>
                  <TableCell
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 1,
                    }}
                  >
                    <Button
                      onClick={() => approveLeave(leave)}
                      variant="contained"
                      color="primary"
                      fullWidth
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleRejectClick(leave)}
                      variant="outlined"
                      color="error"
                      fullWidth
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Leave</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason for Rejection"
            fullWidth
            multiline
            rows={3}
            value={rejectionMessage}
            onChange={(e) => setRejectionMessage(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRejectConfirm} color="error" variant="contained">
            Reject Leave
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AdminLeaveQueue;
