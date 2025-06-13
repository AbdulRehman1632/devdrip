import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  getDocs,
  getFirestore,
  query,
  orderBy,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { app } from '../../firebase';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Pagination,
  TextField,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const db = getFirestore(app);

  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(''); 
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const rowsPerPage = 8;

 
  const months = [
    { label: 'January', value: '01' },
    { label: 'February', value: '02' },
    { label: 'March', value: '03' },
    { label: 'April', value: '04' },
    { label: 'May', value: '05' },
    { label: 'June', value: '06' },
    { label: 'July', value: '07' },
    { label: 'August', value: '08' },
    { label: 'September', value: '09' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' }
  ];
  

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const attendanceRef = collection(db, 'allUsers', userId, 'attendance');
        const q = query(attendanceRef, orderBy('date'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAttendanceData(data);
        setAllData(data);
        setFilteredData(data);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [db, userId]);

  const getDayName = (dateString) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(`${dateString}T00:00:00`);
    return isNaN(date) ? '-' : days[date.getDay()];
  };


  useEffect(() => {
    let filtered = allData;

 
    if (selectedMonth) {

      filtered = filtered.filter(item => {
        if (!item.date) return false;
        return item.date.startsWith(selectedMonth);
      });
    }

    
    if (searchText.trim() !== '') {
      const keywords = searchText
        .split(',')
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length > 0);

      filtered = filtered.filter(row => {
        const dayName = getDayName(row.date)?.toLowerCase() || '';
        const date = String(row.date || '').toLowerCase();
        const time = row.time?.toDate
          ? row.time.toDate().toLocaleTimeString().toLowerCase()
          : String(row.time || '').toLowerCase();
        const logoutTime = row.logoutTime?.toDate
          ? row.logoutTime.toDate().toLocaleTimeString().toLowerCase()
          : String(row.logoutTime || '').toLowerCase();
        const city = String(row.city || '').toLowerCase();

        const statusText =
          dayName === 'sunday'
            ? 'holiday'
            : row.present
            ? 'yes'
            : row.leave
            ? 'leave'
            : 'no';

        return keywords.some(keyword =>
          dayName.includes(keyword) ||
          date.includes(keyword) ||
          time.includes(keyword) ||
          logoutTime.includes(keyword) ||
          city.includes(keyword) ||
          statusText.includes(keyword)
        );
      });
    }

    setFilteredData(filtered);
    setPage(1); 
  }, [searchText, selectedMonth, allData]);

  const handlePageChange = (_, value) => {
    setPage(value);
  };

  const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const totalDays = filteredData.length;

  const presentCount = filteredData.filter(item => item.present === true).length;

  const absentCount = filteredData.filter(
    item => !item.present && !item.leave && getDayName(item.date) !== 'Sunday'
  ).length;

  const leaveCount = filteredData.filter(item => item.leave === true).length;

  const totalWorkingMinutes = filteredData.reduce((total, item) => {
    if (!item.time || !item.logoutTime) return total;

    let start, end;
    if (item.time.toDate && item.logoutTime.toDate) {
      start = item.time.toDate();
      end = item.logoutTime.toDate();
    } else {
      start = new Date(`${item.date}T${item.time}`);
      end = new Date(`${item.date}T${item.logoutTime}`);
    }

    const diffMinutes = (end - start) / (1000 * 60);
    return diffMinutes > 0 ? total + diffMinutes : total;
  }, 0);

  const totalHours = Math.floor(totalWorkingMinutes / 60);
  const totalMinutes = Math.round(totalWorkingMinutes % 60);
  const totalWorkingHoursFormatted = `${totalHours}h ${totalMinutes}m`;




  
  const getWorkingHours = (date, time, logoutTime) => {
  let start, end;

  if (!time || !logoutTime) return '-';

  if (time.toDate && logoutTime.toDate) {
    start = time.toDate();
    end = logoutTime.toDate();
  } else {
    start = new Date(`${date}T${time}`);
    end = new Date(`${date}T${logoutTime}`);
  }

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




const handleExport = () => {
  const exportData = filteredData.map((item, index) => {
    const timeDate = item.time?.toDate?.();         // proper toDate check
    const logoutDate = item.logoutTime?.toDate?.(); // proper toDate check

    const time = timeDate ? timeDate.toLocaleTimeString() : "-";
    const logoutTime = logoutDate ? logoutDate.toLocaleTimeString() : "-";

    let workingHours = "-";
    if (timeDate && logoutDate) {
      const diffMs = logoutDate - timeDate;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      workingHours = `${hours}h ${minutes}m`;
    }

    const name = userId.charAt(0).toUpperCase() + userId.slice(1);

    // ✅ Leave / Present Logic
    let presentStatus = "No";
    if (item.leave) {
      presentStatus = "Leave";
    } else if (item.present) {
      presentStatus = "Yes";
    }

    return {
      Sno: index + 1,
      Name: name || "-",
      Date: item.date || "-",
      ReportingTime: time,
      Logout: logoutTime,
      "Working Hours": workingHours,
      Present: presentStatus,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'attendance.xlsx');
};






const openDeleteDialog = () => {
  if (!selectedMonth) return;
  setDeleteDialogOpen(true);
};

const confirmDeleteMonthData = async () => {
  setDeleteDialogOpen(false);
  try {
    const monthDocs = attendanceData.filter((item) =>
      item.date?.startsWith(selectedMonth)
    );
    for (const docItem of monthDocs) {
      await deleteDoc(doc(db, 'allUsers', userId, 'attendance', docItem.id));
    }

    const remainingData = attendanceData.filter(
      (item) => !item.date?.startsWith(selectedMonth)
    );
    setAttendanceData(remainingData);
    setAllData(remainingData);
    toast.success("Attendance data deleted successfully.");
  } catch (err) {
    console.error("Error deleting month data:", err);
    toast.error("Failed to delete data.");
  }
};


const getMonthName = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const monthIndex = parseInt(month, 10) - 1;
  const date = new Date(year, monthIndex); 
  return `${date.toLocaleString('default', { month: 'long' })} ${year}`;
};




useEffect(() => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  setSelectedMonth(`${year}-${month}`);
}, []);

  if (loading) return <p>Loading attendance...</p>;

  return (
    <div style={{ marginTop: 20, maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>
      <Typography variant="h6" sx={{ marginBottom: "15px", fontSize: "1.3em", textAlign: 'center' }}>
        Attendance Details of{' '}
        <Typography component="span" sx={{ color: '#966819', fontWeight: 'bold', fontSize: "1.2em" }}>
          {userId.charAt(0).toUpperCase() + userId.slice(1)}
        </Typography>
      </Typography>

    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
  <Button sx={{fontWeight:"bold"}} variant="contained" color="secondary" onClick={() => navigate(-1)}>
    Back to Dashboard
  </Button>

  <Button sx={{fontWeight:"bold"}} variant="contained" color="success" onClick={handleExport}>
    Export to Excel
  </Button>

  <FormControl sx={{ minWidth: 180 }}>
    <InputLabel id="month-select-label">Filter by Month</InputLabel>
    <Select
      labelId="month-select-label"
      id="month-select"
      value={selectedMonth}
      label="Filter by Month"
      onChange={(e) => setSelectedMonth(e.target.value)}
    >
      <MenuItem value="">All Months</MenuItem>
      {months.map(({ label, value }) => (
        <MenuItem key={value} value={`${currentYear}-${value}`}>
          {label} {currentYear}
        </MenuItem>
      ))}
    </Select>
  </FormControl>

  <TextField
    label="Search Fields Here"
    value={searchText}
    onChange={e => setSearchText(e.target.value)}
    sx={{ minWidth: 250 }}
  />

  {/* 🗑 Delete Month Data Button */}
  {selectedMonth && (
    <Button 
      variant="contained"
      color="error"
       onClick={openDeleteDialog}
    >
      Delete {getMonthName(selectedMonth)} Data
    </Button>
  )}
</Box>


      {filteredData.length === 0 ? (
        <Typography sx={{ textAlign: 'center', mt: 4 }}>No attendance data found for selected filters.</Typography>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Paper elevation={3} sx={{ p: 2, minWidth: 140, textAlign: 'center',backgroundColor: 'transparent',  }}>
              <Typography variant="subtitle1">Total Days</Typography>
              <Typography variant="h6">{totalDays}</Typography>
            </Paper>
            <Paper elevation={3} sx={{ p: 2, minWidth: 140, textAlign: 'center',backgroundColor: 'transparent',  }}>
              <Typography variant="subtitle1">Present</Typography>
              <Typography variant="h6" color="green">{presentCount}</Typography>
            </Paper>
            <Paper elevation={3} sx={{ p: 2, minWidth: 140, textAlign: 'center',backgroundColor: 'transparent',  }}>
              <Typography variant="subtitle1">Absent</Typography>
              <Typography variant="h6" color="error">{absentCount}</Typography>
            </Paper>
            <Paper elevation={3} sx={{ p: 2, minWidth: 140, textAlign: 'center',backgroundColor: 'transparent',  }}>
              <Typography variant="subtitle1">Leave</Typography>
              <Typography variant="h6" color="warning.main">{leaveCount}</Typography>
            </Paper>
            <Paper elevation={3} sx={{ p: 2, minWidth: 140, textAlign: 'center',backgroundColor: 'transparent',  }}>
              <Typography variant="subtitle1">Working Hours</Typography>
              <Typography variant="h6" color='aqua'>{totalWorkingHoursFormatted}</Typography>
            </Paper>

            
          </Box>

          <TableContainer >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>S.No</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Day</TableCell>
                  <TableCell>Reporting Time</TableCell>
                  <TableCell>Logout Time</TableCell>
                  <TableCell>Working Hours</TableCell>
                  <TableCell>Working Status</TableCell>
                  <TableCell>Present</TableCell>
          
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
</TableCell>
            */}

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


                     <TableCell>
   {getWorkingHours(item.date, item.time, item.logoutTime)}
 </TableCell>

 <TableCell>
  {(() => {
    const hours = getWorkingHours(item.date, item.time, item.logoutTime);
    const { label, color } = getWorkingStatus(hours);

    return <span style={{ color, fontWeight: 'bold' }}>{label}</span>;
  })()}
</TableCell>

                    
                                <TableCell
  sx={{
    color:
      getDayName(item.date) === 'Sunday'
        ? '#3388FF'
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

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={Math.ceil(filteredData.length / rowsPerPage)}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>

          <Dialog
  open={deleteDialogOpen}
  onClose={() => setDeleteDialogOpen(false)}
>
  <DialogTitle>Delete Confirmation</DialogTitle>
  <DialogContent>
    <Typography>
      Are you sure you want to delete all attendance records for <strong>{getMonthName(selectedMonth)}</strong>?
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
    <Button onClick={confirmDeleteMonthData} color="error" variant="contained">
      Delete
    </Button>
  </DialogActions>
</Dialog>

        </>
      )}
    </div>
  );
};

export default UserDetails;

