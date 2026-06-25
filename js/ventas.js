import { ClienteService } from './shared/services/cliente.service.js';
import { ClienteRequest } from './shared/models/request/cliente.request.js';

const clienteService = new ClienteService();

// ELEMENTOS DEL DOM 
const telefonoInput     = document.getElementById("telefonoCliente");
const nombreInput       = document.getElementById("nombreCliente");
const descuentoInput    = document.getElementById("descuentoCliente");

const tabla             = document.getElementById("tablaProductos");
const btnAgregarProducto = document.getElementById("btnAgregarProducto");

const subtotalEl        = document.getElementById("subtotalVenta");
const descuentoEl       = document.getElementById("descuentoVenta");
const totalEl           = document.getElementById("totalVenta");

const modalConfirmar    = document.getElementById("modalConfirmar");
const modalProductos    = document.getElementById("modalProductos");
const buscarProductoInput = document.getElementById("buscarProducto");

const btnGuardar        = document.getElementById("btnGuardarVenta");
const btnImprimir       = document.getElementById("btnImprimir");
const btnCancelar       = document.getElementById("btnCancelar");
const btnSi             = document.getElementById("btnSi");
const btnNo             = document.getElementById("btnNo");
const btnNuevoCliente   = document.getElementById("btnNuevoCliente");
const cerrarProductos   = document.getElementById("cerrarProductos");

// Poner fecha de hoy por defecto
const fechaInput = document.getElementById("fechaVenta");
if (fechaInput) {
    const hoy = new Date().toISOString().split("T")[0];
    fechaInput.value = hoy;
}

// CLIENTE POR TELÉFONO 
telefonoInput.addEventListener("blur", async () => {
    const telefono = telefonoInput.value.trim();
    if (!telefono) return;

    try {
        const cliente = await clienteService.getByTelefono(telefono);
        nombreInput.value    = `${cliente.nombre} ${cliente.apellido}`;
        descuentoInput.value = cliente.descuento ?? 0;
        calcularTotal(); // recalcular si cambia el descuento
    } catch (e) {
        nombreInput.value    = "";
        descuentoInput.value = "";
        alert("Cliente no encontrado. Puedes resgistrarlo como nuevo.");
    }
});

// AGREGAR FILA DE PRODUCTO 
btnAgregarProducto.addEventListener("click", () => {
    agregarFilaProducto();
});

// Doble clic = abrir modal de búsqueda
btnAgregarProducto.addEventListener("dblclick", () => {
    modalProductos.classList.remove("hidden");
    buscarProductoInput.focus();
});

function agregarFilaProducto(datos = {}) {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td><input class="codigo" type="text" value="${datos.codigo ?? ""}" placeholder="Cód."></td>
        <td><input class="nombre" type="text" value="${datos.nombre ?? ""}" readonly placeholder="Producto"></td>
        <td><input class="cantidad" type="number" value="${datos.cantidad ?? 1}" min="1"></td>
        <td><input class="precio" type="number" value="${datos.precio ?? ""}" step="0.01" placeholder="0.00"></td>
        <td><input class="subtotal" type="text" readonly value="${datos.subtotal ?? "0.00"}"></td>
        <td><button class="delete-btn" title="Eliminar fila">🗑</button></td>
    `;

    // Buscar producto por código al salir del campo
    const codigoInput = row.querySelector(".codigo");
    codigoInput.addEventListener("blur", () => buscarProductoPorCodigo(row));

    // Eliminar fila
    row.querySelector(".delete-btn").addEventListener("click", () => {
        row.remove();
        calcularTotal();
    });

    tabla.appendChild(row);
    codigoInput.focus();
}

// BUSCAR PRODUCTO POR CÓDIGO 
async function buscarProductoPorCodigo(row) {
    const codigo = row.querySelector(".codigo").value.trim();
    if (!codigo) return;

    // TODO: conectar con tu ProductoService
    // try {
    //     const producto = await productoService.getByCodigo(codigo);
    //     row.querySelector(".nombre").value = producto.nombre;
    //     row.querySelector(".precio").value  = producto.precio;
    //     calcularTotal();
    // } catch (e) {
    //     alert("Producto no encontrado");
    // }
}

//  CALCULAR TOTALES 
function calcularTotal() {
    let subtotal = 0;

    document.querySelectorAll("#tablaProductos tr").forEach(row => {
        const cant   = parseFloat(row.querySelector(".cantidad")?.value) || 0;
        const precio = parseFloat(row.querySelector(".precio")?.value)   || 0;
        const linea  = cant * precio;

        const subtotalInput = row.querySelector(".subtotal");
        if (subtotalInput) subtotalInput.value = linea.toFixed(2);

        subtotal += linea;
    });

    const pctDescuento = parseFloat(descuentoInput.value) || 0;
    const montoDescuento = subtotal * (pctDescuento / 100);
    const total = subtotal - montoDescuento;

    subtotalEl.value  = subtotal.toFixed(2);
    descuentoEl.value = montoDescuento.toFixed(2);
    totalEl.value     = total.toFixed(2);
}

// Recalcular al cambiar cantidad o precio en cualquier fila
document.addEventListener("input", (e) => {
    if (e.target.classList.contains("cantidad") ||
        e.target.classList.contains("precio")) {
        calcularTotal();
    }
});

//  MODAL CONFIRMAR GUARDAR 
btnGuardar.addEventListener("click", () => {
    if (!validarVenta()) return;
    modalConfirmar.classList.remove("hidden");
});

btnSi.addEventListener("click", async () => {
    modalConfirmar.classList.add("hidden");

    const filas = [...document.querySelectorAll("#tablaProductos tr")].map(row => ({
        codigo:   row.querySelector(".codigo")?.value,
        nombre:   row.querySelector(".nombre")?.value,
        cantidad: row.querySelector(".cantidad")?.value,
        precio:   row.querySelector(".precio")?.value,
        subtotal: row.querySelector(".subtotal")?.value,
    }));

    const venta = {
        telefono:   telefonoInput.value,
        cliente:    nombreInput.value,
        descuento:  descuentoInput.value,
        fecha:      document.getElementById("fechaVenta")?.value,
        subtotal:   subtotalEl.value,
        descuentoMonto: descuentoEl.value,
        total:      totalEl.value,
        productos:  filas,
    };

    console.log("VENTA A GUARDAR:", venta);

    // TODO: await ventaService.guardar(venta);

    alert("Venta guardada correctamente");
});

btnNo.addEventListener("click", () => {
    modalConfirmar.classList.add("hidden");
});



// CANCELAR / LIMPIAR 
btnCancelar.addEventListener("click", () => {
    if (confirm("¿Deseas cancelar y limpiar el formulario?")) {
        limpiarFormulario();
    }
});

function limpiarFormulario() {
    telefonoInput.value  = "";
    nombreInput.value    = "";
    descuentoInput.value = "";
    tabla.innerHTML      = "";
    subtotalEl.value     = "0.00";
    descuentoEl.value    = "0.00";
    totalEl.value        = "0.00";
}

//  MODAL BUSCAR PRODUCTOS 
cerrarProductos.addEventListener("click", () => {
    modalProductos.classList.add("hidden");
});

buscarProductoInput.addEventListener("input", () => {
    const q = buscarProductoInput.value.toLowerCase();
    // TODO: filtrar tu lista de productos y mostrarla en #listaProductos
    // Ejemplo dummy:
    const listaEl = document.getElementById("listaProductos");
    listaEl.innerHTML = `<p style="color:#999; padding:10px;">
        Conecta tu ProductoService para buscar "${q}"</p>`;
});

// NUEVO CLIENTE
btnNuevoCliente.addEventListener("click", () => {
    document.getElementById("modalNuevoCliente").classList.remove("hidden");
});

document.getElementById("btnCancelarCliente").addEventListener("click", () => {
    document.getElementById("modalNuevoCliente").classList.add("hidden");
});

document.getElementById("btnGuardarCliente").addEventListener("click", async () => {
    const nombre   = document.getElementById("ncNombre").value.trim();
    const apellido = document.getElementById("ncApellido").value.trim();

    if (!nombre || !apellido) {
        alert("Nombre y apellido son obligatorios.");
        return;
    }

    const request = new ClienteRequest(
        nombre,
        apellido,
        parseInt(document.getElementById("ncTelefono").value) || null,
        document.getElementById("ncCedula").value.trim() || null,
        null
    );

    try {
        await clienteService.createCliente(request);
        alert("Cliente creado correctamente");
        document.getElementById("modalNuevoCliente").classList.add("hidden");

        // Autorellenar el teléfono y nombre en el formulario
        const tel = document.getElementById("ncTelefono").value.trim();
        telefonoInput.value = tel;
        nombreInput.value   = `${nombre} ${apellido}`;
        descuentoInput.value = 0;

    } catch (e) {
        alert("Error al crear cliente: " + e.message);
    }
});

// ── VALIDACIÓN BÁSICA ──────────────────────────────────────
function validarVenta() {
    const filas = document.querySelectorAll("#tablaProductos tr");

    if (filas.length === 0) {
        alert("Agrega al menos un producto.");
        return false;
    }

    for (const row of filas) {
        const precio = parseFloat(row.querySelector(".precio")?.value);
        const cant   = parseFloat(row.querySelector(".cantidad")?.value);
        if (!precio || precio <= 0 || !cant || cant <= 0) {
            alert("Verifica que todos los productos tengan precio y cantidad válidos.");
            return false;
        }
    }

    return true;
}