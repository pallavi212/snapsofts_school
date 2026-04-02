import { request } from './config';

export const teacherApi = {
    getAll: () => request('GET', '/teachers'),
    create: (body) => request('POST', '/teachers', body),
    update: (id, body) => request('PUT', `/teachers/${id}`, body),
    remove: (id) => request('DELETE', `/teachers/${id}`),
};
