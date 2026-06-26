export default class HttpService {
    baseUrl = 'https://apparelpos-cac6btffezf5g2cy.canadacentral-01.azurewebsites.net/api';

    _getHeaders() {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    async get(endpoint) {
        const response = await fetch(this.baseUrl + endpoint, {
            method: 'GET',
            headers: this._getHeaders()
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Error al obtener datos.');
        }
        return await response.json();
    }

    async post(endpoint, body) {
        const response = await fetch(this.baseUrl + endpoint, {
            method: 'POST',
            headers: this._getHeaders(),
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Error al enviar datos.');
        }
        return await response.json();
    }

    async put(endpoint, body) {
        const response = await fetch(this.baseUrl + endpoint, {
            method: 'PUT',
            headers: this._getHeaders(),
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const error = await response.text().catch(() => '');
            throw new Error(error || 'Error al actualizar datos.');
        }
        const text = await response.text();
        return text ? JSON.parse(text) : true;
    }

    async delete(endpoint) {
        const response = await fetch(this.baseUrl + endpoint, {
            method: 'DELETE',
            headers: this._getHeaders()
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Error al eliminar.');
        }
        return true;
    }
}