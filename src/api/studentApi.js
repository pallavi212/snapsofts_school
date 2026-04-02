import { request } from './config';

export const studentApi = {
    getAll: () => request('GET', '/students'),
    countByClass: () => request('GET', '/students/count-by-class'),
    getByParent: (userId) => request('GET', `/students/by-parent/${userId}`),
    getProfile: (userId) => request('GET', `/students/profile/${userId}`),
    create: (body) => request('POST', '/students', body),
    update: (id, body) => request('PUT', `/students/${id}`, body),
    remove: (id) => request('DELETE', `/students/${id}`),
};
