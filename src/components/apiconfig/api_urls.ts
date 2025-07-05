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

  DASHBOARD: {
    GET_STATS: "/api/dashboard/",
  },
  ENQUIRY: {
    POST_ENQUIRY: "/api/enquiries/",
    GET_ENQUIRY: "/api/enquiries/",
    PATCH_ENQUIRY: (id) => `/api/enquiries/${id}/`,
    DELETE_ENQUIRY: (id) => `/api/enquiries/${id}/`,
  },
  CALLS: {
    GET_FOLLOW_UPS: "/api/calls/follow-ups/",
    GET_NOT_ANSWERED: "/api/calls/not-answered/",
    GET_WALKIN_LIST: "/api/calls/walk-in-list/",
  }
};