import { request } from './config';

export const pettyCashApi = {
    getSummary: () => request('GET', '/petty-cash/summary'),
    getExpenses: () => request('GET', '/petty-cash/expenses'),
    addExpense: (body) => request('POST', '/petty-cash/expenses', body),
    deleteExpense: (id) => request('DELETE', `/petty-cash/expenses/${id}`),
    getFund: () => request('GET', '/petty-cash/fund'),
    addTopUp: (body) => request('POST', '/petty-cash/fund', body),
    getCategories: () => request('GET', '/petty-cash/categories'),
};
