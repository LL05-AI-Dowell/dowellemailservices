import { servicesAxiosInstance } from './config';
import Cookies from 'js-cookie';


export const getServerStatus = async () => {
  const response = await servicesAxiosInstance.get('/api/v1/self');
  return response.data;
};

export const getServerHealth = async () => {
  const response = await servicesAxiosInstance.get('/api/v1/health');
  return response.data;
};

export const loginUser = async (email) => {
  const response = await servicesAxiosInstance.post('/api/v1/login', { email });
  return response.data;
};

export const generateAccessTokenByRefreshToken = async (refreshToken) => {
  const response = await servicesAxiosInstance.post('/api/v1/refresh-token', { refreshtoken: refreshToken });
  return response.data;
};

export const verifyEmailAddress = async (email) => {
  const accessToken = Cookies.get('accessToken');
  
  const response = await servicesAxiosInstance.post('/api/v1/verify-email', 
    { email },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};

export const selfIdentification = async () => {
  const accessToken = Cookies.get('accessToken');

  const response = await servicesAxiosInstance.get('/api/v1/self-identification', {
      headers: {
          Authorization: `Bearer ${accessToken}`,
      },
  });
  
  return response.data;
};
