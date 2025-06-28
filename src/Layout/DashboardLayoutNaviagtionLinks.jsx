import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { createTheme } from '@mui/material/styles';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { DemoProvider, useDemoRouter } from '@toolpad/core/internal';
import { useNavigate } from 'react-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useState } from 'react';
import { AppProvider } from '@toolpad/core/AppProvider';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import HolidayVillageIcon from '@mui/icons-material/HolidayVillage';
import RuleIcon from '@mui/icons-material/Rule';
import GradeIcon from '@mui/icons-material/Grade';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import { Badge } from '@mui/material';
import { useTicketContext } from '../utils/constant/TicketContext/TicketContext';
import { useLeaveContext } from '../utils/constant/LeaveContext/LeaveContext';


export  const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        primary: {
          main: '#000',
        },
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        primary: {
          main: '#fff',
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});


function DemoPageContent({ pathname }) {
  return (
    <Box
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Typography>Dashboard content for {pathname}</Typography>
    </Box>
  );
}

DemoPageContent.propTypes = {
  pathname: PropTypes.string.isRequired,
};

// DashboardLayoutNavigationLinks.jsx
function DashboardLayoutNavigationLinks({ children, window }) {
    const navigate = useNavigate(); 
  const demoWindow = window !== undefined ? window() : undefined;
  const [currentUser,setCurrentUser]=useState(null)

  const handleNavClick = (segment) => {
    navigate(`/${segment}`); // e.g., /dashboard, /summary
  };


   useEffect(() => {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) setCurrentUser(user);
      });
      
      return () => unsubscribe();
    }, []);

    const { pendingCount } = useTicketContext()
    const { leaveCount } = useLeaveContext();


  return (
    <DemoProvider window={demoWindow}>
      <AppProvider
        navigation={[
          {
            segment: 'Dashboard',
            title: 'Dashboard',
            icon: <DashboardIcon />,
            onClick: () => handleNavClick('Dashboard'),
          },
           ...(currentUser?.email !== "info@conceptax.com"
      ? [
           {
            segment: 'LeaveForm',
            title: 'LeaveForm',
            icon: <InsertDriveFileIcon />,
            onClick: () => handleNavClick('LeaveForm'),
          },
        {
            segment: 'MyAttendance',
            title: 'MyAttendance',
            icon: <ContactEmergencyIcon />,
            onClick: () => handleNavClick('MyAttendance'),
          },
        {
            segment: 'PaidHolidays',
            title: 'Paid Holidays',
            icon: <HolidayVillageIcon />,
            onClick: () => handleNavClick('PaidHolidays'),
          },
          {
            segment: 'YourPerformance',
            title: 'Your Performance',
            icon: <GradeIcon />,
            onClick: () => handleNavClick('yourPerformance'),
          },
         {
            segment: 'RulesAndRegulations',
            title: 'Rules and Regulations',
            icon: <RuleIcon />,
            onClick: () => handleNavClick('RulesAndRegulations'),
          },
        {
            segment: 'Tickets',
            title: 'Tickets',
            icon: <ConfirmationNumberIcon />,
            onClick: () => handleNavClick('Tickets'),
          },]

      : []),
          
           ...(currentUser?.email === "info@conceptax.com"
      ? [{
          segment: 'AdminLeaveQueue',
          title: 'AdminLeaveQueue',
          icon:  <Badge badgeContent={leaveCount > 0 ? leaveCount : null} color="error">
      <AdminPanelSettingsIcon />
    </Badge>,
          onClick: () => handleNavClick('AdminLeaveQueue'),
        },
      {
            segment: 'PaidHolidays',
            title: 'Paid Holidays',
            icon: <HolidayVillageIcon />,
            onClick: () => handleNavClick('PaidHolidays'),
          },
         {
            segment: 'RulesAndRegulations',
            title: 'Rules and Regulations',
            icon: <RuleIcon />,
            onClick: () => handleNavClick('RulesAndRegulations'),
          },
        {
            segment: 'HelpDesk',
            title: 'Help Desk',
            icon:  <Badge badgeContent={pendingCount > 0 ? pendingCount : null} color="error">
      <ContactSupportIcon />
    </Badge>,
            onClick: () => handleNavClick('HelpDesk'),
          }]
      : [])
        ]}
        router={undefined}
        theme={demoTheme}
        window={demoWindow}
         branding={{
    title: 
    // (
      // <Typography sx={{ color: '#966819', fontWeight: 'bold' }}   onClick={() => navigate('/Dashboard')}>
        "Conceptax Attendance",
      // </Typography>
    // ),
    logo: <span style={{ display: 'none' }}></span>
  }}
      >
        <DashboardLayout>
          <Box sx={{ p: 2 }}>{children}</Box>
        </DashboardLayout>
      </AppProvider>
    </DemoProvider>
  );
}

DashboardLayoutNavigationLinks.propTypes = {
  window: PropTypes.func,
  children: PropTypes.node,
};

export default DashboardLayoutNavigationLinks;