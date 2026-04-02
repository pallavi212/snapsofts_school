import { request } from './config';

export const calendarApi = {
    getAll: () => request('GET', '/calendar'),
};
