// src/config/rolePermissions.js
// Define which routes each role can access

export const ROLES = {
  ADMIN: 'ADMIN',
  CLUB_MANAGER: 'CLUB_MANAGER',
  ASS_CLUB_MANAGER: 'ASS_CLUB_MANAGER',
  FOH: 'FOH',
  PROGRAM_SPECIALIST: 'PROGRAM_SPECIALIST',
  FITNESS_MANAGER: 'FITNESS_MANAGER',
  ASS_FITNESS_MANAGER: 'ASS_FITNESS_MANAGER',
  TRAINER: 'TRAINER',
  MARKETING_MANAGER: 'MARKETING_MANAGER',
  FINANCE_MANAGER: 'FINANCE_MANAGER',
  FINANCE_MANAGER_CLUB: 'FINANCE_MANAGER_CLUB',
  FINANCE_MANAGER_CORPORATE: 'FINANCE_MANAGER_CORPORATE',
};

export const ROUTE_PERMISSIONS = {
  // Dashboard - all roles
  '/': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],

  // ─── Lead Management ────────────────────────────────────────────────────────
  '/all-leads': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST', 'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER',
    'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/all-leads/:id': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/edit-lead-details/:id': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE', 'MARKETING_MANAGER',
  ],
  '/lead-follow-up/:id': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER',
  ],
  '/my-follow-ups': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER',
    'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],

  // ─── Member Management ──────────────────────────────────────────────────────
  '/all-members': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER',
    'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/all-members/:id': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER',
    'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/member/:id': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER',
    'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/member-follow-up/:id': ['ADMIN', 'FOH'],

  // ─── Workout Plans ──────────────────────────────────────────────────────────
  '/workout-plans': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER',
  ],
  '/create-workout-plan': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER',
  ],
  '/create-workout-plan/:id': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER',
  ],

  // ─── Exercises ──────────────────────────────────────────────────────────────
  '/exercises': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER',
  ],
  '/exercises-categories': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
  ],

  // ─── Lost & Found ───────────────────────────────────────────────────────────
  '/lost-found': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER',
  ],

  // ─── Birthday / Anniversary ─────────────────────────────────────────────────
  '/birthday-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER_CORPORATE',
  ],
  '/anniversary-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER_CORPORATE',
  ],

  // ─── Appointments & Bookings ────────────────────────────────────────────────
  '/reports/appointments/all-trial-appointments': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    // Finance Manager Club and Corporate do NOT have access per RBAC
  ],
  '/reports/all-bookings': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/all-orders': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST', 'FITNESS_MANAGER',
    'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/nourish-orders': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],

  // ─── Group Class ────────────────────────────────────────────────────────────
  '/group-class': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER',
    'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/group-class/:id': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER',
    'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],

  // ─── Products & Companies ───────────────────────────────────────────────────
  '/products': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'PROGRAM_SPECIALIST', 'FOH',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER',
    'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/companies': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/club': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/option-list': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/role-list': ['ADMIN'],
  '/module-list': ['ADMIN'],

  // ─── Marketing ──────────────────────────────────────────────────────────────
  '/challenge-list': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/challenge-participants-list/:id': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/send-mail': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER'],
  '/send-mail-list': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER'],
  '/send-mail-list/:id': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER'],
  '/email-template-list': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'PROGRAM_SPECIALIST', 'MARKETING_MANAGER',
  ],
  '/email-template': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'PROGRAM_SPECIALIST', 'MARKETING_MANAGER',
  ],
  '/email-template/:id': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'PROGRAM_SPECIALIST', 'MARKETING_MANAGER',
  ],
  '/send-sms': ['ADMIN', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/send-sms-list': ['ADMIN', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/send-sms-list/:id': ['ADMIN', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/notification-list': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'PROGRAM_SPECIALIST', 'MARKETING_MANAGER',
    'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/marketing-reports/send-notification': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'MARKETING_MANAGER',
  ],
  '/reports/marketing-reports/send-notification/:id': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'MARKETING_MANAGER',
  ],
  '/marketing-banner': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'MARKETING_MANAGER',
  ],
  '/send-whatsapp-list': ['ADMIN', 'MARKETING_MANAGER'],
  '/coupons': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH',
    'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/marketing-reports/email-list': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'PROGRAM_SPECIALIST', 'MARKETING_MANAGER',
    'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/marketing-reports/sms-list': ['ADMIN', 'MARKETING_MANAGER', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER'],

  // ─── Configuration ──────────────────────────────────────────────────────────
  '/on-boarding-list': [
    'ADMIN', 'PROGRAM_SPECIALIST', 'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER',
    'MARKETING_MANAGER', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/splash-screen': ['ADMIN', 'MARKETING_MANAGER'],
  '/studio': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/services': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/recovery-services': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/package-category': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/packages': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/product-category': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/subscription-plan': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/staff': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/club-gallery': [
    'ADMIN', 'PROGRAM_SPECIALIST', 'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER',
    'TRAINER', 'MARKETING_MANAGER', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/faq-category': ['ADMIN', 'PROGRAM_SPECIALIST', 'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER'],
  '/faq-list': ['ADMIN', 'PROGRAM_SPECIALIST', 'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER'],

  // ─── Sales Reports ──────────────────────────────────────────────────────────
  '/reports/sales-reports/membership-sales-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/sales-reports/all-enquiries-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'PROGRAM_SPECIALIST',
    'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/sales-reports/active-member-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/sales-reports/lead-source-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'PROGRAM_SPECIALIST',
    'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/sales-reports/group-classes-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/sales-reports/pt-revenue-report': [
    'ADMIN', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER',
  ],
  '/reports/sales-reports/pt-revenue-report-list/:id': [
    'ADMIN', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER',
  ],

  // ─── Finance Reports ────────────────────────────────────────────────────────
  '/reports/finance-reports/all-invoice-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/finance-reports/cancelled-paid-invoice': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/finance-reports/refund-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'ASS_FITNESS_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/finance-reports/collection-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/finance-reports/pending-collection': ['ADMIN', 'FINANCE_MANAGER'],
  '/reports/finance-reports/tds-report': ['ADMIN', 'FINANCE_MANAGER'],
  '/reports/finance-reports/advance-payments-report': ['ADMIN', 'FINANCE_MANAGER'],
  '/reports/finance-reports/monthly-targets-report': ['ADMIN', 'FINANCE_MANAGER', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER'],
  '/reports/finance-reports/set-incentive-policy': ['ADMIN', 'FINANCE_MANAGER'],
  '/reports/finance-reports/refund-requests': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/finance-reports/revenue-recognition-report': [
    'ADMIN', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],

  // ─── Operations Reports ─────────────────────────────────────────────────────
  '/reports/operations-reports/renewal-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/operations-reports/member-checkins-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/operations-reports/member-checkins-report/:id': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/operations-reports/membership-expiry-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/operations-reports/service-expiry-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/operations-reports/irregular-members-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/operations-reports/active-client-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/operations-reports/attendance-heatmap-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'FOH', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/operations-reports/referral-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/operations-reports/inactive-client-report': [
    'ADMIN', 'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER',
    'CLUB_MANAGER', 'ASS_CLUB_MANAGER',
  ],
  '/reports/operations-reports/membership-frozen-report': [
    'ADMIN', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
    'CLUB_MANAGER', 'ASS_CLUB_MANAGER',
  ],

  // ─── Marketing Reports ──────────────────────────────────────────────────────
  '/reports/marketing-reports/lead-source-performance': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'PROGRAM_SPECIALIST',
    'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/marketing-reports/customer-segmentation-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER',
    'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/marketing-reports/discount-codes-performance': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER',
    'MARKETING_MANAGER', 'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/marketing-reports/engagement-tracking-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'PROGRAM_SPECIALIST',
    'FITNESS_MANAGER', 'ASS_FITNESS_MANAGER', 'TRAINER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/marketing-reports/email-automation-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER', 'MARKETING_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/reports/marketing-reports/sms-delivery-report': ['ADMIN', 'MARKETING_MANAGER'],
  '/reports/marketing-reports/event-community-engagement': ['ADMIN', 'MARKETING_MANAGER'],

  // ─── Leaderboard ────────────────────────────────────────────────────────────
  '/leaderboard/sales/revenue-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/leaderboard/sales/call-logs': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/leaderboard/sales/call-logs/call-log-report': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/leaderboard/pt-report/pt-revenue': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/leaderboard/pt-report/pt-revenue/:id': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
  '/leaderboard/pt-report/pt-sessions': [
    'ADMIN', 'CLUB_MANAGER', 'ASS_CLUB_MANAGER',
    'FINANCE_MANAGER', 'FINANCE_MANAGER_CLUB', 'FINANCE_MANAGER_CORPORATE',
  ],
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
  if (ROUTE_PERMISSIONS[path]) {
    return ROUTE_PERMISSIONS[path];
  }

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