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
import MembershipsReport from "../components/Reports/OperationsReports/MembershipsReport";
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
          path="/send-sms-list/"
          element={
            <PrivateRoute>
              <SmsModule />
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
          path="/foh-dashboard/"
          element={
            <PrivateRoute>
              <FohDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/appointments/all-appointments/"
          element={
            <PrivateRoute>
              <TrialAppointments />
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
          path="/reports/sales-reports/new-joinees-report"
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
          path="/reports/sales-reports/group-classes-utilization-report/"
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
          path="/reports/operations-reports/memberships-report"
          element={
            <PrivateRoute>
              <MembershipsReport />
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
          path="/reports/operations-reports/active-client-summary-report"
          element={
            <PrivateRoute>
              <ActiveClientSummaryReport />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/operations-reports/inactive-client-summary-report"
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
