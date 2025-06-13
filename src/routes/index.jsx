import AdminLeaveQueue from "../components/AdminLeaveQueue/AdminLeaveQueue";
import Dashboard from "../components/Dashboard/Dashboard";
import LeaveForm from "../components/LeaveForm/LeaveForm";
import LoginForm from "../components/LoginForm/LoginForm";
import MyAttendance from "../components/MyAttendance/MyAttendance";
import SignupForm from "../components/SignupForm/SignupForm";
import UserDetails from "../components/UserDetails/UserDetails";
import ProtectedRoute from "../utils/constant/ProtectedRoute/ProtectedRoutes";


export const routes =[
    {
        path:"/",
         element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    },
    {
        path:"/SignUp",
        element:<SignupForm/>,
    },
    {
        path:"/Login",
        element:<LoginForm/>,
    },
  {
    path: "/MyAttendance",
    element: (
      <ProtectedRoute>
        <MyAttendance />
      </ProtectedRoute>
    ),
  },
      {
    path: "/Dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/LeaveForm",
    element: (
      <ProtectedRoute>
        <LeaveForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/AdminLeaveQueue",
    element: (
      <ProtectedRoute>
        < AdminLeaveQueue/>
      </ProtectedRoute>
    ),
  },
  {
    path:"/user/:userId",
    element:(<UserDetails/>),
  }
]