import React, { useEffect, useState } from 'react';
import {
  Typography,
  Tabs,
  Tab,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  Paper,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TablePagination,
} from '@mui/material';
import {
  getFirestore,
  collectionGroup,
  getDocs,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { toast } from 'react-toastify';
import { app } from '../../firebase';

const HelpDesk = () => {
  const [tab, setTab] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [actionType, setActionType] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 8;

  const db = getFirestore(app);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const qSnap = await getDocs(collectionGroup(db, 'Tickets'));
      const ticketList = qSnap.docs.map(docSnap => ({
        id: docSnap.id,
        data: docSnap.data(),
        ref: docSnap.ref,
      }));
      setTickets(ticketList);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleAction = async (ticket, action, message = '') => {
    try {
      const updateData = {
        status: action,
        [`${action}Time`]: serverTimestamp(),
      };
      if (message) updateData.message = message;
      await updateDoc(ticket.ref, updateData);
      toast.success(`Ticket ${action}`);
      setMessageDialogOpen(false);
      setMessageText('');
      fetchTickets();
    } catch (err) {
      console.error(err);
      toast.error(`${action} failed`);
    }
  };

  const openActionModal = (ticket, type) => {
    setSelectedTicket(ticket);
    setActionType(type);
    setMessageDialogOpen(true);
  };

  const filteredTickets = tickets.filter(ticket => {
    if (tab === 0) return ticket.data.status === 'pending';
    if (tab === 1) return ticket.data.status === 'approved';
    if (tab === 2) return ticket.data.status === 'rejected';
    if (tab === 3) return ticket.data.status === 'inprogress';
    return false;
  });

  const paginatedTickets = filteredTickets.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ padding: { xs: 1, md: 4 } }}>
      <Typography variant="h5" textAlign="center" mb={3}>
        🌻 Help Desk - Support Tickets
      </Typography>

      <Box display="flex" justifyContent="center" mb={2}>
        <Tabs value={tab} onChange={(e, newVal) => { setTab(newVal); setPage(0); }} centered>
          <Tab label="Pending" />
          <Tab label="Approved" />
          <Tab label="Rejected" />
          <Tab label="In Progress" />
        </Tabs>
      </Box>

      <Paper elevation={2}>
        {loading ? (
          <Typography sx={{ p: 2 }}>Loading tickets...</Typography>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small">
             <TableHead>
  <TableRow>
    <TableCell><b>S.No</b></TableCell>
    <TableCell><b>Item</b></TableCell>
    <TableCell><b>User</b></TableCell>
    <TableCell><b>Urgency</b></TableCell>
    <TableCell><b>Created At</b></TableCell>
    <TableCell><b>Resolved At</b></TableCell>
    <TableCell><b>Description</b></TableCell>
    {(tab === 2 || tab === 3) && <TableCell><b>Support Message</b></TableCell>}
    <TableCell><b>Status</b></TableCell>
    {(tab === 0 || tab === 3) && <TableCell><b>Action</b></TableCell>}
  </TableRow>
</TableHead>
              <TableBody>
                {paginatedTickets.length > 0 ? (
                  paginatedTickets.map((ticket, index) => (
                    <TableRow key={index}>
      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
      <TableCell>{ticket.data.item}</TableCell>
      <TableCell>{ticket.data.userName}</TableCell>
                      <TableCell>{ticket.data.urgency}</TableCell>
                      <TableCell>{ticket.data.timestamp?.toDate().toLocaleString() || 'No data'}</TableCell>
                      <TableCell>{(() => {
                        const t = ticket.data;
                        if (t.status === 'approved' && t.approvedTime) return t.approvedTime.toDate().toLocaleString();
                        if (t.status === 'rejected' && t.rejectedTime) return t.rejectedTime.toDate().toLocaleString();
                        if (t.status === 'inprogress' && t.inprogressTime) return t.inprogressTime.toDate().toLocaleString();
                        return '-';
                      })()}</TableCell>
                      <TableCell>{ticket.data.description || '-'}</TableCell>
                      {(tab === 2 || tab === 3) && <TableCell>{ticket.data.message || '-'}</TableCell>}
                      <TableCell>
                        <Chip
                          label={ticket.data.status}
                          size="small"
                          color={
                            ticket.data.status === 'approved' ? 'success'
                              : ticket.data.status === 'rejected' ? 'error'
                              : ticket.data.status === 'inprogress' ? 'info'
                              : 'warning'
                          }
                        />
                      </TableCell>
                      {(tab === 0 || tab === 3) && (
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {tab === 0 && (
                              <>
                                <Button variant="contained" size="small" color="info" onClick={() => openActionModal(ticket, 'inprogress')}>In Progress</Button>
                                <Button variant="contained" size="small" color="success" onClick={() => handleAction(ticket, 'approved')}>Approve</Button>
                                <Button variant="outlined" size="small" color="error" onClick={() => openActionModal(ticket, 'rejected')}>Reject</Button>
                              </>
                            )}
                            {tab === 3 && (
                              <>
                                <Button variant="contained" size="small" color="success" onClick={() => handleAction(ticket, 'approved')}>Approve</Button>
                                <Button variant="outlined" size="small" color="error" onClick={() => openActionModal(ticket, 'rejected')}>Reject</Button>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center">No data found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <TablePagination
          component="div"
          count={filteredTickets.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
        />
      </Paper>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onClose={() => setMessageDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Enter Message for {actionType}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            type="text"
            fullWidth
            multiline
            minRows={3}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => selectedTicket && handleAction(selectedTicket, actionType, messageText)} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HelpDesk;
