import HttpService from './http.service.js';
import { ProductoResponse } from '../models/response/producto.response.js';

export class ProductoService extends HttpService {

    async getTodosProductos() {
        const data = await this.get('/Productos/ObtenerTodosProductos');
        return data.map(item => ProductoResponse.fromJson(item));
    }

    async getProducto(codigoProducto) {
        const data = await this.get(`/Productos/ObtenerProductos/${codigoProducto}`);
        return ProductoResponse.fromJson(data[0]); 
    }

    async getStockActual(codigoProducto) {
        const data = await this.get(`/Productos/ObtenerStockActual/${codigoProducto}`);
        return data;
    }

    async createProducto(request) {
    const response = await fetch(`${this.baseUrl}/Productos/InsertarProducto`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(request.toJson())
    });
    
    if (!response.ok) throw new Error('Error al insertar producto.');
    return true;
    }

    async updateProducto(codigoProducto, request) {
    const response = await fetch(`${this.baseUrl}/Productos/ActualizarProducto/${codigoProducto}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(request.toJson())
    });
    
    if (!response.ok) throw new Error('Error al actualizar datos.');
    return true;
    }

    async deleteProducto(codigoProducto) {
        return await this.delete(`/Productos/EliminarProducto/${codigoProducto}`);
    }
}