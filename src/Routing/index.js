import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "../components/common/Login";
import PrivateRoute from "./PrivateRoute";

// FOH Pages
import Home from "../Pages/Home";
import AllLeads from "../Pages/AllLeads";
import MemberList from "../Pages/MemberList";
import MemberProfile from "../Pages/MemberProfile";

// PT Pages
import PtHome from "../Pages/PT/Home";
import MyClients from "../Pages/PT/MyClients";
import MyCalendar from "../Pages/PT/MyCalendar";
import WorkoutPlans from "../Pages/PT/WorkoutPlans";
import AssessmentsProgress from "../Pages/PT/AssessmentsProgress";
import ReportsIncentives from "../Pages/PT/ReportsIncentives";
import TasksFollowUps from "../Pages/PT/TasksFollowUps";
import EditLeadDetails from "../Pages/EditLeadDetails";
import ForgotPassword from "../components/common/ForgotPassword";
import SetPassword from "../components/common/SetPassword";
import LeadCallLogs from "../Pages/LeadCallLogs";
import ServicesLIst from "../Pages/ServicesLIst";
import BookingService from "../Pages/BookingService";
import CreateProduct from "../components/Products/CreateProduct";
import CreateService from "../components/Services/CreateService";
import CompanyList from "../components/Companies/CompanyList";
import ProductsList from "../components/Products/ProductsList";
import ServicesAddons from "../components/Services/ServicesAddons";
import StaffList from "../components/Staff/StaffList";
import ExercisesList from "../components/Exercises/ExercisesList";
import WorkoutPlanList from "../components/WorkoutPlan/WorkoutPlanList";
import CreateWorkoutplan from "../components/WorkoutPlan/CreateWorkoutplan";
import DietPlanList from "../components/DietPlan/DietPlanList";
import AllGroupClasses from "../components/groupclass/AllGroupClasses";
import AllLostFound from "../components/lostfound/AllLostFound";
import MemberCallLogs from "../Pages/MemberCallLogs";
import ClubList from "../components/Club/ClubList";
import OptionList from "../components/OptionList/OptionList";
import RoleList from "../components/RoleList/RoleList";
import ModuleList from "../components/ModuleList/ModuleList";
import ChallengeList from "../components/ChallengeList/ChallengeList";
import OnBoardingScreen from "../components/OnBoardingScreen/OnBoardingScreen";
import SplashScreen from "../components/SplashScreen/SplashScreen";
import Studio from "../components/Studio/Studio";
import Services from "../components/ServicesNew/Services";
import PackageCategoryList from "../components/PackageCategory/PackageCategoryList";
import SubscriptionPlan from "../components/SubscriptionPlan/SubscriptionPlan";
import PackagesList from "../components/PackagesList/PackagesList";
import EmailModule from "../components/Marketing/EmailModule";
import SmsModule from "../components/Marketing/SmsModule";
import WhatsappModule from "../components/Marketing/WhatsappModule";
import ClubManagerDashboard from "../Pages/ClubManagerDashboard";
import TrainerDashboard from "../Pages/TrainerDashboard";
import SalesReportPage from "../Pages/Reports/Finance/SalesReportPage";
import TrialAppointments from "../Pages/Reports/Appointments/TrialAppointments";
import MemberCheckIn from "../Pages/Reports/MemberManagement/MemberCheckIn";
import ProductsSold from "../Pages/Reports/ProductsSold";
import GalleryList from "../components/Gallery/GalleryList";

export default function Routing() {
  const { accessToken } = useSelector((state) => state.auth);
  const userType = useSelector((state) => state.auth?.user?.userType);

  if (!accessToken) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/set-password" element={<SetPassword />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Common Login Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/set-password" element={<SetPassword />} />

        {/* FOH Routes */}
        {/* {userType === "FOH" && (
          <>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/all-leads"
              element={
                <PrivateRoute>
                  <AllLeads />
                </PrivateRoute>
              }
            />
            <Route
              path="/edit-lead-details/:id"
              element={
                <PrivateRoute>
                  <EditLeadDetails />
                </PrivateRoute>
              }
            />

            <Route
              path="/all-members"
              element={
                <PrivateRoute>
                  <MemberList />
                </PrivateRoute>
              }
            />
            <Route
              path="/member/:id"
              element={
                <PrivateRoute>
                  <MemberProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/lost-found"
              element={
                <PrivateRoute>
                  <AllLostFound />
                </PrivateRoute>
              }
            />
            <Route
              path="/lead-follow-up/:id"
              element={
                <PrivateRoute>
                  <LeadCallLogs />
                </PrivateRoute>
              }
            />
            <Route
              path="/member-follow-up/:id"
              element={
                <PrivateRoute>
                  <MemberCallLogs />
                </PrivateRoute>
              }
            />
            <Route
              path="/services-list/"
              element={
                <PrivateRoute>
                  <ServicesLIst />
                </PrivateRoute>
              }
            />
            <Route
              path="/book-service/:id"
              element={
                <PrivateRoute>
                  <BookingService />
                </PrivateRoute>
              }
            />
            <Route
              path="/products"
              element={
                <PrivateRoute>
                  <ProductsList />
                </PrivateRoute>
              }
            />
            <Route
              path="/companies"
              element={
                <PrivateRoute>
                  <CompanyList />
                </PrivateRoute>
              }
            />
            <Route
              path="/club"
              element={
                <PrivateRoute>
                  <ClubList />
                </PrivateRoute>
              }
            />
            <Route
              path="/option-list"
              element={
                <PrivateRoute>
                  <OptionList />
                </PrivateRoute>
              }
            />
            <Route
              path="/role-list"
              element={
                <PrivateRoute>
                  <RoleList />
                </PrivateRoute>
              }
            />
            <Route
              path="/module-list"
              element={
                <PrivateRoute>
                  <ModuleList />
                </PrivateRoute>
              }
            />
            <Route
              path="/challenge-list"
              element={
                <PrivateRoute>
                  <ChallengeList />
                </PrivateRoute>
              }
            />
            <Route
              path="/on-boarding-list"
              element={
                <PrivateRoute>
                  <OnBoardingScreen />
                </PrivateRoute>
              }
            />
            <Route
              path="/splash-screen"
              element={
                <PrivateRoute>
                  <SplashScreen />
                </PrivateRoute>
              }
            />
            <Route
              path="/studio"
              element={
                <PrivateRoute>
                  <Studio />
                </PrivateRoute>
              }
            />
            <Route
              path="/services"
              element={
                <PrivateRoute>
                  <Services />
                </PrivateRoute>
              }
            />
            <Route
              path="/services-addons"
              element={
                <PrivateRoute>
                  <ServicesAddons />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <PrivateRoute>
                  <StaffList />
                </PrivateRoute>
              }
            />
            <Route
              path="/exercises"
              element={
                <PrivateRoute>
                  <ExercisesList />
                </PrivateRoute>
              }
            />
            <Route
              path="/workout-plans"
              element={
                <PrivateRoute>
                  <WorkoutPlanList />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-workout-plan"
              element={
                <PrivateRoute>
                  <CreateWorkoutplan />
                </PrivateRoute>
              }
            />
            <Route
              path="/create-workout-plan/:id"
              element={
                <PrivateRoute>
                  <CreateWorkoutplan />
                </PrivateRoute>
              }
            />
            <Route
              path="/diet-plan/"
              element={
                <PrivateRoute>
                  <DietPlanList />
                </PrivateRoute>
              }
            />
            <Route
              path="/group-classes/"
              element={
                <PrivateRoute>
                  <AllGroupClasses />
                </PrivateRoute>
              }
            />
          </>
        )} */}

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/all-leads"
          element={
            <PrivateRoute>
              <AllLeads />
            </PrivateRoute>
          }
        />
        <Route
          path="/all-leads/:id"
          element={
            <PrivateRoute>
              <AllLeads />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-lead-details/:id"
          element={
            <PrivateRoute>
              <EditLeadDetails />
            </PrivateRoute>
          }
        />

        <Route
          path="/all-members"
          element={
            <PrivateRoute>
              <MemberList />
            </PrivateRoute>
          }
        />
        <Route
          path="/all-members/:id"
          element={
            <PrivateRoute>
              <MemberList />
            </PrivateRoute>
          }
        />
        <Route
          path="/member/:id"
          element={
            <PrivateRoute>
              <MemberProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/lost-found"
          element={
            <PrivateRoute>
              <AllLostFound />
            </PrivateRoute>
          }
        />
        <Route
          path="/lead-follow-up/:id"
          element={
            <PrivateRoute>
              <LeadCallLogs />
            </PrivateRoute>
          }
        />
        <Route
          path="/member-follow-up/:id"
          element={
            <PrivateRoute>
              <MemberCallLogs />
            </PrivateRoute>
          }
        />
        <Route
          path="/services-list/"
          element={
            <PrivateRoute>
              <ServicesLIst />
            </PrivateRoute>
          }
        />
        <Route
          path="/book-service/:id"
          element={
            <PrivateRoute>
              <BookingService />
            </PrivateRoute>
          }
        />
        <Route
          path="/products"
          element={
            <PrivateRoute>
              <ProductsList />
            </PrivateRoute>
          }
        />
        <Route
          path="/companies"
          element={
            <PrivateRoute>
              <CompanyList />
            </PrivateRoute>
          }
        />
        <Route
          path="/club"
          element={
            <PrivateRoute>
              <ClubList />
            </PrivateRoute>
          }
        />
        <Route
          path="/option-list"
          element={
            <PrivateRoute>
              <OptionList />
            </PrivateRoute>
          }
        />
        <Route
          path="/role-list"
          element={
            <PrivateRoute>
              <RoleList />
            </PrivateRoute>
          }
        />
        <Route
          path="/module-list"
          element={
            <PrivateRoute>
              <ModuleList />
            </PrivateRoute>
          }
        />
        <Route
          path="/challenge-list"
          element={
            <PrivateRoute>
              <ChallengeList />
            </PrivateRoute>
          }
        />
        <Route
          path="/on-boarding-list"
          element={
            <PrivateRoute>
              <OnBoardingScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/splash-screen"
          element={
            <PrivateRoute>
              <SplashScreen />
            </PrivateRoute>
          }
        />
        <Route
          path="/studio"
          element={
            <PrivateRoute>
              <Studio />
            </PrivateRoute>
          }
        />
        <Route
          path="/services"
          element={
            <PrivateRoute>
              <Services />
            </PrivateRoute>
          }
        />
        <Route
          path="/package-category"
          element={
            <PrivateRoute>
              <PackageCategoryList />
            </PrivateRoute>
          }
        />
        <Route
          path="/packages"
          element={
            <PrivateRoute>
              <PackagesList />
            </PrivateRoute>
          }
        />
        <Route
          path="/subscription-plan"
          element={
            <PrivateRoute>
              <SubscriptionPlan />
            </PrivateRoute>
          }
        />
        <Route
          path="/services-addons"
          element={
            <PrivateRoute>
              <ServicesAddons />
            </PrivateRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <PrivateRoute>
              <StaffList />
            </PrivateRoute>
          }
        />
        <Route
          path="/exercises"
          element={
            <PrivateRoute>
              <ExercisesList />
            </PrivateRoute>
          }
        />
        <Route
          path="/workout-plans"
          element={
            <PrivateRoute>
              <WorkoutPlanList />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-workout-plan"
          element={
            <PrivateRoute>
              <CreateWorkoutplan />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-workout-plan/:id"
          element={
            <PrivateRoute>
              <CreateWorkoutplan />
            </PrivateRoute>
          }
        />
        <Route
          path="/diet-plan/"
          element={
            <PrivateRoute>
              <DietPlanList />
            </PrivateRoute>
          }
        />
        <Route
          path="/group-classes/"
          element={
            <PrivateRoute>
              <AllGroupClasses />
            </PrivateRoute>
          }
        />
        <Route
          path="/memssmail/"
          element={
            <PrivateRoute>
              <EmailModule />
            </PrivateRoute>
          }
        />
        <Route
          path="/memsssms/"
          element={
            <PrivateRoute>
              <SmsModule />
            </PrivateRoute>
          }
        />
        <Route
          path="/memsswhatsapp/"
          element={
            <PrivateRoute>
              <WhatsappModule />
            </PrivateRoute>
          }
        />
        <Route
          path="/club-manager/"
          element={
            <PrivateRoute>
              <ClubManagerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/finance/sales-report/"
          element={
            <PrivateRoute>
              <SalesReportPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/appointments/trial-appointments/"
          element={
            <PrivateRoute>
              <TrialAppointments />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/member-management/member-check-ins/"
          element={
            <PrivateRoute>
              <MemberCheckIn />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/products-sold/"
          element={
            <PrivateRoute>
              <ProductsSold />
            </PrivateRoute>
          }
        />
        <Route
          path="/trainer-dashboard/"
          element={
            <PrivateRoute>
              <TrainerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/gallery/"
          element={
            <PrivateRoute>
              <GalleryList />
            </PrivateRoute>
          }
        />

        {/* PT Routes */}
        {userType === "PT" && (
          <>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <PtHome />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-clients"
              element={
                <PrivateRoute>
                  <MyClients />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-calendar"
              element={
                <PrivateRoute>
                  <MyCalendar />
                </PrivateRoute>
              }
            />
            <Route
              path="/workout-plans"
              element={
                <PrivateRoute>
                  <WorkoutPlans />
                </PrivateRoute>
              }
            />
            <Route
              path="/assessments-progress"
              element={
                <PrivateRoute>
                  <AssessmentsProgress />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports-incentives"
              element={
                <PrivateRoute>
                  <ReportsIncentives />
                </PrivateRoute>
              }
            />
            <Route
              path="/tasks-followups"
              element={
                <PrivateRoute>
                  <TasksFollowUps />
                </PrivateRoute>
              }
            />
          </>
        )}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
