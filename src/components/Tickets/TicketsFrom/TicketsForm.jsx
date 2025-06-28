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
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// import { app } from '../../firebase';
import { toast } from 'react-toastify';
import { app } from '../../../firebase';
import emailjs from 'emailjs-com';

// Initialize EmailJS
emailjs.init('8lxn3ln1B71-HlefL'); // Replace this with your public key

const TicketsForm = () => {
  const [item, setItem] = useState('');
  const [urgency, setUrgency] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const auth = getAuth(app);
  const currentUser = auth.currentUser;
//   console.log(currentUser)
  const db = getFirestore(app);

// const handleSubmit = async (e) => {
//   e.preventDefault();
//   if (loading) return;

//   const currentUser = auth.currentUser;
//   if (!currentUser) {
//     toast.error('User not logged in');
//     return;
//   }

//   const userId = currentUser.displayName;
// //   console.log(userId)

//   if (!item || !urgency) {
//     toast.error('Please fill all required fields');
//     return;
//   }

//   setLoading(true);
//   try {
//     const ticketsRef = collection(db, 'allUsers', userId, 'Tickets'); // ✅ proper subcollection

//     const ticketData = {
//   item,
//   urgency,
//   description,
//   userId,
//   userName: currentUser.displayName || currentUser.email.split('@')[0],
//   userEmail: currentUser.email,
//   dateSubmitted: new Date().toISOString().slice(0, 10), // ✅ readable
//   timestamp: serverTimestamp(),                         // ✅ accurate
//   status: 'pending',
// };


//     await addDoc(ticketsRef, ticketData);
//     toast.success('Ticket submitted successfully!');
//     setItem('');
//     setUrgency('');
//     setDescription('');
//   } catch (err) {
//     console.error(err);
//     toast.error('Failed to submit ticket');
//   } finally {
//     setLoading(false);
//   }
// };


const handleSubmit = async (e) => {
  e.preventDefault();
  if (loading) return;

  const currentUser = auth.currentUser;
  if (!currentUser) {
    toast.error('User not logged in');
    return;
  }

  const userId = currentUser.displayName;

  if (!item || !urgency) {
    toast.error('Please fill all required fields');
    return;
  }

  setLoading(true);
  try {
    const ticketsRef = collection(db, 'allUsers', userId, 'Tickets');
    const ticketData = {
      item,
      urgency,
      description,
      userId,
      userName: currentUser.displayName || currentUser.email.split('@')[0],
      userEmail: currentUser.email,
      dateSubmitted: new Date().toISOString().slice(0, 10),
      timestamp: serverTimestamp(),
      status: 'pending',
    };

    // 🔸 Firebase Save
    await addDoc(ticketsRef, ticketData);

    // 🔸 EmailJS Send
    await emailjs.send('service_1', 'template_xre29yj', {
      item,
      urgency,
      description,
      user_email: currentUser.email,
      user_name: currentUser.displayName || currentUser.email.split('@')[0],
    });

    toast.success('Ticket submitted & email sent!');
    setItem('');
    setUrgency('');
    setDescription('');
  } catch (err) {
    console.error(err);
    toast.error('Failed to submit ticket or send email');
  } finally {
    setLoading(false);
  }
};





  return (
    <Paper sx={{ padding: 3, maxWidth: 500, margin: '2rem auto' }}>
      <Typography variant="h6" textAlign="center" gutterBottom>
        Submit a Support Ticket
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="What's your Issue?"
          fullWidth
          value={item}
          onChange={(e) => setItem(e.target.value)}
          sx={{ mb: 2 }}
          required
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Urgency</InputLabel>
          <Select
            value={urgency}
            label="Urgency"
            onChange={(e) => setUrgency(e.target.value)}
            required
          >
            <MenuItem value="Low">Low</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="High">High</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          sx={{ mb: 2 }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
        >
          Submit Ticket
        </Button>
      </form>
    </Paper>
  );
};

export default TicketsForm;








