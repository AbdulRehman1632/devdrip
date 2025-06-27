import AdminLeaveQueue from "../components/AdminLeaveQueue/AdminLeaveQueue";
import Dashboard from "../components/Dashboard/Dashboard";
import HelpDesk from "../components/HelpDesk/HelpDesk";
import LeaveForm from "../components/LeaveForm/LeaveForm";
import LoginForm from "../components/LoginForm/LoginForm";
import MyAttendance from "../components/MyAttendance/MyAttendance";
import PaidHolidays from "../components/PaidHolidays/PaidHolidays";
import Ratings from "../components/Ratings/Ratings";
import RulesAndRegulations from "../components/RulesAndRegulations/RulesAndRegulations";
import SignupForm from "../components/SignupForm/SignupForm";
import Tickets from "../components/Tickets/Tickets";
import UserDetails from "../components/UserDetails/UserDetails";
import YourPerformance from "../components/YourPerformance/YourPerformance";
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
    path: "/PaidHolidays",
    element: (
      <ProtectedRoute>
        <PaidHolidays />
      </ProtectedRoute>
    ),
  },
   {
    path: "/RulesAndRegulations",
    element: (
      <ProtectedRoute>
        <RulesAndRegulations/>
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
  ,
  {
    path:"/ratings/:userId",
    element:(<Ratings/>),
  },
  {
    path:"yourPerformance",
    element:(
       <ProtectedRoute>
    <YourPerformance/>
    </ProtectedRoute>
  ),
  },
  {
    path:"/Tickets",
    element:(
       <ProtectedRoute>
    <Tickets/>
    </ProtectedRoute>
  ),
  },
  {
    path:"/HelpDesk",
    element:(
       <ProtectedRoute>
    <HelpDesk/>
    </ProtectedRoute>
  ),
  }
]