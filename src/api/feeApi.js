import { request } from './config';

export const feeApi = {
    getStructure: () => request('GET', '/fees/structure'),
    getPayments: () => request('GET', '/fees/payments'),
    getPaymentsByParent: (userId) => request('GET', `/fees/payments/by-parent/${userId}`),
    getStudentPayments: (studentId) => request('GET', `/fees/payments/${studentId}`),
    addPayment: (body) => request('POST', '/fees/payments', body),
};
