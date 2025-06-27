import React, { useState } from 'react';

import { Tabs, Tab, Box, Paper } from '@mui/material';
import TicketsForm from './TicketsFrom/TicketsForm';
import YourTickets from './YourTickets/YourTickets';

const Tickets = () => {
  const [tab, setTab] = useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Paper sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 ,background:"none"}}>
      <Tabs value={tab} onChange={handleChange} centered>
        <Tab label="Submit Ticket" />
        <Tab label="Your Tickets" />
      </Tabs>

      <Box sx={{ mt: 2,background:"transparent" }}>
        {tab === 0 && <TicketsForm />}
        {tab === 1 && <YourTickets />}
      </Box>
    </Paper>
  );
};

export default Tickets;
