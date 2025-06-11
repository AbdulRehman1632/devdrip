import React, { useState } from 'react';
import { TextField, Button, Paper, Typography } from '@mui/material';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebase';
import { toast } from 'react-toastify';

const LeaveForm = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [description, setDescription] = useState('');

  const auth = getAuth(app);
  const currentUser = auth.currentUser;

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();

    try {
      const db = getFirestore(app);

      const leaveData = {
        fromDate,
        toDate,
        description,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email.split('@')[0],
        dateApplied: new Date().toISOString().slice(0, 10),
        status: 'pending'
      };

      await addDoc(collection(db, 'leaves'), leaveData);
      toast.success('Leave request submitted for approval!');
      
      setFromDate('');
      setToDate('');
      setDescription('');
    } catch (error) {
      toast.error('Error applying leave');
      console.error(error);
    }
  };

  return (
    <Paper sx={{ padding: 3, maxWidth: 500, margin: '2rem auto' , }}>
      <Typography variant="h6" gutterBottom sx={{textAlign:"center", fontSize:"1.7em",}}>Apply for Leave</Typography>
      <form onSubmit={handleLeaveSubmit}>
        <TextField type="date" label="From Date" InputLabelProps={{ shrink: true }} fullWidth value={fromDate} onChange={(e) => setFromDate(e.target.value)} sx={{ mb: 2 }} required />
        <TextField type="date" label="To Date" InputLabelProps={{ shrink: true }} fullWidth value={toDate} onChange={(e) => setToDate(e.target.value)} sx={{ mb: 2 }} required />
        <TextField label="Description" fullWidth multiline rows={3} value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mb: 2 }} />
        <Button sx={{backgroundColor:"#3388FF"}} type="submit" variant="contained" fullWidth>Submit Leave</Button>
      </form>
    </Paper>
  );
};

export default LeaveForm;
