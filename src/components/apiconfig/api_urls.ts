export const API_URLS = {
  REGISTRATION: {
    POST_REGISTRATION: "api/register/",
  },
  LOGIN: {
    POST_LOGIN: "/api/login/",
  },

  ROLES: {
    GET_ROLES: "/api/roles/",
  },

  REPORTS: {
    GET_REPORTS: "/api/calls-summary/",
  },

  TELLE_CALLERS: {
    GET_TELLE_CALLERS: "/api/telecallers/",
    POST_TELLE_CALLERS: "/api/telecallers/",
    PATCH_TELLE_CALLERS: (id) => `/api/telecallers/${id}/`,
    DELETE_TELLE_CALLERS: (id) => `/api/telecallers/${id}/`,

  },

  FORGOT_PASSWORD: {
    POST_FORGOT_PASSWORD: "/api/forgot-password/",
  },

  BRANCH: {
    POST_BRANCH: "/api/branches/",
    GET_BRANCH: "/api/branches/",
    PATCH_BRANCH: (id) => `api/branches/${id}/`,
    DELETE_BRANCH: (id) => `api/branches/${id}/`,
  },

  ADS: {
    POST_ADS: "/api/mettads/",
    GET_ADS: "/api/mettads/",
    PATCH_ADS: (id) => `/api/mettads/${id}/`,
    DELETE_ADS: (id) => `/api/mettads/${id}/`,
  },

  SERVICES: {
    POST_SERVICES: "/api/services/",
    GET_SERVICES: "/api/services/",
    PATCH_SERVICES: id=> `/api/services/${id}/`,
    DELETE_SERVICES: id=> `/api/services/${id}/`
  },

  COURSES: {
    POST_COURSES: "/api/courses/",
    GET_COURSES: "/api/courses/",
    PATCH_COURSES: (id) => `/api/courses/${id}/`,
    DELETE_COURSES: (id) => `/api/courses/${id}/`
  },

  DASHBOARD: {
    GET_STATS: "/api/dashboard/",
  },
  ENQUIRY: {
    POST_ENQUIRY: "/api/enquiries/",
    GET_ENQUIRY: "/api/enquiries/",
    GET_ACTIVE_ENQUIRY: "/api/enquiries/active/",
    GET_CLOSED_ENQUIRY: "/api/enquiries/closed/",
    GET_ENQUIRY_ID: (id: string) => `/api/enquiries/${id}/`,
    PATCH_ENQUIRY: (id) => `/api/enquiries/${id}/`,
    DELETE_ENQUIRY: (id) => `/api/enquiries/${id}/`,
  },

  BULK_UPLOAD: {
    POST_CSV: "/api/enquiries/import/"
  },

  CALLS: {

    GET_FOLLOW_UPS: "/api/calls/follow-ups/",
    GET_NOT_ANSWERED: "/api/calls/not-answered/",
    GET_WALKIN_LIST: "/api/calls/walk-in-list/",

    POST_CALLS: '/api/calls/',
    GET_CALLS:"/api/calls/",
    PATCH_CALLS: (id)=> `/api/calls/${id}/`,
    DELETE_CALLLS: (id)=> `/api/calls/${id}/`

  },
  NOTIFICATIONS: {
    GET_NOTIFICATIONS: "/api/reminders/",
  },
};