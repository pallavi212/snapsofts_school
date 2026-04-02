import { request } from './config';

export const userApi = {
    getAll: () => request('GET', '/users'),
    getParents: () => request('GET', '/users/parents'),
    create: (body) => request('POST', '/users', body),
    update: (id, body) => request('PUT', `/users/${id}`, body),
    remove: (id) => request('DELETE', `/users/${id}`),
};
