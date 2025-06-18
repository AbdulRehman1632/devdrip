import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CelebrationIcon from '@mui/icons-material/Celebration';
import EventIcon from '@mui/icons-material/Event';

const paidHolidays = [
  { name: 'New Year', date: 'Jan 1st' },
  { name: 'Christmas', date: 'Dec 25th' },
  { name: 'Thanksgiving', date: 'Nov 28th' },
  { name: 'Independence Day (USA)', date: 'July 4th' },
  { name: 'Easter', date: 'Based on moon sighting' },
  { name: 'Eid al-Fitr', date: '1st Day of Eid' },
  { name: 'Eid al-Adha', date: '1st Day of Eid' },
  { name: 'Ashura', date: '1st & 10th Muharram' },
];

const PaidHolidays = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ mt: 4, px: { xs: 1, sm: 2, md: 4 } }}>
      <Typography
        variant={isXs ? 'h5' : 'h4'}
        align="center"
        sx={{
          fontWeight: 'bold',
          mb: 4,
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
        }}
      >
        🎉 Official Paid Holidays
      </Typography>

      <Grid container spacing={3}>
        {paidHolidays.map((holiday, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                backgroundColor: 'transparent',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
                  <CelebrationIcon sx={{ color: '#FFD700' }} />
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ wordBreak: 'break-word',letterSpacing:"0.8px", }}
                  >
                    {holiday.name}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1, borderColor: 'rgba(0,0,0,0.2)' }} />

                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <EventIcon sx={{ color: '#87CEFA' }} />
                  <Chip
                    label={holiday.date}
                    variant="outlined"
                    sx={{
                      // border: '2px solid #87CEFA',
                      border: 'none',
                      background: 'rgba(255,255,255,0.1)',
                      fontWeight: 'bold',
                      letterSpacing:"0.8px"
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PaidHolidays;
