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


const RoleBasedHome = () => {
  const userType = useSelector((state) => state.auth?.user?.role);

  if (userType === "ADMIN") return <Home />;
  if (userType === "MARKETING_MANAGER") return <MarketingManagerDashboard />;
  if (userType === "FOH") return <FohDashboard />;
  if (userType === "TRAINER") return <TrainerDashboard />;
  if (userType === "CLUB_MANAGER") return <ClubManagerDashboard />;
  if (userType === "FINANCE_MANAGER") return <FinanceManagerDashboard />;

  return <Navigate to="/login" />; // or Unauthorized page
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
        {/* Common Login Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/set-password" element={<SetPassword />} />

        
        <Route
          path="/"
          element={
            <PrivateRoute>
              <RoleBasedHome />
            </PrivateRoute>
          }
        />

        <Route
          path="/all-leads"
          element={
            // <PrivateRoute>
            <AllLeads />
            // </PrivateRoute>
          }
        />
        <Route
          path="/all-leads/:id"
          element={
            // <PrivateRoute>
            <AllLeads />
            // </PrivateRoute>
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
        {/* <Route
          path="/challenge-participants-list"
          element={
            <PrivateRoute>
              <ChallengeParticipantsList />
            </PrivateRoute>
          }
        /> */}
        <Route
          path="/challenge-participants-list/:id"
          element={
            <PrivateRoute>
              <ChallengeParticipantsList />
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
          path="/recovery-services"
          element={
            <PrivateRoute>
              <RecoveryServicesList />
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
          path="/product-category"
          element={
            <PrivateRoute>
              <ProductCategoryList />
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
          path="/send-mail/"
          element={
            <PrivateRoute>
              <BulkEmailCriteriaForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/send-mail-list/"
          element={
            <PrivateRoute>
              <EmailModule />
            </PrivateRoute>
          }
        />
        <Route
          path="/send-mail-list/:id"
          element={
            <PrivateRoute>
              <EmailModule />
            </PrivateRoute>
          }
        />
        <Route
          path="/email-template-list/"
          element={
            <PrivateRoute>
              <EmailTemplateList />
            </PrivateRoute>
          }
        />
        <Route
          path="/email-template/"
          element={
            <PrivateRoute>
              <CreateEmailTemplate />
            </PrivateRoute>
          }
        />
        <Route
          path="/email-template/:id"
          element={
            <PrivateRoute>
              <CreateEmailTemplate />
            </PrivateRoute>
          }
        />
        <Route
          path="/send-sms/"
          element={
            <PrivateRoute>
              <BulkSmsCriteriaForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/send-sms-list/"
          element={
            <PrivateRoute>
              <SmsModule />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/send-sms-list/:id"
          element={
            <PrivateRoute>
              <SmsModule />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/notification-list/"
          element={
            <PrivateRoute>
              <NotificationList />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/send-notification/"
          element={
            <PrivateRoute>
              <NotificationModule />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/send-notification/:id"
          element={
            <PrivateRoute>
              <NotificationModule />
            </PrivateRoute>
          }
        />
        <Route
          path="/marketing-banner/"
          element={
            <PrivateRoute>
              <MarketingBanner />
            </PrivateRoute>
          }
        />
        <Route
          path="/send-whatsapp-list/"
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
          path="/marketing-manager/"
          element={
            <PrivateRoute>
              <MarketingManagerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/foh-dashboard/"
          element={
            <PrivateRoute>
              <FohDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/all-bookings/"
          element={
            <PrivateRoute>
              <AllAppointments />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/appointments/all-trial-appointments/"
          element={
            <PrivateRoute>
              <TrialAppointments />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/all-orders"
          element={
            <PrivateRoute>
              <ProductsSold />
            </PrivateRoute>
          }
        />

        <Route
          path="/reports/sales-reports/membership-sales-report"
          element={
            <PrivateRoute>
              <NewJoineesReport />
            </PrivateRoute>
          }
        />

        <Route
          path="/reports/sales-reports/all-enquiries-report"
          element={
            <PrivateRoute>
              <AllEnquiriesReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-follow-ups"
          element={
            <PrivateRoute>
              <MyFollowUps />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/sales-reports/active-member-report"
          element={
            <PrivateRoute>
              <ActiveMemberReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/sales-reports/pt-revenue-report"
          element={
            <PrivateRoute>
              <PtRevenueReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/sales-reports/pt-revenue-report-list/:id"
          element={
            <PrivateRoute>
              <PtRevenueListReport />
            </PrivateRoute>
          }
        />
       
        <Route
          path="/reports/sales-reports/lead-source-report/"
          element={
            <PrivateRoute>
              <LeadSourceReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/sales-reports/group-classes-report/"
          element={
            <PrivateRoute>
              <GroupClassesUtilizationReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/finance-reports/all-invoice-report"
          element={
            <PrivateRoute>
              <AllInvoiceReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/finance-reports/pending-collection"
          element={
            <PrivateRoute>
              <PendingCollectionReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/finance-reports/cancelled-paid-invoice"
          element={
            <PrivateRoute>
              <CancelledPaidInvioceReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/finance-reports/refund-report"
          element={
            <PrivateRoute>
              <RefundReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/finance-reports/collection-report"
          element={
            <PrivateRoute>
              <CollectionReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/finance-reports/tds-report"
          element={
            <PrivateRoute>
              <TDSReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/finance-reports/advance-payments-report"
          element={
            <PrivateRoute>
              <AdvancePaymentsReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/finance-reports/monthly-targets-report"
          element={
            <PrivateRoute>
              <MonthlyTargetsReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/finance-reports/set-incentive-policy"
          element={
            <PrivateRoute>
              <SetIncentivePolicy />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/finance-reports/refund-requests"
          element={
            <PrivateRoute>
              <RefundRequests />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/operations-reports/member-checkins-report"
          element={
            <PrivateRoute>
              <MemberCheckInsReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/operations-reports/member-checkins-report/:id"
          element={
            <PrivateRoute>
              <MemberCheckInsReport />
            </PrivateRoute>
          }
        />
     
        <Route
          path="/reports/operations-reports/membership-expiry-report"
          element={
            <PrivateRoute>
              <MembershipExpiryReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/operations-reports/pt-expiry-report"
          element={
            <PrivateRoute>
              <PtExpiryReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/operations-reports/irregular-members-report"
          element={
            <PrivateRoute>
              <IrregularMembersReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/operations-reports/active-client-report"
          element={
            <PrivateRoute>
              <ActiveClientSummaryReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/operations-reports/inactive-client-report"
          element={
            <PrivateRoute>
              <InactiveClientSummaryReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/operations-reports/membership-frozen-report"
          element={
            <PrivateRoute>
              <MembershipFrozenReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/operations-reports/attendance-heatmap-report"
          element={
            <PrivateRoute>
              <AttendanceHeatmapReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/operations-reports/referral-report"
          element={
            <PrivateRoute>
              <ReferralReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/operations-reports/renewal-report"
          element={
            <PrivateRoute>
              <RenewalReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/lead-source-performance"
          element={
            <PrivateRoute>
              <LeadSourcePerformance />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/thrive-coins-usage"
          element={
            <PrivateRoute>
              <ThriveCoinsUsage />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/customer-segmentation-report"
          element={
            <PrivateRoute>
              <CustomerSegmentationReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/discount-codes-performance"
          element={
            <PrivateRoute>
              <DiscountCodesPerformance />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/engagement-tracking-report"
          element={
            <PrivateRoute>
              <EngagementTrackingReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/email-list"
          element={
            <PrivateRoute>
              <EmailList />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/email-automation-report"
          element={
            <PrivateRoute>
              <EmailAutomationReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/sms-delivery-report"
          element={
            <PrivateRoute>
              <SMSDeliveryReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/sms-list"
          element={
            <PrivateRoute>
              <SmsList />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/marketing-reports/event-community-engagement"
          element={
            <PrivateRoute>
              <EventCommunityEngagement />
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
          path="/club-gallery"
          element={
            <PrivateRoute>
              <GalleryList />
            </PrivateRoute>
          }
        />
        <Route
          path="/coupons/"
          element={
            <PrivateRoute>
              <CouponsList />
            </PrivateRoute>
          }
        />
        <Route
          path="/faq-category"
          element={
            <PrivateRoute>
              <FaqCategoryList />
            </PrivateRoute>
          }
        />
        <Route
          path="/faq-list"
          element={
            <PrivateRoute>
              <FaqsList />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
