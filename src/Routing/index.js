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
import { getAllowedRoles } from "./RolePermissions";

// FOH Pages
import Home from "../Pages/Home";
import AllLeads from "../Pages/AllLeads";
import MemberList from "../Pages/MemberList";
import MemberProfile from "../Pages/MemberProfile";

// PT Pages
import EditLeadDetails from "../Pages/EditLeadDetails";
import ForgotPassword from "../components/common/ForgotPassword";
import SetPassword from "../components/common/SetPassword";
import LeadCallLogs from "../Pages/LeadCallLogs";
import BookingService from "../Pages/BookingService";
import CompanyList from "../components/Companies/CompanyList";
import ProductsList from "../components/Products/ProductsList";
import StaffList from "../components/Staff/StaffList";
import ExercisesList from "../components/Exercises/ExercisesList";
import WorkoutPlanList from "../components/WorkoutPlan/WorkoutPlanList";
import CreateWorkoutplan from "../components/WorkoutPlan/CreateWorkoutplan";
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
import TrialAppointments from "../Pages/Reports/Appointments/TrialAppointments";
import ProductsSold from "../Pages/Reports/ProductsSold";
import GalleryList from "../components/Gallery/GalleryList";
import CouponsList from "../components/Coupons/CouponsList";
import ProductCategoryList from "../components/ProductCategory/ProductCategoryList";
import CreateEmailTemplate from "../components/EmailTemplate/CreateEmailTemplate";
import EmailTemplateList from "../components/EmailTemplate/EmailTemplateList";
import BulkEmailCriteriaForm from "../components/Marketing/BulkEmailCriteriaForm";
import BulkSmsCriteriaForm from "../components/Marketing/BulkSmsCriteriaForm";
import MarketingBanner from "../components/MarketingBanner/MarketingBanner";
import RecoveryServicesList from "../components/RecoveryServices/RecoveryServicesList";
import NewJoineesReport from "../components/Reports/SalesReports/NewJoineesReport";
import AllEnquiriesReport from "../components/Reports/SalesReports/AllEnquiriesReport";
import ActiveMemberReport from "../components/Reports/SalesReports/ActiveMemberReport";
import AllInvoiceReport from "../components/Reports/FinanceReports/AllInvoiceReport";
import PendingCollectionReport from "../components/Reports/FinanceReports/PendingCollectionReport";
import CancelledPaidInvioceReport from "../components/Reports/FinanceReports/CancelledPaidInvioceReport";
import RefundReport from "../components/Reports/FinanceReports/RefundReport";
import CollectionReport from "../components/Reports/FinanceReports/CollectionReport";
import MemberCheckInsReport from "../components/Reports/OperationsReports/MemberCheckInsReport";
import MembershipExpiryReport from "../components/Reports/OperationsReports/MembershipExpiryReport";
import PtExpiryReport from "../components/Reports/OperationsReports/PtExpiryReport";
import IrregularMembersReport from "../components/Reports/OperationsReports/IrregularMembersReport";
import ActiveClientSummaryReport from "../components/Reports/OperationsReports/ActiveClientSummaryReport";
import InactiveClientSummaryReport from "../components/Reports/OperationsReports/InactiveClientSummaryReport";
import MembershipFrozenReport from "../components/Reports/OperationsReports/MembershipFrozenReport";
import AttendanceHeatmapReport from "../components/Reports/OperationsReports/AttendanceHeatmapReport";
import PtRevenueReport from "../components/Reports/SalesReports/PtRevenueReport";
import PtRevenueListReport from "../components/Reports/SalesReports/PtRevenueListReport";
import LeadSourceReport from "../components/Reports/SalesReports/LeadSourceReport";
import GroupClassesUtilizationReport from "../components/Reports/SalesReports/GroupClassesUtilizationReport";
import TDSReport from "../components/Reports/FinanceReports/TDSReport";
import AdvancePaymentsReport from "../components/Reports/FinanceReports/AdvancePaymentsReport";
import ReferralReport from "../components/Reports/OperationsReports/ReferralReport";
import FaqCategoryList from "../components/FaqCategory/FaqCategoryList";
import FaqsList from "../components/FaqsList/FaqsList";
import FohDashboard from "../Pages/FohDashboard";
import RenewalReport from "../components/Reports/OperationsReports/RenewalReport";
import ChallengeParticipantsList from "../components/ChallengeParticipants/ChallengeParticipantsList";
import NotificationModule from "../components/Marketing/NotificationModule";
import MarketingManagerDashboard from "../Pages/MarketingManagerDashboard";
import LeadSourcePerformance from "../components/Reports/MarketingReports/LeadSourcePerformance";
import ThriveCoinsUsage from "../components/Reports/MarketingReports/ThriveCoinsUsage";
import CustomerSegmentationReport from "../components/Reports/MarketingReports/CustomerSegmentationReport";
import DiscountCodesPerformance from "../components/Reports/MarketingReports/DiscountCodesPerformance";
import EngagementTrackingReport from "../components/Reports/MarketingReports/EngagementTrackingReport";
import EmailAutomationReport from "../components/Reports/MarketingReports/EmailAutomationReport";
import SMSDeliveryReport from "../components/Reports/MarketingReports/SMSDeliveryReport";
import EventCommunityEngagement from "../components/Reports/MarketingReports/EventCommunityEngagement";
import EmailList from "../components/Reports/MarketingReports/EmailList";
import SmsList from "../components/Reports/MarketingReports/SmsList";
import NotificationList from "../components/Reports/MarketingReports/NotificationList";
import FinanceManagerDashboard from "../Pages/FinanceManagerDashboard";
import MonthlyTargetsReport from "../components/Reports/FinanceReports/MonthlyTargetsReport";
import SetIncentivePolicy from "../components/Reports/FinanceReports/SetIncentivePolicy";
import RefundRequests from "../components/Reports/FinanceReports/RefundRequests";
import AllAppointments from "../Pages/Reports/Appointments/AllAppointments";
import MyFollowUps from "../Pages/MyFollowUps";
import GroupClassesList from "../components/GroupClassesList/GroupClassesList";
import GroupClassParticipants from "../components/GroupClassesList/GroupClassParticipants";
import BirthdayReport from "../Pages/Reports/BirthdayReport";
import AnniversaryReport from "../Pages/Reports/AnniversaryReport";

// Role-based route wrapper component
const RoleProtectedRoute = ({ children, path, skipPrivateRoute = false }) => {
  const userRole = useSelector((state) => state.auth?.user?.role);
  const allowedRoles = getAllowedRoles(path);

  if (!allowedRoles.includes(userRole)) {
    const dashboardMap = {
      ADMIN: "/",
      MARKETING_MANAGER: "/",
      FINANCE_MANAGER: "/",
      FOH: "/",
      TRAINER: "/",
      CLUB_MANAGER: "/",
    };

    // const dashboardMap = {
    //   ADMIN: '/',
    //   MARKETING_MANAGER: '/marketing-manager',
    //   FINANCE_MANAGER: '/',
    //   FOH: '/foh-dashboard',
    //   TRAINER: '/trainer-dashboard',
    //   CLUB_MANAGER: '/club-manager',
    // };

    return <Navigate to={dashboardMap[userRole] || "/"} replace />;
  }

  // If skipPrivateRoute is true, return children directly without PrivateRoute wrapper
  if (skipPrivateRoute) {
    return children;
  }

  return <PrivateRoute>{children}</PrivateRoute>;
};

const RoleBasedHome = () => {
  const userType = useSelector((state) => state.auth?.user?.role);

  if (userType === "ADMIN") return <Home />;
  if (userType === "MARKETING_MANAGER") return <MarketingManagerDashboard />;
  if (userType === "FOH") return <FohDashboard />;
  if (userType === "TRAINER") return <TrainerDashboard />;
  if (userType === "CLUB_MANAGER") return <ClubManagerDashboard />;
  if (userType === "FINANCE_MANAGER") return <FinanceManagerDashboard />;

  return <Navigate to="/login" />;
};

export default function Routing() {
  const { accessToken } = useSelector((state) => state.auth);

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
        {/* Common Login Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/set-password" element={<SetPassword />} />

        {/* Dashboard Route */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <RoleBasedHome />
            </PrivateRoute>
          }
        />

        {/* Lead Management Routes */}
        <Route
          path="/all-leads"
          element={
            <RoleProtectedRoute path="/all-leads" skipPrivateRoute={true}>
              <AllLeads />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/all-leads/:id"
          element={
            <RoleProtectedRoute path="/all-leads/:id" skipPrivateRoute={true}>
              <AllLeads />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/edit-lead-details/:id"
          element={
            <RoleProtectedRoute path="/edit-lead-details/:id">
              <EditLeadDetails />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/lead-follow-up/:id"
          element={
            <RoleProtectedRoute path="/lead-follow-up/:id">
              <LeadCallLogs />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/my-follow-ups"
          element={
            <RoleProtectedRoute path="/my-follow-ups">
              <MyFollowUps />
            </RoleProtectedRoute>
          }
        />

        {/* Member Management Routes */}
        <Route
          path="/all-members"
          element={
            <RoleProtectedRoute path="/all-members">
              <MemberList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/all-members/:id"
          element={
            <RoleProtectedRoute path="/all-members/:id">
              <MemberList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/member/:id"
          element={
            <RoleProtectedRoute path="/member/:id">
              <MemberProfile />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/member-follow-up/:id"
          element={
            <RoleProtectedRoute path="/member-follow-up/:id">
              <MemberCallLogs />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/book-service/:id"
          element={
            <RoleProtectedRoute path="/book-service/:id">
              <BookingService />
            </RoleProtectedRoute>
          }
        />

        {/* Lost & Found */}
        <Route
          path="/lost-found"
          element={
            <RoleProtectedRoute path="/lost-found">
              <AllLostFound />
            </RoleProtectedRoute>
          }
        />

        {/* Birthday report */}
        <Route
          path="/birthday-report"
          element={
            <RoleProtectedRoute path="/birthday-report">
              <BirthdayReport />
            </RoleProtectedRoute>
          }
        />

        {/* Anniversary report */}
        <Route
          path="/anniversary-report"
          element={
            <RoleProtectedRoute path="/anniversary-report">
              <AnniversaryReport />
            </RoleProtectedRoute>
          }
        />

        {/* Appointments & Bookings */}
        <Route
          path="/reports/appointments/all-trial-appointments"
          element={
            <RoleProtectedRoute path="/reports/appointments/all-trial-appointments">
              <TrialAppointments />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/all-bookings"
          element={
            <RoleProtectedRoute path="/reports/all-bookings">
              <AllAppointments />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/all-orders"
          element={
            <RoleProtectedRoute path="/reports/all-orders">
              <ProductsSold />
            </RoleProtectedRoute>
          }
        />

        {/* Products & Companies */}
        <Route
          path="/products"
          element={
            <RoleProtectedRoute path="/products">
              <ProductsList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/companies"
          element={
            <RoleProtectedRoute path="/companies">
              <CompanyList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/club"
          element={
            <RoleProtectedRoute path="/club">
              <ClubList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/option-list"
          element={
            <RoleProtectedRoute path="/option-list">
              <OptionList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/role-list"
          element={
            <RoleProtectedRoute path="/role-list">
              <RoleList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/module-list"
          element={
            <RoleProtectedRoute path="/module-list">
              <ModuleList />
            </RoleProtectedRoute>
          }
        />

        {/* Marketing Routes */}
        <Route
          path="/challenge-list"
          element={
            <RoleProtectedRoute path="/challenge-list">
              <ChallengeList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/challenge-participants-list/:id"
          element={
            <RoleProtectedRoute path="/challenge-participants-list/:id">
              <ChallengeParticipantsList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/send-mail"
          element={
            <RoleProtectedRoute path="/send-mail">
              <BulkEmailCriteriaForm />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/send-mail-list"
          element={
            <RoleProtectedRoute path="/send-mail-list">
              <EmailModule />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/send-mail-list/:id"
          element={
            <RoleProtectedRoute path="/send-mail-list/:id">
              <EmailModule />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/email-template-list"
          element={
            <RoleProtectedRoute path="/email-template-list">
              <EmailTemplateList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/email-template"
          element={
            <RoleProtectedRoute path="/email-template">
              <CreateEmailTemplate />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/email-template/:id"
          element={
            <RoleProtectedRoute path="/email-template/:id">
              <CreateEmailTemplate />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/send-sms"
          element={
            <RoleProtectedRoute path="/send-sms">
              <BulkSmsCriteriaForm />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/send-sms-list"
          element={
            <RoleProtectedRoute path="/reports/marketing-reports/send-sms-list">
              <SmsModule />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/send-sms-list/:id"
          element={
            <RoleProtectedRoute path="/reports/marketing-reports/send-sms-list/:id">
              <SmsModule />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/notification-list"
          element={
            <RoleProtectedRoute path="/reports/marketing-reports/notification-list">
              <NotificationList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/send-notification"
          element={
            <RoleProtectedRoute path="/reports/marketing-reports/send-notification">
              <NotificationModule />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/send-notification/:id"
          element={
            <RoleProtectedRoute path="/reports/marketing-reports/send-notification/:id">
              <NotificationModule />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/marketing-banner"
          element={
            <RoleProtectedRoute path="/marketing-banner">
              <MarketingBanner />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/send-whatsapp-list"
          element={
            <RoleProtectedRoute path="/send-whatsapp-list">
              <WhatsappModule />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/coupons"
          element={
            <RoleProtectedRoute path="/coupons">
              <CouponsList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/email-list"
          element={
            <RoleProtectedRoute path="/reports/marketing-reports/email-list">
              <EmailList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/sms-list"
          element={
            <RoleProtectedRoute path="/reports/marketing-reports/sms-list">
              <SmsList />
            </RoleProtectedRoute>
          }
        />

        {/* Configuration Routes */}
        <Route
          path="/on-boarding-list"
          element={
            <RoleProtectedRoute path="/on-boarding-list">
              <OnBoardingScreen />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/splash-screen"
          element={
            <RoleProtectedRoute path="/splash-screen">
              <SplashScreen />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/studio"
          element={
            <RoleProtectedRoute path="/studio">
              <Studio />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/services"
          element={
            <RoleProtectedRoute path="/services">
              <Services />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/recovery-services"
          element={
            <RoleProtectedRoute path="/recovery-services">
              <RecoveryServicesList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/package-category"
          element={
            <RoleProtectedRoute path="/package-category">
              <PackageCategoryList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/packages"
          element={
            <RoleProtectedRoute path="/packages">
              <PackagesList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/group-class"
          element={
            <RoleProtectedRoute path="/group-class">
              <GroupClassesList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/group-class/:id"
          element={
            <RoleProtectedRoute path="/group-class/:id">
              <GroupClassParticipants />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/product-category"
          element={
            <RoleProtectedRoute path="/product-category">
              <ProductCategoryList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/subscription-plan"
          element={
            <RoleProtectedRoute path="/subscription-plan">
              <SubscriptionPlan />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <RoleProtectedRoute path="/staff">
              <StaffList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/exercises"
          element={
            <RoleProtectedRoute path="/exercises">
              <ExercisesList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/workout-plans"
          element={
            <RoleProtectedRoute path="/workout-plans">
              <WorkoutPlanList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/create-workout-plan"
          element={
            <RoleProtectedRoute path="/create-workout-plan">
              <CreateWorkoutplan />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/create-workout-plan/:id"
          element={
            <RoleProtectedRoute path="/create-workout-plan/:id">
              <CreateWorkoutplan />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/club-gallery"
          element={
            <RoleProtectedRoute path="/club-gallery">
              <GalleryList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/faq-category"
          element={
            <RoleProtectedRoute path="/faq-category">
              <FaqCategoryList />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/faq-list"
          element={
            <RoleProtectedRoute path="/faq-list">
              <FaqsList />
            </RoleProtectedRoute>
          }
        />

        {/* Dashboard Routes */}
        {/* <Route path="/club-manager" element={<RoleProtectedRoute path="/club-manager"><ClubManagerDashboard /></RoleProtectedRoute>} />
        <Route path="/marketing-manager" element={<RoleProtectedRoute path="/marketing-manager"><MarketingManagerDashboard /></RoleProtectedRoute>} />
        <Route path="/foh-dashboard" element={<RoleProtectedRoute path="/foh-dashboard"><FohDashboard /></RoleProtectedRoute>} />
        <Route path="/trainer-dashboard" element={<RoleProtectedRoute path="/trainer-dashboard"><TrainerDashboard /></RoleProtectedRoute>} /> */}

        {/* Sales Reports */}
        <Route
          path="/reports/sales-reports/membership-sales-report"
          element={
            <RoleProtectedRoute path="/reports/sales-reports/membership-sales-report">
              <NewJoineesReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/sales-reports/all-enquiries-report"
          element={
            <RoleProtectedRoute path="/reports/sales-reports/all-enquiries-report">
              <AllEnquiriesReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/sales-reports/active-member-report"
          element={
            <RoleProtectedRoute path="/reports/sales-reports/active-member-report">
              <ActiveMemberReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/sales-reports/pt-revenue-report"
          element={
            <RoleProtectedRoute path="/reports/sales-reports/pt-revenue-report">
              <PtRevenueReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/sales-reports/pt-revenue-report-list/:id"
          element={
            <RoleProtectedRoute path="/reports/sales-reports/pt-revenue-report-list/:id">
              <PtRevenueListReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/sales-reports/lead-source-report"
          element={
            <RoleProtectedRoute path="/reports/sales-reports/lead-source-report">
              <LeadSourceReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/sales-reports/group-classes-report"
          element={
            <RoleProtectedRoute path="/reports/sales-reports/group-classes-report">
              <GroupClassesUtilizationReport />
            </RoleProtectedRoute>
          }
        />

        {/* Finance Reports */}
        <Route
          path="/reports/finance-reports/all-invoice-report"
          element={
            <RoleProtectedRoute path="/reports/finance-reports/all-invoice-report">
              <AllInvoiceReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/finance-reports/pending-collection"
          element={
            <RoleProtectedRoute path="/reports/finance-reports/pending-collection">
              <PendingCollectionReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/finance-reports/cancelled-paid-invoice"
          element={
            <RoleProtectedRoute path="/reports/finance-reports/cancelled-paid-invoice">
              <CancelledPaidInvioceReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/finance-reports/refund-report"
          element={
            <RoleProtectedRoute path="/reports/finance-reports/refund-report">
              <RefundReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/finance-reports/collection-report"
          element={
            <RoleProtectedRoute path="/reports/finance-reports/collection-report">
              <CollectionReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/finance-reports/tds-report"
          element={
            <RoleProtectedRoute path="/reports/finance-reports/tds-report">
              <TDSReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/finance-reports/advance-payments-report"
          element={
            <RoleProtectedRoute path="/reports/finance-reports/advance-payments-report">
              <AdvancePaymentsReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/finance-reports/monthly-targets-report"
          element={
            <RoleProtectedRoute path="/reports/finance-reports/monthly-targets-report">
              <MonthlyTargetsReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/finance-reports/set-incentive-policy"
          element={
            <RoleProtectedRoute path="/reports/finance-reports/set-incentive-policy">
              <SetIncentivePolicy />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/finance-reports/refund-requests"
          element={
            <RoleProtectedRoute path="/reports/finance-reports/refund-requests">
              <RefundRequests />
            </RoleProtectedRoute>
          }
        />

        {/* Operations Reports */}
        <Route
          path="/reports/operations-reports/member-checkins-report"
          element={
            <RoleProtectedRoute path="/reports/operations-reports/member-checkins-report">
              <MemberCheckInsReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/operations-reports/member-checkins-report/:id"
          element={
            <RoleProtectedRoute path="/reports/operations-reports/member-checkins-report/:id">
              <MemberCheckInsReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/operations-reports/membership-expiry-report"
          element={
            <RoleProtectedRoute path="/reports/operations-reports/membership-expiry-report">
              <MembershipExpiryReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/operations-reports/pt-expiry-report"
          element={
            <RoleProtectedRoute path="/reports/operations-reports/pt-expiry-report">
              <PtExpiryReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/operations-reports/irregular-members-report"
          element={
            <RoleProtectedRoute path="/reports/operations-reports/irregular-members-report">
              <IrregularMembersReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/operations-reports/active-client-report"
          element={
            <RoleProtectedRoute path="/reports/operations-reports/active-client-report">
              <ActiveClientSummaryReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/operations-reports/inactive-client-report"
          element={
            <RoleProtectedRoute path="/reports/operations-reports/inactive-client-report">
              <InactiveClientSummaryReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/operations-reports/membership-frozen-report"
          element={
            <RoleProtectedRoute path="/reports/operations-reports/membership-frozen-report">
              <MembershipFrozenReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/operations-reports/attendance-heatmap-report"
          element={
            <RoleProtectedRoute path="/reports/operations-reports/attendance-heatmap-report">
              <AttendanceHeatmapReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/operations-reports/referral-report"
          element={
            <RoleProtectedRoute path="/reports/operations-reports/referral-report">
              <ReferralReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/operations-reports/renewal-report"
          element={
            <RoleProtectedRoute path="/reports/operations-reports/renewal-report">
              <RenewalReport />
            </RoleProtectedRoute>
          }
        />

        {/* Marketing Reports */}
        <Route
          path="/reports/marketing-reports/lead-source-performance"
          element={
            <RoleProtectedRoute path="/reports/marketing-reports/lead-source-performance">
              <LeadSourcePerformance />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/thrive-coins-usage"
          element={
            <RoleProtectedRoute path="/reports/marketing-reports/thrive-coins-usage">
              <ThriveCoinsUsage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/customer-segmentation-report"
          element={
            <RoleProtectedRoute path="/reports/marketing-reports/customer-segmentation-report">
              <CustomerSegmentationReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/discount-codes-performance"
          element={
            <RoleProtectedRoute path="/reports/marketing-reports/discount-codes-performance">
              <DiscountCodesPerformance />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/engagement-tracking-report"
          element={
            <RoleProtectedRoute path="/reports/marketing-reports/engagement-tracking-report">
              <EngagementTrackingReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/email-automation-report"
          element={
            <RoleProtectedRoute path="/reports/marketing-reports/email-automation-report">
              <EmailAutomationReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/sms-delivery-report"
          element={
            <RoleProtectedRoute path="/reports/marketing-reports/sms-delivery-report">
              <SMSDeliveryReport />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/event-community-engagement"
          element={
            <RoleProtectedRoute path="/reports/marketing-reports/event-community-engagement">
              <EventCommunityEngagement />
            </RoleProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
