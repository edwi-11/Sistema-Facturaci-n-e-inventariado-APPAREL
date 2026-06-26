export class ProductoResponse {
    constructor(
        codigoProducto,
        nombre,
        descripcion,
        talla,
        marca,
        estado,
        precio,
        stock
    ) {
        this.codigoProducto = codigoProducto;
        this.nombre         = nombre;
        this.descripcion    = descripcion;
        this.talla          = talla;
        this.marca          = marca;
        this.estado         = estado;
        this.precio         = precio;
        this.stock          = stock ?? 0;
    }

    static fromJson(json) {
        return new ProductoResponse(
            json.codigoProducto,
            json.nombre,
            json.descripcion,
            json.talla,
            json.marca,
            json.estado,
            json.precio,
            json.stock
        );
    }

    get estaActivo() {
        return this.estado === 1;
    }

    get tieneStock() {
        return this.stock > 0;
    }
}