export class ClienteRequest {
    constructor(
        nombre,
        apellido,
        numeroTelefono,
        cedula,
        numeroCompra
    ) {
        this.nombre         = nombre;
        this.apellido       = apellido;
        this.numeroTelefono = numeroTelefono;
        this.cedula         = cedula;
        this.numeroCompra   = numeroCompra;
    }

    toJson() {
        return {
            nombre:         this.nombre,
            apellido:       this.apellido,
            numeroTelefono: this.numeroTelefono,
            cedula:         this.cedula,
            numeroCompra:   this.numeroCompra
        };
    }
}