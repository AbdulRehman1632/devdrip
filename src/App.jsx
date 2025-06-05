// import { Route, Routes } from "react-router"
// import { routes } from "./routes"

// const App = () => {
//   return (
//     <div>
//       <Routes>
//         {
//           routes.map((item,index)=>{
//             return(
//               <Route key={index} path={item?.path} element={item?.element} />
//             )
//           })
//         }
//       </Routes>
      
      
//     </div>
//   )
// }

// export default App



import { Route, Routes } from "react-router";
import { routes } from "./routes";
import DashboardLayoutNavigationLinks from "./Layout/DashboardLayoutNaviagtionLinks";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';



const App = () => {
  return (
    <div>
      <Routes>
        {routes.map((item, index) => {
          const routeElement = item.element;
          const needsLayout = ["/Dashboard","/user/:userId","/LeaveForm","/AdminLeaveQueue","/","/MyAttendance"].includes(item.path);

          return (
            <Route
              key={index}
              path={item.path}
              element={
                needsLayout ? (
                  <DashboardLayoutNavigationLinks>{routeElement}</DashboardLayoutNavigationLinks>
                ) : (
                  routeElement
                )
              }
            />
          );
        })}
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />

    </div>
  );
};

export default App;


// AdminLeaveQueue
// dashboard
// dashboardlayoutnavigation