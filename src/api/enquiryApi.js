import { request } from './config';

export const enquiryApi = {
    getAll: () => request('GET', '/enquiries'),
    create: (body) => request('POST', '/enquiries', body),
    update: (id, body) => request('PUT', `/enquiries/${id}`, body),
    remove: (id) => request('DELETE', `/enquiries/${id}`),
};
