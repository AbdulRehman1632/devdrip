import React, { useEffect, useState } from 'react';
import {
  collection, getDocs, getFirestore, query, orderBy
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../firebase';
import {
  Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Pagination
} from '@mui/material';


const MyAttendance = () => {
    const db = getFirestore(app);
  const auth = getAuth(app);

  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const fetchAttendance = async (username) => {
  setLoading(true);
  try {
    const attendanceRef = collection(db, 'allUsers', username, 'attendance');
    // const q = query(attendanceRef, orderBy('timestamp', 'desc'));
            const q = query(attendanceRef, orderBy('date'));
    
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setAttendanceData(data);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    setAttendanceData([]);
  } finally {
    setLoading(false);
  }
};
 useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
    
      if (user.displayName) {
        fetchAttendance(user.displayName);  
      } else {
        console.error('User does not have a displayName');
        setAttendanceData([]);
        setLoading(false);
      }
    } else {
      console.log('No user logged in');
      setAttendanceData([]);
      setLoading(false);
    }
  });
  return () => unsubscribe();
}, [auth]);



const getDayName = (dateString) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(`${dateString}T00:00:00`);
  return isNaN(date) ? '-' : days[date.getDay()];
};

const getWorkingHours = (date, time, logoutTime) => {
  if (!time || !logoutTime) return '-';

  // Construct proper datetime strings
  const start = new Date(`${date}T${time}`);
  const end = new Date(`${date}T${logoutTime}`);

  const diffMs = end - start;
  if (isNaN(diffMs) || diffMs <= 0) return '-';

  const totalMinutes = Math.floor(diffMs / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
};

const getWorkingStatus = (hours) => {
  if (hours === '-' || hours === undefined || hours === null) {
    return { label: '-', color: 'inherit' };
  }

  const numericHours = typeof hours === 'string' ? parseFloat(hours) : hours;

  if (numericHours >= 7) {
    return { label: 'Completed', color: 'green' };
  } else {
    return { label: 'Early Going', color: 'orange' };
  }
};


  const totalWorkingMinutes = attendanceData.reduce((total, item) => {
    if (!item.time || !item.logoutTime) return total;
    const start = item.time.toDate ? item.time.toDate() : new Date(`${item.date}T${item.time}`);
    const end = item.logoutTime.toDate ? item.logoutTime.toDate() : new Date(`${item.date}T${item.logoutTime}`);
    const diffMins = (end - start) / (1000 * 60);
    return diffMins > 0 ? total + diffMins : total;
  }, 0);

  const totalHours = Math.floor(totalWorkingMinutes / 60);
  const totalMinutes = Math.round(totalWorkingMinutes % 60);

  
  const paginatedData = attendanceData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: 900, margin: 'auto', marginTop: 30, padding: '0 16px', width: '100%' }}>
  <Typography sx={{ fontSize:"1.8em"}} variant="h5" align="center" gutterBottom>
    My Attendance
  </Typography>

  {attendanceData.length === 0 ? (
    <Typography>No attendance data found.</Typography>
  ) : (
    <>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <Paper sx={{ p: 2, flex: '1 1 150px', textAlign: 'center',backgroundColor: 'transparent' }}>
          <Typography sx={{fontWeight:"bold",letterSpacing:"0.6px"}} variant="subtitle2">Total Days</Typography>
          <Typography variant="h6">{attendanceData.length}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: '1 1 150px', textAlign: 'center',backgroundColor: 'transparent',  }}>
          <Typography sx={{fontWeight:"bold",letterSpacing:"0.6px"}} variant="subtitle2">Present</Typography>
          <Typography variant="h6" color="green">
            {attendanceData.filter(i => i.present).length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: '1 1 150px', textAlign: 'center',backgroundColor: 'transparent',  }}>
          <Typography sx={{fontWeight:"bold",letterSpacing:"0.6px"}} variant="subtitle2">Absent</Typography>
          <Typography variant="h6" color="red">
            {attendanceData.filter(i => !i.present && !i.leave && getDayName(i.date) !== 'Sunday').length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: '1 1 150px', textAlign: 'center',backgroundColor: 'transparent',  }}>
          <Typography sx={{fontWeight:"bold",letterSpacing:"0.6px"}} variant="subtitle2">Leave</Typography>
          <Typography variant="h6" color="orange">
            {attendanceData.filter(i => i.leave).length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: '1 1 180px', textAlign: 'center', backgroundColor: 'transparent',  }}>
          <Typography sx={{fontWeight:"bold",letterSpacing:"0.6px"}} variant="subtitle2">Total Working Hours</Typography>
          <Typography variant="h6">{`${totalHours}h ${totalMinutes}m`}</Typography>
        </Paper>
      </div>

      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{fontSize:"1em",fontWeight:"bold"}}>S.No</TableCell>
              <TableCell sx={{fontSize:"1em",fontWeight:"bold"}}>Date</TableCell>
              <TableCell sx={{fontSize:"1em",fontWeight:"bold"}}>Day</TableCell>
              <TableCell sx={{fontSize:"1em" , fontWeight:"bold"}}>Login</TableCell>
              <TableCell sx={{fontSize:"1em",fontWeight:"bold"}}>Logout</TableCell>
              <TableCell sx={{fontSize:"1em",fontWeight:"bold"}}>Working Hours</TableCell>
              <TableCell sx={{fontSize:"1em",fontWeight:"bold"}}>Working Status</TableCell>
              <TableCell sx={{fontSize:"1em",fontWeight:"bold"}}>Present</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell>{getDayName(item.date)}</TableCell>
                 {/* <TableCell>
  {item.timestamp?.toDate
    ? item.timestamp.toDate().toLocaleTimeString()
    : item.timestamp || '-'}
</TableCell>

<TableCell>
  {item.logoutTime
    ? new Date(`${item.date}T${item.logoutTime}`).toLocaleTimeString()
    : '-'}
</TableCell> */}


            <TableCell>
  {(item.present && !item.leave && item.timestamp?.toDate)
    ? item.timestamp.toDate().toLocaleTimeString()
    : '-'}
</TableCell>

<TableCell>
  {(item.present && !item.leave && item.logoutTime)
    ? new Date(`${item.date}T${item.logoutTime}`).toLocaleTimeString()
    : '-'}
</TableCell>


                <TableCell>{getWorkingHours(item.date, item.time, item.logoutTime)}</TableCell>

                 <TableCell>
                  {(() => {
                    const hours = getWorkingHours(item.date, item.time, item.logoutTime);
                    const { label, color } = getWorkingStatus(hours);
                
                    return <span style={{ color, fontWeight: 'bold' }}>{label}</span>;
                  })()}
                </TableCell>
                
                <TableCell sx={{
                  color: getDayName(item.date) === 'Sunday'
                    ? '#3388FF'
                    : item.present
                    ? 'inherit'
                    : item.leave
                    ? 'orange'
                    : 'red',
                  fontWeight: item.present ? 'normal' : 'bold'
                }}>
                  {getDayName(item.date) === 'Sunday'
                    ? 'Holiday'
                    : item.present
                    ? 'Yes'
                    : item.leave
                    ? 'Leave'
                    : 'No'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        count={Math.ceil(attendanceData.length / rowsPerPage)}
        page={page}
        onChange={(_, value) => setPage(value)}
        sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
      />
    </>
  )}
</div>

  );
};

export default MyAttendance;
