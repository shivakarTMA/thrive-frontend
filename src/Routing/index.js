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
import Home from "../Pages/FOH/Home";
import AllLeads from "../Pages/FOH/AllLeads";
import MemberList from "../Pages/FOH/MemberList";
import MemberProfile from "../Pages/FOH/MemberProfile";
import AllLostFound from "../Pages/FOH/AllLostFound";

// PT Pages
import PtHome from "../Pages/PT/Home";
import MyClients from "../Pages/PT/MyClients";
import MyCalendar from "../Pages/PT/MyCalendar";
import WorkoutPlans from "../Pages/PT/WorkoutPlans";
import AssessmentsProgress from "../Pages/PT/AssessmentsProgress";
import ReportsIncentives from "../Pages/PT/ReportsIncentives";
import TasksFollowUps from "../Pages/PT/TasksFollowUps";
import EditLeadDetails from "../Pages/FOH/EditLeadDetails";
import ForgotPassword from "../components/common/ForgotPassword";
import ResetPassword from "../components/common/ResetPassword";
import LeadFollowUp from "../Pages/FOH/LeadFollowUp";
import ServicesLIst from "../Pages/FOH/ServicesLIst";
import BookingService from "../Pages/FOH/BookingService";

export default function Routing() {
  const { accessToken } = useSelector((state) => state.auth);
  const userType = useSelector((state) => state.auth?.user?.userType);

  if (!accessToken) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} /> 
          <Route path="/reset-password" element={<ResetPassword />} /> 
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
        <Route path="/reset-password" element={<ResetPassword />} /> 

        {/* FOH Routes */}
        {userType === "FOH" && (
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
                  <LeadFollowUp />
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
          </>
        )}

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
