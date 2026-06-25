import HttpService from '../services/http.service.js';
import { ClienteResponse } from '../models/response/cliente.response.js';

export class ClienteService extends HttpService {

    async getClientes() {
        const data = await this.get('/api/Cliente');
        return data.map(item => ClienteResponse.fromJson(item));
    }

    async getClienteById(id) {
        const data = await this.get(`/api/Cliente/${id}`);
        return ClienteResponse.fromJson(data);
    }

    async getByTelefono(telefono) {
        const data = await this.get(`/api/Cliente/telefono/${telefono}`);
        return ClienteResponse.fromJson(data);
    }

    async createCliente(request) {
        return await this.post('/api/Cliente', request.toJson());
    }

    async updateCliente(id, request) {
        return await this.put(`/api/Cliente/${id}`, request.toJson());
    }

    async deleteCliente(id) {
        return await this.delete(`/api/Cliente/${id}`);
    }
}