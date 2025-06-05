import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection, getDocs, getFirestore, query, orderBy
} from 'firebase/firestore';
import { app } from '../../firebase';
import {
  Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Typography, Pagination
} from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const db = getFirestore(app);

  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const attendanceRef = collection(db, 'allUsers', userId, 'attendance');
        const q = query(attendanceRef, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAttendanceData(data);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [db, userId]);



  const getWorkingHours = (date, time, logoutTime) => {
  if (!time || !logoutTime) return '-';

  const start = new Date(`${date}T${time}`);
  const end = new Date(`${date}T${logoutTime}`);

  const diffMs = end - start;
  if (isNaN(diffMs) || diffMs <= 0) return '-';

  const totalMinutes = Math.floor(diffMs / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
};


const getDayName = (dateString) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(dateString);
  return isNaN(date) ? '-' : days[date.getDay()];
};


const totalDays = attendanceData.length;

const presentCount = attendanceData.filter(item => item.present === true).length;

const absentCount = attendanceData.filter(
  item => !item.present && !item.leave && getDayName(item.date) !== 'Sunday'
).length;

const leaveCount = attendanceData.filter(item => item.leave === true).length;

const totalWorkingMinutes = attendanceData.reduce((total, item) => {
  if (!item.time || !item.logoutTime) return total;

  const start = item.time.toDate ? item.time.toDate() : new Date(`${item.date}T${item.time}`);
  const end = item.logoutTime.toDate ? item.logoutTime.toDate() : new Date(`${item.date}T${item.logoutTime}`);

  const diffMinutes = (end - start) / (1000 * 60);
  return diffMinutes > 0 ? total + diffMinutes : total;
}, 0);

const totalHours = Math.floor(totalWorkingMinutes / 60);
const totalMinutes = Math.round(totalWorkingMinutes % 60);

const totalWorkingHoursFormatted = `${totalHours}h ${totalMinutes}m`;



// ======================export to excel========================================

  const handleExport = () => {
    const exportData = attendanceData.map((item, index) => ({
      Sno: index + 1,
      Date: item.date,
      ReportingTime: item.time?.toDate ? item.time.toDate().toLocaleTimeString() : item.time,
      Present: item.present ? 'Yes' : 'No'
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'attendance.xlsx');
  };

// ======================export to excel========================================


  const handlePageChange = (_, value) => {
    setPage(value);
  };

  const paginatedData = attendanceData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  if (loading) return <p>Loading attendance...</p>;

  return (
    <div style={{ marginTop: 20, maxWidth: 800, marginLeft: 'auto', marginRight: 'auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
 <Typography variant="h6">
  Attendance Details of{' '}
  <Typography component="span" sx={{ color: '#966819', fontWeight: 'bold',fontSize:"1.2em" }}>
    {userId.charAt(0).toUpperCase() + userId.slice(1)}
  </Typography>
</Typography>

  <Button
    variant="contained"
    color="secondary"
    onClick={() => navigate(-1)}
    sx={{ mb: 2, mx: 1 }}
  >
    Back to Dashboard
  </Button>

  <Button
    variant="contained"
    color="success"
    onClick={handleExport}
    sx={{ mb: 2, mx: 1 }}
  >
    Export to Excel
  </Button>
</div>

      {attendanceData.length === 0 ? (
        <p>No attendance data found.</p>
      ) : (
        <>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center', marginBottom: '24px' }}>
  <Paper elevation={3} sx={{ p: 2, minWidth: 150, textAlign: 'center' }}>
    <Typography variant="subtitle1">Total Days</Typography>
    <Typography variant="h6">{totalDays}</Typography>
  </Paper>
  <Paper elevation={3} sx={{ p: 2, minWidth: 150, textAlign: 'center' }}>
    <Typography variant="subtitle1">Present</Typography>
    <Typography variant="h6" color="green">{presentCount}</Typography>
  </Paper>
  <Paper elevation={3} sx={{ p: 2, minWidth: 150, textAlign: 'center' }}>
    <Typography variant="subtitle1">Absent</Typography>
    <Typography variant="h6" color="red">{absentCount}</Typography>
  </Paper>
  <Paper elevation={3} sx={{ p: 2, minWidth: 150, textAlign: 'center' }}>
    <Typography variant="subtitle1">Leave</Typography>
    <Typography variant="h6" color="orange">{leaveCount}</Typography>
  </Paper>
  <Paper elevation={3} sx={{ p: 2, minWidth: 180, textAlign: 'center' }}>
    <Typography variant="subtitle1">Working Hours</Typography>
    <Typography variant="h6">{totalWorkingHoursFormatted}</Typography>
  </Paper>
</div>


          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{fontWeight:"bold",fontSize:"1em"}}>S.No</TableCell>
                  <TableCell sx={{fontWeight:"bold",fontSize:"1em"}}>Date</TableCell>
                  <TableCell sx={{fontWeight:"bold", fontSize:"1em"}}>Day</TableCell>
                  <TableCell sx={{fontWeight:"bold",fontSize:"1em"}}>Reporting Time</TableCell>
                  <TableCell sx={{fontWeight:"bold",fontSize:"1em"}}>Off Time</TableCell>
                  <TableCell sx={{fontWeight:"bold",fontSize:"1em"}}>Working Hours</TableCell>
                  <TableCell sx={{fontWeight:"bold",fontSize:"1em"}}>Present</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((item, index) => (
                  // console.log(item.timestamp)

                  
                  <TableRow key={item.id}>
                    <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>{getDayName(item.date)}</TableCell>
                    <TableCell>
  {item.time ? (item.time.toDate ? item.time.toDate().toLocaleTimeString() : item.time) : '-'}
</TableCell>
<TableCell>
  {item.logoutTime ? (item.logoutTime.toDate ? item.logoutTime.toDate().toLocaleTimeString() : item.logoutTime) : '-'}
</TableCell>


<TableCell>
  {getWorkingHours(item.date, item.time, item.logoutTime)}
</TableCell>

                  <TableCell
  sx={{
    color:
      getDayName(item.date) === 'Sunday'
        ? 'blue'
        : item.present
        ? 'inherit'
        : item.leave
        ? 'orange'
        : 'red',
    fontWeight: getDayName(item.date) === 'Sunday' || item.present ? 'normal' : 'bold'
  }}
>
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
            onChange={handlePageChange}
            color="primary"
            sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
          />
        </>
      )}
    </div>
  );
};

export default UserDetails;
