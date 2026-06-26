export class ClienteResponse {
    constructor(
        codCliente,
        nombre,
        apellido,
        numeroTelefono,
        cedula,
        numeroCompra,
        descuento      
    ) {
        this.codCliente     = codCliente;
        this.nombre         = nombre;
        this.apellido       = apellido;
        this.numeroTelefono = numeroTelefono;
        this.cedula         = cedula;
        this.numeroCompra   = numeroCompra;
        this.descuento      = descuento;  
    }

    static fromJson(json) {
        return new ClienteResponse(
            json.codCliente,
            json.nombre,
            json.apellido,
            json.numeroTelefono,
            json.cedula,
            json.numeroCompra,
            json.descuento      
        );
    }

    get nombreCompleto() {
        return `${this.nombre} ${this.apellido}`;
    }
}