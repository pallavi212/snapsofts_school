import { request } from './config';

export const activityLogApi = {
    getAll: (params = {}) => {
        const q = new URLSearchParams();
        if (params.module) q.append('module', params.module);
        if (params.action) q.append('action', params.action);
        if (params.user_id) q.append('user_id', params.user_id);
        if (params.limit) q.append('limit', params.limit);
        return request('GET', `/activity-logs?${q}`);
    },
};
