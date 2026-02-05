// src/config/rolePermissions.js
// Define which routes each role can access

export const ROLES = {
  ADMIN: 'ADMIN',
  MARKETING_MANAGER: 'MARKETING_MANAGER',
  FINANCE_MANAGER: 'FINANCE_MANAGER',
  FOH: 'FOH',
  TRAINER: 'TRAINER',
  CLUB_MANAGER: 'CLUB_MANAGER',
};

export const ROUTE_PERMISSIONS = {
  // Common routes accessible to all authenticated users
  '/': ['ADMIN', 'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FOH', 'TRAINER', 'CLUB_MANAGER'],
  
  // Lead Management
  '/all-leads': ['ADMIN', 'FOH', 'CLUB_MANAGER'],
  '/all-leads/:id': ['ADMIN', 'FOH', 'CLUB_MANAGER'],
  '/edit-lead-details/:id': ['ADMIN', 'FOH'],
  '/lead-follow-up/:id': ['ADMIN', 'FOH', 'CLUB_MANAGER'],
  '/my-follow-ups': ['ADMIN', 'FOH', 'CLUB_MANAGER', 'MARKETING_MANAGER'],
  
  // Member Management
  '/all-members': ['ADMIN', 'FOH', 'TRAINER', 'CLUB_MANAGER'],
  '/all-members/:id': ['ADMIN', 'FOH', 'TRAINER', 'CLUB_MANAGER'],
  '/member/:id': ['ADMIN', 'FOH', 'TRAINER', 'CLUB_MANAGER'],
  '/member-follow-up/:id': ['ADMIN', 'FOH'],
  '/book-service/:id': ['ADMIN', 'FOH'],
  
  // Workout Plans
  '/workout-plans': ['ADMIN', 'TRAINER'],
  '/create-workout-plan': ['ADMIN', 'TRAINER'],
  '/create-workout-plan/:id': ['ADMIN', 'TRAINER'],
  '/exercises': ['ADMIN', 'TRAINER', 'CLUB_MANAGER'],
  
  // Lost & Found
  '/lost-found': ['ADMIN', 'FOH', 'CLUB_MANAGER'],
  
  // Appointments & Bookings
  '/reports/appointments/all-trial-appointments': ['ADMIN', 'FOH', 'TRAINER', 'CLUB_MANAGER'],
  '/reports/all-bookings': ['ADMIN', 'FOH', 'TRAINER', 'CLUB_MANAGER'],
  '/reports/all-orders': ['ADMIN', 'FOH', 'TRAINER', 'MARKETING_MANAGER', 'FINANCE_MANAGER', 'CLUB_MANAGER'],
  
  // Products & Companies
  '/products': ['ADMIN', 'FINANCE_MANAGER', 'CLUB_MANAGER'],
  '/companies': ['ADMIN'],
  '/club': ['ADMIN'],
  '/option-list': ['ADMIN'],
  '/role-list': ['ADMIN'],
  '/module-list': ['ADMIN'],
  
  // Marketing
  '/challenge-list': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  '/challenge-participants-list/:id': ['ADMIN', 'MARKETING_MANAGER'],
  '/send-mail': ['ADMIN', 'MARKETING_MANAGER'],
  '/send-mail-list': ['ADMIN', 'MARKETING_MANAGER'],
  '/send-mail-list/:id': ['ADMIN', 'MARKETING_MANAGER'],
  '/email-template-list': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  '/email-template': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  '/email-template/:id': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  '/send-sms': ['ADMIN', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/send-sms-list': ['ADMIN', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/send-sms-list/:id': ['ADMIN', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/notification-list': ['ADMIN', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/send-notification': ['ADMIN', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/send-notification/:id': ['ADMIN', 'MARKETING_MANAGER'],
  '/marketing-banner': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  '/send-whatsapp-list': ['ADMIN', 'MARKETING_MANAGER'],
  '/coupons': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  '/reports/marketing-reports/email-list': ['ADMIN', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/sms-list': ['ADMIN', 'MARKETING_MANAGER'],
  
  // Configuration
  '/on-boarding-list': ['ADMIN'],
  '/splash-screen': ['ADMIN'],
  '/studio': ['ADMIN'],
  '/services': ['ADMIN', 'CLUB_MANAGER'],
  '/recovery-services': ['ADMIN', 'CLUB_MANAGER'],
  '/package-category': ['ADMIN', 'CLUB_MANAGER'],
  '/packages': ['ADMIN', 'FINANCE_MANAGER', 'CLUB_MANAGER'],
  '/group-class': ['ADMIN', 'FINANCE_MANAGER', 'CLUB_MANAGER'],
  '/group-class/:id': ['ADMIN', 'FINANCE_MANAGER', 'CLUB_MANAGER'],
  '/product-category': ['ADMIN', 'FINANCE_MANAGER', 'CLUB_MANAGER'],
  '/subscription-plan': ['ADMIN', 'FINANCE_MANAGER', 'CLUB_MANAGER'],
  '/staff': ['ADMIN', 'CLUB_MANAGER'],
  '/club-gallery': ['ADMIN'],
  '/faq-category': ['ADMIN'],
  '/faq-list': ['ADMIN'],
  '/birthday-report': ['ADMIN','FOH', 'MARKETING_MANAGER', 'FINANCE_MANAGER', 'TRAINER', 'CLUB_MANAGER'],
  '/anniversary-report': ['ADMIN','FOH', 'MARKETING_MANAGER', 'FINANCE_MANAGER', 'TRAINER', 'CLUB_MANAGER'],

  
  // Dashboards
  // '/club-manager': ['ADMIN', 'CLUB_MANAGER'],
  // '/marketing-manager': ['ADMIN', 'MARKETING_MANAGER'],
  // '/foh-dashboard': ['ADMIN', 'FOH'],
  // '/trainer-dashboard': ['ADMIN', 'TRAINER'],
  
  // Sales Reports
  '/reports/sales-reports/membership-sales-report': ['ADMIN', 'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FOH', 'CLUB_MANAGER'],
  '/reports/sales-reports/all-enquiries-report': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  '/reports/sales-reports/active-member-report': ['ADMIN', 'FOH', 'CLUB_MANAGER'],
  '/reports/sales-reports/pt-revenue-report': ['ADMIN', 'FINANCE_MANAGER', 'TRAINER', 'CLUB_MANAGER'],
  '/reports/sales-reports/pt-revenue-report-list/:id': ['ADMIN', 'FINANCE_MANAGER', 'TRAINER', 'CLUB_MANAGER'],
  '/reports/sales-reports/lead-source-report': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  '/reports/sales-reports/group-classes-report': ['ADMIN', 'MARKETING_MANAGER','CLUB_MANAGER'],
  
  // Finance Reports
  '/reports/finance-reports/all-invoice-report': ['ADMIN', 'FINANCE_MANAGER', 'CLUB_MANAGER'],
  '/reports/finance-reports/pending-collection': ['ADMIN', 'FINANCE_MANAGER'],
  '/reports/finance-reports/cancelled-paid-invoice': ['ADMIN', 'FINANCE_MANAGER', 'CLUB_MANAGER'],
  '/reports/finance-reports/refund-report': ['ADMIN', 'FINANCE_MANAGER'],
  '/reports/finance-reports/collection-report': ['ADMIN', 'FINANCE_MANAGER', 'CLUB_MANAGER'],
  '/reports/finance-reports/tds-report': ['ADMIN', 'FINANCE_MANAGER'],
  '/reports/finance-reports/advance-payments-report': ['ADMIN', 'FINANCE_MANAGER'],
  '/reports/finance-reports/monthly-targets-report': ['ADMIN', 'FINANCE_MANAGER', 'CLUB_MANAGER'],
  '/reports/finance-reports/set-incentive-policy': ['ADMIN', 'FINANCE_MANAGER'],
  '/reports/finance-reports/refund-requests': ['ADMIN', 'FINANCE_MANAGER'],
  
  // Operations Reports
  '/reports/operations-reports/member-checkins-report': ['ADMIN', 'FOH', 'TRAINER', 'CLUB_MANAGER'],
  '/reports/operations-reports/member-checkins-report/:id': ['ADMIN', 'FOH', 'TRAINER', 'CLUB_MANAGER'],
  '/reports/operations-reports/membership-expiry-report': ['ADMIN', 'FOH', 'CLUB_MANAGER'],
  '/reports/operations-reports/service-expiry-report': ['ADMIN', 'TRAINER', 'CLUB_MANAGER'],
  '/reports/operations-reports/irregular-members-report': ['ADMIN'],
  '/reports/operations-reports/active-client-report': ['ADMIN', 'FOH', 'TRAINER', 'CLUB_MANAGER'],
  '/reports/operations-reports/inactive-client-report': ['ADMIN', 'TRAINER', 'CLUB_MANAGER'],
  '/reports/operations-reports/membership-frozen-report': ['ADMIN', 'FINANCE_MANAGER', 'CLUB_MANAGER'],
  '/reports/operations-reports/attendance-heatmap-report': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  '/reports/operations-reports/referral-report': ['ADMIN', 'CLUB_MANAGER'],
  '/reports/operations-reports/renewal-report': ['ADMIN', 'FINANCE_MANAGER', 'CLUB_MANAGER'],
  
  // Marketing Reports
  '/reports/marketing-reports/lead-source-performance': ['ADMIN', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/thrive-coins-usage': ['ADMIN', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/customer-segmentation-report': ['ADMIN', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/discount-codes-performance': ['ADMIN', 'MARKETING_MANAGER', 'FINANCE_MANAGER'],
  '/reports/marketing-reports/engagement-tracking-report': ['ADMIN', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/email-automation-report': ['ADMIN', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/sms-delivery-report': ['ADMIN', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/event-community-engagement': ['ADMIN', 'MARKETING_MANAGER'],
};

// Helper function to check if a user has access to a route
export const hasRouteAccess = (userRole, path) => {
  // Check exact match first
  if (ROUTE_PERMISSIONS[path]) {
    return ROUTE_PERMISSIONS[path].includes(userRole);
  }
  
  // Check dynamic routes (with :id, :param, etc.)
  const routeKeys = Object.keys(ROUTE_PERMISSIONS);
  for (const route of routeKeys) {
    if (route.includes(':')) {
      // Convert route pattern to regex
      const pattern = route.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(path)) {
        return ROUTE_PERMISSIONS[route].includes(userRole);
      }
    }
  }
  
  // If no match found, deny access
  return false;
};

// Get allowed roles for a specific route
export const getAllowedRoles = (path) => {
  // Check exact match first
  if (ROUTE_PERMISSIONS[path]) {
    return ROUTE_PERMISSIONS[path];
  }
  
  // Check dynamic routes
  const routeKeys = Object.keys(ROUTE_PERMISSIONS);
  for (const route of routeKeys) {
    if (route.includes(':')) {
      const pattern = route.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(path)) {
        return ROUTE_PERMISSIONS[route];
      }
    }
  }
  
  return [];
};