import { request } from './config';

export const notificationApi = {
    getForParent: (parentUserId) => request('GET', `/notifications/${parentUserId}`),
    getAll: () => request('GET', '/notifications'),
    send: (body) => request('POST', '/notifications', body),
    markRead: (id, parentUserId) => request('PUT', `/notifications/${id}/read`, { parentUserId }),
    delete: (id) => request('DELETE', `/notifications/${id}`),
};
