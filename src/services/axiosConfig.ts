import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API base URL
const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'https://api.edrilla.com/';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3600000, // 1 hour in milliseconds
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: import('axios').InternalAxiosRequestConfig): import('axios').InternalAxiosRequestConfig => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['x-access-token'] = token;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        config.headers['x-refresh-token'] = refreshToken;
      }
    }

    // Inject tenant slug
    let tenantSlug = localStorage.getItem('x-tenant-slug') || localStorage.getItem('tenantSlug') || localStorage.getItem('currentTenantSlug');
    const role = localStorage.getItem('tenantRole');

    // Force extraction from user object if missing or stuck on 'default' for non-superadmins
    if (!tenantSlug || (tenantSlug === 'default' && role !== 'platform_superadmin')) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          let user = JSON.parse(userStr);
          if (Array.isArray(user) && user.length > 0) user = user[0];

          if (user) {
            tenantSlug = user.tenantSlug || user.slug || user.tenantId?.slug || user.data?.slug || user.tenantId;
          }
        }
      } catch (e) { /* ignore */ }
    }

    // platform_superadmin defaults to 'default' unless a specific slug is already set (impersonation)
    if (role === 'platform_superadmin' && !tenantSlug) {
      tenantSlug = 'default';
    }
    // tenant_owner MUST NOT use 'default'. If still empty/default, use ID as last resort.
    else if (role === 'tenant_owner' && (!tenantSlug || tenantSlug === 'default')) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          let user = JSON.parse(userStr);
          if (Array.isArray(user) && user.length > 0) user = user[0];

          if (user) {
            tenantSlug = user.tenantId || user._id; // Absolute last resort
          }
        }
      } catch (e) { /* ignore */ }
    }

    if (tenantSlug && config.headers) {
      // Ensure the slug is a clean string
      const cleanSlug = String(tenantSlug).trim().split(' ')[0];
      config.headers['x-tenant-slug'] = cleanSlug;
      // Add debug header to help identify what's being sent
      config.headers['x-debug-slug-resolved'] = cleanSlug;
    }

    // DEBUG: Log the final request state (useful for troubleshooting impersonation)
    console.log(`%c[AXIOS] Request to ${config.url}`, "color: #4CAF50; font-weight: bold", {
      token: token ? (token.substring(0, 15) + "...") : "MISSING",
      'x-tenant-slug': config.headers['x-tenant-slug'],
      'x-debug-slug-resolved': config.headers['x-debug-slug-resolved'],
      role: role
    });

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      console.warn("401 Unauthorized detected - [DEBUG] Token wipe disabled", error.config?.url);
      /* 
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      */
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;