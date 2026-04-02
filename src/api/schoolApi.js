import { request } from './config';

export const schoolApi = {
    get: () => request('GET', '/school-info'),
    update: (body) => request('PUT', '/school-info', body),
};
