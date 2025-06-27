import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  Divider,
  IconButton,
  CircularProgress,
  Pagination,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import { app } from '../../../firebase';

const YourTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);
  const ticketsPerPage = 8;

  const db = getFirestore(app);
  const auth = getAuth(app);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchTickets = async () => {
      if (!user) return;
      const ticketsRef = collection(db, 'allUsers', user.displayName, 'Tickets');
      const snapshot = await getDocs(ticketsRef);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTickets(data);
    };

    fetchTickets();
  }, [user]);

  const handleDelete = async (ticketId) => {
    if (!user) return;

    setDeletingId(ticketId);
    try {
      await deleteDoc(doc(db, 'allUsers', user.displayName, 'Tickets', ticketId));
      setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
      toast.success('Ticket deleted successfully!');
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error('Failed to delete ticket.');
    } finally {
      setDeletingId(null);
    }
  };

  const paginatedTickets = tickets.slice(
    (page - 1) * ticketsPerPage,
    page * ticketsPerPage
  );

  return (
    <>
      <Typography textAlign={'center'} variant="h6" gutterBottom>
        Your Submitted Tickets
      </Typography>

      {tickets.length === 0 ? (
        <Typography>No tickets submitted yet.</Typography>
      ) : (
        <>
          <List>
            {paginatedTickets.map(ticket => {
              const createdAt = ticket.timestamp?.toDate()?.toLocaleString() || 'N/A';
              const status = ticket.status;

              let resolvedAt = '-';
              if (status === 'approved' && ticket.approvedTime)
                resolvedAt = ticket.approvedTime.toDate().toLocaleString();
              if (status === 'rejected' && ticket.rejectedTime)
                resolvedAt = ticket.rejectedTime.toDate().toLocaleString();
              if (status === 'inprogress' && ticket.inprogressTime)
                resolvedAt = ticket.inprogressTime.toDate().toLocaleString();

              return (
                <Box key={ticket.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" fontWeight="bold">
                            {ticket.item}
                          </Typography>
                          <Chip
                            label={ticket.status}
                            color={
                              status === 'pending'
                                ? 'warning'
                                : status === 'approved'
                                ? 'success'
                                : status === 'inprogress'
                                ? 'info'
                                : 'error'
                            }
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography sx={{ letterSpacing: "0.9px" }} variant="body2" color="textSecondary">
                            <strong>Urgency:</strong> {ticket.urgency}
                          </Typography>

                          <Typography sx={{ letterSpacing: "0.9px" }} variant="body2" color="textSecondary">
                            <strong>Submitted:</strong> {createdAt}
                          </Typography>

                          <Typography sx={{ letterSpacing: "0.9px" }} variant="body2" color="textSecondary">
                            <strong>Resolved At:</strong> {resolvedAt}
                          </Typography>

                          {ticket.message && (status === 'inprogress' || status === 'rejected') && (
                            <Typography sx={{ letterSpacing: "0.9px" }} variant="body2" color="textSecondary">
                              <strong>Support Message:</strong> {ticket.message}
                            </Typography>
                          )}

                          {ticket.description && (
                            <Typography sx={{ letterSpacing: "0.9px" }} variant="body2" color="textSecondary">
                              <strong>Description:</strong> {ticket.description}
                            </Typography>
                          )}

                          <Box display="flex" justifyContent="flex-end">
                            <IconButton
                              sx={{ marginTop: "-20px" }}
                              color="error"
                              onClick={() => handleDelete(ticket.id)}
                              title="Delete Ticket"
                              disabled={deletingId === ticket.id}
                            >
                              {deletingId === ticket.id ? (
                                <CircularProgress size={20} color="error" />
                              ) : (
                                <DeleteIcon />
                              )}
                            </IconButton>
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider />
                </Box>
              );
            })}
          </List>

          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={Math.ceil(tickets.length / ticketsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        </>
      )}
    </>
  );
};

export default YourTickets;
