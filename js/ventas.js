import { ClienteService } from './shared/services/cliente.service.js';
import { ClienteRequest } from './shared/models/request/cliente.request.js';
import HttpService from './shared/services/http.service.js';

const clienteService = new ClienteService();
const http = new HttpService();

let clienteActual = null;

const telefonoInput      = document.getElementById("telefonoCliente");
const nombreInput        = document.getElementById("nombreCliente");
const descuentoInput     = document.getElementById("descuentoCliente");
const tabla              = document.getElementById("tablaProductos");
const btnAgregarProducto = document.getElementById("btnAgregarProducto");
const subtotalEl         = document.getElementById("subtotalVenta");
const descuentoEl        = document.getElementById("descuentoVenta");
const totalEl            = document.getElementById("totalVenta");
const modalConfirmar     = document.getElementById("modalConfirmar");
const modalProductos     = document.getElementById("modalProductos");
const buscarProductoInput = document.getElementById("buscarProducto");
const btnGuardar         = document.getElementById("btnGuardarVenta");
const btnImprimir        = document.getElementById("btnImprimir");
const btnCancelar        = document.getElementById("btnCancelar");
const btnSi              = document.getElementById("btnSi");
const btnNo              = document.getElementById("btnNo");
const btnNuevoCliente    = document.getElementById("btnNuevoCliente");
const cerrarProductos    = document.getElementById("cerrarProductos");

const fechaInput = document.getElementById("fechaVenta");
if (fechaInput) {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm   = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd   = String(hoy.getDate()).padStart(2, "0");
    fechaInput.value = `${yyyy}-${mm}-${dd}`;
}

// CLIENTE
telefonoInput.addEventListener("blur", async () => {
    const telefono = telefonoInput.value.trim();
    if (!telefono) return;

    try {
        const cliente = await clienteService.getByTelefono(telefono);
        clienteActual        = cliente;
        nombreInput.value    = `${cliente.nombre} ${cliente.apellido}`;
        descuentoInput.value = cliente.descuento ?? 0;
        calcularTotal();
    } catch (e) {
        clienteActual        = null;
        nombreInput.value    = "";
        descuentoInput.value = "";
        alert("Cliente no encontrado. Puedes registrarlo como nuevo.");
    }
});

// PRODUCTOS
btnAgregarProducto.addEventListener("click", () => agregarFilaProducto());

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

    const codigoInput = row.querySelector(".codigo");
    codigoInput.addEventListener("blur", () => buscarProductoPorCodigo(row));
    row.querySelector(".delete-btn").addEventListener("click", () => {
        row.remove();
        calcularTotal();
    });

    tabla.appendChild(row);
    codigoInput.focus();
}

async function buscarProductoPorCodigo(row) {
    const codigo = row.querySelector(".codigo").value.trim();
    if (!codigo || codigo <= 0) return;

    try {
        const productos = await http.get(`/Productos/ObtenerProductos/${codigo}`);
        const producto  = productos[0];
        row.querySelector(".nombre").value = producto.nombre;
        row.querySelector(".precio").value = producto.precio;
        calcularTotal();
    } catch (e) {
        alert("Producto no encontrado");
        row.querySelector(".nombre").value = "";
        row.querySelector(".precio").value = "";
    }
}

// TOTALES
function calcularTotal() {
    let subtotal = 0;

    document.querySelectorAll("#tablaProductos tr").forEach(row => {
        const cant  = parseFloat(row.querySelector(".cantidad")?.value) || 0;
        const precio = parseFloat(row.querySelector(".precio")?.value)  || 0;
        const linea = cant * precio;
        const subtotalInput = row.querySelector(".subtotal");
        if (subtotalInput) subtotalInput.value = linea.toFixed(2);
        subtotal += linea;
    });

    const pct            = parseFloat(descuentoInput.value) || 0;
    const montoDescuento = subtotal * (pct / 100);
    const total          = subtotal - montoDescuento;

    subtotalEl.value  = subtotal.toFixed(2);
    descuentoEl.value = montoDescuento.toFixed(2);
    totalEl.value     = total.toFixed(2);
}

document.addEventListener("input", (e) => {
    if (e.target.classList.contains("cantidad") || e.target.classList.contains("precio")) {
        calcularTotal();
    }
});

// GUARDAR VENTA
btnGuardar.addEventListener("click", () => {
    if (!validarVenta()) return;
    modalConfirmar.classList.remove("hidden");
});

btnSi.addEventListener("click", async () => {
    modalConfirmar.classList.add("hidden");

    if (!clienteActual) {
        alert("No hay cliente seleccionado.");
        return;
    }

   function getCodUsuarioDelToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("TOKEN PAYLOAD:", payload); 
    return payload.codUsuario ?? payload.id ?? payload.sub ?? null;
}

const codUsuario = parseInt(getCodUsuarioDelToken());

    const detalles = [...document.querySelectorAll("#tablaProductos tr")].map(row => ({
        codigoProducto: parseInt(row.querySelector(".codigo")?.value),
        cantidad:       parseInt(row.querySelector(".cantidad")?.value),
        precioUnitario: parseFloat(row.querySelector(".precio")?.value),
        descuento:      parseFloat(descuentoInput.value) || 0
    }));

    const venta = {
        codCliente: clienteActual.codCliente,
        codUsuario: codUsuario,
        detalles:   detalles
    };

    try {
        console.log("VENTA:", JSON.stringify(venta));
        const res = await http.post("/Ventas/RegistrarVenta", venta);
        alert(`Venta registrada correctamente`);
        limpiarFormulario();
        clienteActual = null;
    } catch (e) {
        alert("Error al registrar venta: " + e.message);
    }
});

btnNo.addEventListener("click", () => modalConfirmar.classList.add("hidden"));

// IMPRIMIR
btnImprimir.addEventListener("click", () => window.print());

// CANCELAR
btnCancelar.addEventListener("click", () => {
    if (confirm("¿Deseas cancelar y limpiar el formulario?")) limpiarFormulario();
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

// MODAL PRODUCTOS
cerrarProductos.addEventListener("click", () => modalProductos.classList.add("hidden"));

buscarProductoInput.addEventListener("input", () => {
    const q = buscarProductoInput.value.toLowerCase();
    document.getElementById("listaProductos").innerHTML =
        `<p style="color:#999; padding:10px;">Buscar "${q}"</p>`;
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

        telefonoInput.value  = document.getElementById("ncTelefono").value.trim();
        nombreInput.value    = `${nombre} ${apellido}`;
        descuentoInput.value = 0;
    } catch (e) {
        alert("Error al crear cliente: " + e.message);
    }
});

// VALIDACIÓN
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