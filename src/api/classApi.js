import { request } from './config';

export const classApi = {
    getAll: () => request('GET', '/classes'),
};
