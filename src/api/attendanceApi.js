import { request } from './config';

export const attendanceApi = {
    getByClassAndDate: (class_id, date) => request('GET', `/attendance?class_id=${class_id}&date=${date}`),
    getByStudent: (studentId) => request('GET', `/attendance/student/${studentId}`),
    save: (body) => request('POST', '/attendance', body),
};
