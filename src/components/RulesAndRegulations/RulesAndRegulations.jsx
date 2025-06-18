import React from 'react';
import { Typography, Box } from '@mui/material';

const RulesAndRegulations = () => {
  return (
    <Box sx={{ mt: 4, px: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
        📄 Rules & Regulations
      </Typography>

      <Box
        sx={{
          // border: '2px solid #001f3f',
          borderRadius: 2,
          overflow: 'hidden',
          height: '80vh',
        }}
      >
        <iframe
          src="../assets/pdf/Rules.pdf" 
          title="Rules & Regulations PDF"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      </Box>
    </Box>
  );
};

export default RulesAndRegulations;
