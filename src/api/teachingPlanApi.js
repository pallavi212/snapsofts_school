import { BASE_URL } from './config';

const req = async (method, path, body) => {
    const res = await fetch(`${BASE_URL}${path}`, { method, body });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
};

export const teachingPlanApi = {
    getByTeacher: (teacher_id, class_id, week_start) => {
        const p = new URLSearchParams({ teacher_id });
        if (class_id) p.append('class_id', class_id);
        if (week_start) p.append('week_start', week_start);
        return req('GET', `/teaching-plans?${p}`);
    },
    getByClass: (class_id, week_start) => {
        const p = week_start ? `?week_start=${week_start}` : '';
        return req('GET', `/teaching-plans/class/${class_id}${p}`);
    },
    getHomework: (class_id) =>
        req('GET', `/teaching-plans/class/${class_id}/homework`),
    create: async (formData) => {
        const res = await fetch(`${BASE_URL}/teaching-plans`, { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Save failed');
        return data;
    },
    update: async (id, formData) => {
        const res = await fetch(`${BASE_URL}/teaching-plans/${id}`, { method: 'PUT', body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Update failed');
        return data;
    },
    delete: (id) => req('DELETE', `/teaching-plans/${id}`),
    fileUrl: (filename) => `${BASE_URL.replace('/api', '')}/uploads/plans/${filename}`,
    // keep old name as alias
    pdfUrl: (filename) => `${BASE_URL.replace('/api', '')}/uploads/plans/${filename}`,
};
