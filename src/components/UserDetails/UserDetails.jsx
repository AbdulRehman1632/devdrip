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
  DialogActions,
  Tooltip,
  Modal,
  IconButton
} from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';


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
    const [leavePage, setLeavePage] = useState(1);
  const leaveRowsPerPage = 8;
  const [leaveByType, setLeaveByType] = useState({ Annual: 0, Casual: 0, Sick: 0 });
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);






//  ================================= types of leave start================================
  

  const leaveLimits = {
  Annual: 15,
  Casual: 9,
  Sick: 8,
};

const categorizeLeaves = (data) => {
  const types = { Annual: 0, Casual: 0, Sick: 0 };

  data.forEach((item) => {
    if (item.leave === true && item.leaveType) {
      const type = item.leaveType.split(' ')[0]; 
      if (types[type] !== undefined) {
        types[type]++;
      }
    }
  });

  return types; // returns used leave counts
};

  
    const handleLeaveModalOpen = () => {
    const categorized = categorizeLeaves(attendanceData);
    setLeaveByType(categorized);
    setLeaveModalOpen(true);
  };


  
const leaveDetails = attendanceData.filter(item => item.leave === true);

//  ================================= types of leave end================================

 
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



  // =====================================Holiday Start============================================

  
  const [customHolidayDates, setCustomHolidayDates] = useState([]);
  
    useEffect(() => {
      const fetchHolidays = async () => {
        try {
          const snapshot = await getDocs(collection(db, "holidays"));
          const dates = snapshot.docs.map(doc => doc.data().date); // assuming "date" is string like "2025-06-21"
          setCustomHolidayDates(dates);
        } catch (error) {
          console.error("Error fetching holidays:", error);
        }
      };
  
      fetchHolidays();
    }, []);
  
  
    const isCustomHoliday = (dateStr) => {
    return customHolidayDates.includes(dateStr);
  };
  

  // =====================================Holiday end============================================


// ======================================Search Data Start===============================================


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
  
  // ======================================Search Data end===============================================

  

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

  // const totalWorkingMinutes = filteredData.reduce((total, item) => {
  //   if (!item.time || !item.logoutTime) return total;

  //   let start, end;
  //   if (item.time.toDate && item.logoutTime.toDate) {
  //     start = item.time.toDate();
  //     end = item.logoutTime.toDate();
  //   } else {
  //     start = new Date(`${item.date}T${item.time}`);
  //     end = new Date(`${item.date}T${item.logoutTime}`);
  //   }

  //   const diffMinutes = (end - start) / (1000 * 60);
  //   return diffMinutes > 0 ? total + diffMinutes : total;
  // }, 0);

  // const totalHours = Math.floor(totalWorkingMinutes / 60);
  // const totalMinutes = Math.round(totalWorkingMinutes % 60);
  // const totalWorkingHoursFormatted = `${totalHours}h ${totalMinutes}m`;


// ===========================================Working Hours Start ================================================


  const totalWorkingMinutes = filteredData.reduce((total, item) => {
  if (!item.time || !item.logoutTime) return total;

  let start, end;

  if (item.time.toDate && item.logoutTime.toDate) {
    start = item.time.toDate();
    end = item.logoutTime.toDate();
  } else {
    start = new Date(`${item.date}T${item.time}`);
    end = new Date(`${item.date}T${item.logoutTime}`);

    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }
  }

  const diffMinutes = (end - start) / (1000 * 60);
  return diffMinutes > 0 ? total + diffMinutes : total;
}, 0);

const totalHours = Math.floor(totalWorkingMinutes / 60);
  const totalMinutes = Math.round(totalWorkingMinutes % 60);
  const totalWorkingHoursFormatted = `${totalHours}h ${totalMinutes}m`;



// ===========================================Working Hours End ================================================


    
  //   const getWorkingHours = (date, time, logoutTime) => {
  //   let start, end;

  //   if (!time || !logoutTime) return '-';

  //   if (time.toDate && logoutTime.toDate) {
  //     start = time.toDate();
  //     end = logoutTime.toDate();
  //   } else {
  //     start = new Date(`${date}T${time}`);
  //     end = new Date(`${date}T${logoutTime}`);
  //   }

  //   const diffMs = end - start;
  //   if (isNaN(diffMs) || diffMs <= 0) return '-';

  //   const totalMinutes = Math.floor(diffMs / 1000 / 60);
  //   const hours = Math.floor(totalMinutes / 60);
  //   const minutes = totalMinutes % 60;

  //   return `${hours}h ${minutes}m`;
  // };

// ===========================================getting hours and status Start================================

const getWorkingHours = (date, time, logoutTime) => {
  let start, end;

  if (!time || !logoutTime) return '-';

  if (typeof time === 'object' && time.toDate && typeof logoutTime === 'object' && logoutTime.toDate) {
    start = time.toDate();
    end = logoutTime.toDate();
  }
 
  else {
    start = new Date(`${date}T${time}`);
    end = new Date(`${date}T${logoutTime}`);

    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }
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


// ===========================================getting hours and status Start================================



// ======================================== MS Excel Export start===================================


const handleExport = () => {
  const exportData = filteredData.map((item, index) => {
    let loginDateTime;
    if (item.time?.toDate) {
      loginDateTime = item.time.toDate();
    } else if (item.time) {
      loginDateTime = new Date(`${item.date}T${item.time}`);
    }

    let logoutDateTime;
    if (item.logoutTime?.toDate) {
      logoutDateTime = item.logoutTime.toDate();
    } else if (item.logoutTime) {
      logoutDateTime = new Date(`${item.date}T${item.logoutTime}`);
    }

    const time = loginDateTime ? loginDateTime.toLocaleTimeString() : "-";
    const logoutTime = logoutDateTime ? logoutDateTime.toLocaleTimeString() : "-";

    let workingHours = "-";
    let numericHours = null;
    if (loginDateTime && logoutDateTime) {
      const diffMs = logoutDateTime - loginDateTime;
      if (!isNaN(diffMs) && diffMs > 0) {
        const totalMinutes = Math.floor(diffMs / 1000 / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        workingHours = `${hours}h ${minutes}m`;
        numericHours = hours + minutes / 60;
      }
    }

    let workingStatus = "-";
    if (numericHours !== null && !isNaN(numericHours)) {
      workingStatus = numericHours >= 7 ? "Completed" : "Early Going";
    }

    const name = userId?.charAt(0).toUpperCase() + userId?.slice(1);

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
      "Working Status": workingStatus,
      Present: presentStatus,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'attendance.xlsx');
};



// ======================================== MS Excel Export end===================================




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




// ================================Month name and month data start===========================



const getMonthName = (monthStr) => {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const monthIndex = parseInt(month, 10) - 1;
  const date = new Date(year, monthIndex); 
  return `${date.toLocaleString('default', { month: 'long' })} ${year}`;
};




const filteredMonthData = filteredData.filter((item) => {
  const itemMonthStr = item.date?.slice(0, 7); 
  return itemMonthStr === selectedMonth;
});

const monthStats = {
  Present: 0,
  Absent: 0,
  Leave: 0,
  Holiday: 0,
};

filteredMonthData.forEach((item) => {
  const dayName = new Date(item.date).toLocaleDateString('en-US', { weekday: 'long' });

  if (dayName === 'Sunday') {
    monthStats.Holiday++;
  } else if (item.leave) {
    monthStats.Leave++;
  } else if (item.present) {
    monthStats.Present++;
  } else {
    monthStats.Absent++;
  }
});



const pieData = [
  { name: 'Present', value: monthStats.Present },
  { name: 'Absent', value: monthStats.Absent },
  { name: 'Leave', value: monthStats.Leave },
  { name: 'Holiday', value: monthStats.Holiday }
];


const COLORS = ['#4caf50', '#f44336', '#ff9800', '#2196f3']; 
// Present, Absent, Leave, Holiday



useEffect(() => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  setSelectedMonth(`${year}-${month}`);
}, []);

// ================================Month name and month data end===========================








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
            {/* <Paper elevation={3} sx={{ p: 2, minWidth: 140, textAlign: 'center',backgroundColor: 'transparent',  }}>
              <Typography variant="subtitle1">Leave</Typography>
              <Typography variant="h6" color="warning.main">{leaveCount}</Typography>
            </Paper> */}

            <Paper
  elevation={3}
onClick={handleLeaveModalOpen}
  sx={{
    p: 2,
    minWidth: 140,
    textAlign: 'center',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  }}
>
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

                    
                                {/* <TableCell
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
</TableCell> */}

  <TableCell sx={{
  color:
    getDayName(item.date) === "Sunday" || isCustomHoliday(item.date)
      ? "#3388FF"
      : item.present
      ? "inherit"
      : item.leave
      ? "orange"
      : "red",
  fontWeight: item.present ? "normal" : "bold",
}}>
  {getDayName(item.date) === "Sunday" || isCustomHoliday(item.date)
    ? "Holiday"
    : item.present
    ? "Yes"
    : item.leave
    ? "Leave"
    : "No"}
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

  <Box sx={{ mt: 4 }}>
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={pieData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
        fill="#8884d8"
        label
      >
        {pieData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      {/* <Tooltip /> */}
      <Legend />
    </PieChart>
  </ResponsiveContainer>
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




<Dialog
  open={leaveModalOpen}
  onClose={() => setLeaveModalOpen(false)}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 3,
      p: 2,
      // background: '#fefefe',
    },
  }}
>
  <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography variant="h6">📋 Leave Summary</Typography>
    <IconButton onClick={() => setLeaveModalOpen(false)}>
      {/* <CloseIcon /> */}
    </IconButton>
  </DialogTitle>

  <DialogContent>
    {/* Leave Boxes */}
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 2,
        flexWrap: 'wrap',
        mt: 1,
        mb: 3,
      }}
    >
      {Object.keys(leaveLimits).map((type) => (
        <Paper
          key={type}
          elevation={4}
          sx={{
            p: 2,
            minWidth: 160,
            textAlign: 'center',
            borderRadius: 2,
            // background: '#f5f5f5',
          }}
        >
          <Typography sx={{color:"red",fontWeight:"bold"}} variant="subtitle2" color="text.secondary" mb={1}>
            {type} Leave
          </Typography>
          <Typography variant="h5" color="primary">
                      <span style={{ color: 'gray' }}>       {leaveByType[type] || 0}</span>  
             /  { leaveLimits[type]}
                            </Typography>
        </Paper>
      ))}
    </Box>

    {/* Leave Table */}
    {leaveDetails.length > 0 ? (
      <Box sx={{ overflowX: 'auto' }}>
        <Typography variant="subtitle1" mb={1}>📅 Leave Dates:</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Leave Type</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaveDetails
              .slice((leavePage - 1) * leaveRowsPerPage, leavePage * leaveRowsPerPage)
              .map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.leaveType}</TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
    
        <Pagination
          count={Math.ceil(leaveDetails.length / leaveRowsPerPage)}
          page={leavePage}
          onChange={(_, value) => setLeavePage(value)}
          sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
        />
      </Box>
    ) : (
      <Typography color="text.secondary" align="center">No leave records found.</Typography>
    )}
  </DialogContent>
</Dialog> 



        </>
      )}
    </div>
  );
};

export default UserDetails;

