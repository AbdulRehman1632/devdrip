import React, { useState } from 'react';
import {
  TextField,
  Button,
  Paper,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebase';
import { toast } from 'react-toastify';
import emailjs from 'emailjs-com';


const LeaveForm = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [description, setDescription] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [loading, setLoading] = useState(false);
  const EmailSender = import.meta.env.VITE_ADMIN_SENDER;

  const auth = getAuth(app);
  const currentUser = auth.currentUser;


  // EmailJS config
const SERVICE_Id = import.meta.env.VITE_SERVICE_ID;
const TEMPLATE_Id = import.meta.env.VITE_TEMPLATE_ID;
const USER_Id = import.meta.env.VITE_USER_ID;

const sendEmailToAdmin = async (leaveData) => {
  const templateParams = {
     user_name: leaveData.userName,
  user_email: leaveData.userEmail,
  from_date: leaveData.fromDate,
  to_date: leaveData.toDate,
  leave_type: leaveData.leaveType,
  description: leaveData.description,
    to_email: EmailSender, 
  };

  try {
    await emailjs.send(SERVICE_Id, TEMPLATE_Id, templateParams, USER_Id);
    console.log(templateParams) 
    console.log('Email sent to admin successfully');
  } catch (err) {
    console.error('Failed to send email:', err);
  }
};


  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!leaveType) {
      toast.error('Please select a leave type');
      return;
    }

    setLoading(true);
    try {
      const db = getFirestore(app);

      const leaveData = {
        fromDate,
        toDate,
        description,
        leaveType, // ✅ added field
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email.split('@')[0],
        dateApplied: new Date().toISOString().slice(0, 10),
        status: 'pending'
      };

      await addDoc(collection(db, 'leaves'), leaveData);
      await sendEmailToAdmin(leaveData);
      toast.success('Leave request submitted for approval!');

      // Clear form
      setFromDate('');
      setToDate('');
      setDescription('');
      setLeaveType('');
    } catch (error) {
      toast.error('Error applying leave');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ padding: 3, maxWidth: 500, margin: '2rem auto' }}>
      <Typography variant="h6" gutterBottom sx={{ textAlign: "center", fontSize: "1.7em" }}>
        Apply for Leave
      </Typography>
      <form onSubmit={handleLeaveSubmit}>
       

        <TextField
          type="date"
          label="From Date"
          InputLabelProps={{ shrink: true }}
          fullWidth
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          type="date"
          label="To Date"
          InputLabelProps={{ shrink: true }}
          fullWidth
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          sx={{ mb: 2 }}
          required
        />

         <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Leave Type</InputLabel>
          <Select
            value={leaveType}
            label="Leave Type"
            onChange={(e) => setLeaveType(e.target.value)}
            required
          >
            <MenuItem value="Annual Leave">Annual Leave</MenuItem>
            <MenuItem value="Casual Leave">Casual Leave</MenuItem>
            <MenuItem value="Sick Leave">Sick Leave</MenuItem>
          </Select>
        </FormControl>


        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button
          sx={{ backgroundColor: "#3388FF" }}
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
        >
          Submit Leave
        </Button>
      </form>
    </Paper>
  );
};

export default LeaveForm;

