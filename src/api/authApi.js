import { request } from './config';

export const authApi = {
    login: (body) => request('POST', '/auth/login', body),
    register: (body) => request('POST', '/auth/register', body),
};
