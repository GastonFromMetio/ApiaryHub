export async function apiRequest(path, { method = 'GET', token, body } = {}) {
    const headers = {
        Accept: 'application/json',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(path, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
        const validationErrors = payload?.errors ? Object.values(payload.errors).flat().join(' ') : '';
        throw new Error(validationErrors || payload?.message || 'Request failed.');
    }

    return payload;
}
