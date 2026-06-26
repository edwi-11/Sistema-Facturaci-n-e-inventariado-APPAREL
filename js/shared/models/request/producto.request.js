export class ProductoRequest {
    constructor(codigoProducto, nombre, descripcion, talla, marca, estado, precio, stock) {
        this.codigoProducto = codigoProducto;
        this.nombre      = nombre;
        this.descripcion = descripcion;
        this.talla       = talla;
        this.marca       = marca;
        this.estado      = estado;
        this.precio      = precio;
        this.stock       = stock;
    }

    toJson() {
        const json = {
            nombre:      this.nombre,
            descripcion: this.descripcion,
            talla:       this.talla,
            marca:       this.marca,
            estado:      this.estado,
            precio:      this.precio,
            stock:       this.stock
        };
        if (this.codigoProducto) {
            json.codigoProducto = this.codigoProducto;
        }
        return json;
    }
}