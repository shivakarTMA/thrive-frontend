// src/config/rolePermissions.js
// Define which routes each role can access

export const ROLES = {
  ADMIN: 'ADMIN',
  MARKETING_MANAGER: 'MARKETING_MANAGER',
  FINANCE_MANAGER: 'FINANCE_MANAGER',
  FOH: 'FOH',
  TRAINER: 'TRAINER',
  CLUB_MANAGER: 'CLUB_MANAGER',
  FITNESS_MANAGER: 'FITNESS_MANAGER',
};

export const ROUTE_PERMISSIONS = {
  // Common routes accessible to all authenticated users
  '/': ['ADMIN', 'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER'],
  
  // Lead Management
  '/all-leads': ['ADMIN', 'FOH', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/all-leads/:id': ['ADMIN', 'FOH', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/edit-lead-details/:id': ['ADMIN', 'FOH', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/lead-follow-up/:id': ['FOH', 'TRAINER', 'FITNESS_MANAGER', 'CLUB_MANAGER', 'ADMIN'],
  '/my-follow-ups': ['FOH', 'TRAINER', 'FITNESS_MANAGER', 'CLUB_MANAGER', 'ADMIN', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  
  // Member Management
  '/all-members': ['ADMIN', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/all-members/:id': ['ADMIN', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/member/:id': ['ADMIN', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/member-follow-up/:id': ['ADMIN', 'FOH'],
  
  // Workout Plans
  '/workout-plans': ['ADMIN', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER'],
  '/create-workout-plan': ['ADMIN', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER'],
  '/create-workout-plan/:id': ['ADMIN', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER'],
  '/exercises': ['ADMIN', 'FITNESS_MANAGER', 'CLUB_MANAGER'],
  '/exercises-categories': ['ADMIN', 'FITNESS_MANAGER', 'CLUB_MANAGER', 'MARKETING_MANAGER'],
  
  // Lost & Found
  '/lost-found': ['ADMIN', 'FOH', 'CLUB_MANAGER'],
  
  // Appointments & Bookings
  '/reports/appointments/all-trial-appointments': ['ADMIN', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/all-bookings': ['ADMIN', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER', 'FINANCE_MANAGER', 'CLUB_MANAGER'],
  '/reports/all-orders': ['ADMIN', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER', 'FINANCE_MANAGER', 'CLUB_MANAGER'],
  '/nourish-orders': ['ADMIN', 'FOH', 'FINANCE_MANAGER', 'CLUB_MANAGER', 'MARKETING_MANAGER'],
  
  // Products & Companies
  '/products': ['ADMIN', 'CLUB_MANAGER', 'MARKETING_MANAGER'],
  '/companies': ['ADMIN', 'CLUB_MANAGER'],
  '/club': ['ADMIN', 'CLUB_MANAGER'],
  '/option-list': ['ADMIN', 'CLUB_MANAGER'],
  '/role-list': ['ADMIN'],
  '/module-list': ['ADMIN'],
  
  // Marketing
  '/challenge-list': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER', 'FOH', 'FITNESS_MANAGER'],
  '/challenge-participants-list/:id': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER', 'FITNESS_MANAGER', 'FOH'],
  '/send-mail': ['ADMIN', 'MARKETING_MANAGER','CLUB_MANAGER'],
  '/send-mail-list': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  '/send-mail-list/:id': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  '/email-template-list': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  '/email-template': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  '/email-template/:id': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  '/send-sms': ['ADMIN', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/send-sms-list': ['ADMIN', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/send-sms-list/:id': ['ADMIN', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/notification-list': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  '/reports/marketing-reports/send-notification': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  '/reports/marketing-reports/send-notification/:id': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  '/marketing-banner': ['ADMIN', 'MARKETING_MANAGER'],
  '/send-whatsapp-list': ['ADMIN', 'MARKETING_MANAGER'],
  '/coupons': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER', 'FINANCE_MANAGER'],
  '/reports/marketing-reports/email-list': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  '/reports/marketing-reports/sms-list': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  
  // Configuration
  '/on-boarding-list': ['ADMIN', 'MARKETING_MANAGER'],
  '/splash-screen': ['ADMIN', 'MARKETING_MANAGER'],
  '/studio': ['ADMIN', 'CLUB_MANAGER', 'MARKETING_MANAGER'],
  '/services': ['ADMIN', 'CLUB_MANAGER', 'MARKETING_MANAGER'],
  '/recovery-services': ['ADMIN', 'CLUB_MANAGER', 'MARKETING_MANAGER'],
  '/package-category': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  '/packages': ['ADMIN', 'CLUB_MANAGER', 'MARKETING_MANAGER'],
  '/group-class': ['ADMIN', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/group-class/:id': ['ADMIN', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/product-category': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER'],
  '/subscription-plan': ['ADMIN', 'CLUB_MANAGER', 'MARKETING_MANAGER'],
  '/staff': ['ADMIN', 'CLUB_MANAGER'],
  '/club-gallery': ['ADMIN', 'CLUB_MANAGER', 'MARKETING_MANAGER'],
  '/faq-category': ['ADMIN', 'MARKETING_MANAGER'],
  '/faq-list': ['ADMIN', 'MARKETING_MANAGER'],
  '/birthday-report': ['ADMIN','FOH', 'MARKETING_MANAGER', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER'],
  '/anniversary-report': ['ADMIN','FOH', 'MARKETING_MANAGER', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER'],
  
  // Sales Reports
  '/reports/sales-reports/membership-sales-report': ['ADMIN', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/sales-reports/all-enquiries-report': ['ADMIN', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/sales-reports/active-member-report': ['ADMIN', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/sales-reports/lead-source-report': ['ADMIN', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/sales-reports/group-classes-report': ['ADMIN', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/sales-reports/pt-revenue-report': ['ADMIN', 'FINANCE_MANAGER', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER'],
  '/reports/sales-reports/pt-revenue-report-list/:id': ['ADMIN', 'FINANCE_MANAGER', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER'],
  
  // Finance Reports
  '/reports/finance-reports/all-invoice-report': ['ADMIN', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/finance-reports/cancelled-paid-invoice': ['ADMIN', 'FINANCE_MANAGER', 'CLUB_MANAGER'],
  '/reports/finance-reports/refund-report': ['ADMIN', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/finance-reports/collection-report': ['ADMIN', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/finance-reports/pending-collection': ['ADMIN', 'FINANCE_MANAGER'],
  '/reports/finance-reports/tds-report': ['ADMIN', 'FINANCE_MANAGER'],
  '/reports/finance-reports/advance-payments-report': ['ADMIN', 'FINANCE_MANAGER'],
  '/reports/finance-reports/monthly-targets-report': ['ADMIN', 'FINANCE_MANAGER', 'CLUB_MANAGER'],
  '/reports/finance-reports/set-incentive-policy': ['ADMIN', 'FINANCE_MANAGER'],
  '/reports/finance-reports/refund-requests': ['ADMIN', 'FINANCE_MANAGER', 'CLUB_MANAGER'],
  '/reports/finance-reports/revenue-recognition-report': ['ADMIN', 'FINANCE_MANAGER'],
  
  // Operations Reports
  '/reports/operations-reports/renewal-report': ['ADMIN', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/operations-reports/member-checkins-report': ['ADMIN', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/operations-reports/member-checkins-report/:id': ['ADMIN', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/operations-reports/membership-expiry-report': ['ADMIN', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/operations-reports/service-expiry-report': ['ADMIN', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/operations-reports/irregular-members-report': ['ADMIN', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/operations-reports/active-client-report': ['ADMIN', 'FOH', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/operations-reports/attendance-heatmap-report': ['ADMIN', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/operations-reports/referral-report': ['ADMIN', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/operations-reports/inactive-client-report': ['ADMIN', 'FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER'],
  '/reports/operations-reports/membership-frozen-report': ['ADMIN', 'FINANCE_MANAGER', 'CLUB_MANAGER'],
  
  // Marketing Reports
  '/reports/marketing-reports/lead-source-performance': ['ADMIN', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  // '/reports/marketing-reports/thrive-coins-usage': ['ADMIN', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/customer-segmentation-report': ['ADMIN', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/discount-codes-performance': ['ADMIN', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/engagement-tracking-report': ['ADMIN', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/email-automation-report': ['ADMIN', 'CLUB_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER'],
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