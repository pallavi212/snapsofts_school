import { request } from './config';

export const parentApi = {
    getAll: () => request('GET', '/parents'),
    getById: (id) => request('GET', `/parents/${id}`)
};
