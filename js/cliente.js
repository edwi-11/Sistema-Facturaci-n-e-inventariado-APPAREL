import { ClienteService } from './shared/services/cliente.service.js';
import { ClienteRequest } from './shared/models/request/cliente.request.js';

const service = new ClienteService();

// Referencias DOM
const tablaBody         = document.getElementById('tablaClientes');
const totalClientes     = document.getElementById('totalClientes');
const inputBuscar       = document.getElementById('inputBuscar');
const modalOverlay      = document.getElementById('modalOverlay');
const modalTitulo       = document.getElementById('modalTitulo');
const btnNuevo          = document.getElementById('btnNuevoCliente');
const btnCancelar       = document.getElementById('btnCancelar');
const btnGuardar        = document.getElementById('btnGuardar');
const inputId           = document.getElementById('clienteId');
const inputNombre       = document.getElementById('inputNombre');
const inputApellido     = document.getElementById('inputApellido');
const inputTelefono     = document.getElementById('inputTelefono');
const inputCedula       = document.getElementById('inputCedula');
const inputNumeroCompra = document.getElementById('inputNumeroCompra');

let todosLosClientes = [];

// Cargar tabla
async function cargarClientes() {
    try {
        todosLosClientes = await service.getClientes();
        totalClientes.textContent = todosLosClientes.length;
        renderTabla(todosLosClientes);
    } catch (e) {
        tablaBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:red">Error al cargar clientes</td></tr>`;
        console.error('Error al cargar clientes:', e);
    }
}

function renderTabla(clientes) {
    if (clientes.length === 0) {
        tablaBody.innerHTML = `<tr><td colspan="4" style="text-align:center">No hay clientes</td></tr>`;
        return;
    }
    tablaBody.innerHTML = clientes.map(c => `
        <tr>
            <td>${c.nombreCompleto}</td>
            <td>${c.numeroTelefono ?? '-'}</td>
            <td>${c.cedula ?? '-'}</td>
            <td>${c.numeroCompra ?? 0}</td>
            <td class="action-cells">
                <button class="btn-icon btn-edit" onclick="editarCliente(${c.codCliente})">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="eliminarCliente(${c.codCliente})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Buscar
inputBuscar.addEventListener('input', () => {
    const q = inputBuscar.value.toLowerCase();
    const filtrados = todosLosClientes.filter(c =>
        c.nombreCompleto.toLowerCase().includes(q) ||
        (c.cedula ?? '').toLowerCase().includes(q)
    );
    renderTabla(filtrados);
});

// Modal
function abrirModal(titulo) {
    modalTitulo.textContent = titulo;
    modalOverlay.classList.add('active');
}

function cerrarModal() {
    modalOverlay.classList.remove('active');
    inputId.value           = '';
    inputNombre.value       = '';
    inputApellido.value     = '';
    inputTelefono.value     = '';
    inputCedula.value       = '';
    inputNumeroCompra.value = '';
}

// Cerrar modal al hacer click fuera
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) cerrarModal();
});

btnNuevo.addEventListener('click', () => abrirModal('Nuevo Cliente'));
btnCancelar.addEventListener('click', cerrarModal);

// Guardar (Crear o Actualizar)
btnGuardar.addEventListener('click', async () => {
    if (!inputNombre.value.trim() || !inputApellido.value.trim()) {
        alert('El nombre y apellido son obligatorios.');
        return;
    }

    const request = new ClienteRequest(
        inputNombre.value.trim(),
        inputApellido.value.trim(),
        inputTelefono.value ? parseInt(inputTelefono.value) : null,
        inputCedula.value.trim() || null,
        inputNumeroCompra.value ? parseInt(inputNumeroCompra.value) : null
    );

    try {
        const id = inputId.value;
        if (id) {
            await service.updateCliente(parseInt(id), request);
        } else {
            await service.createCliente(request);
        }
        cerrarModal();
        await cargarClientes();
    } catch (e) {
        alert('Error al guardar: ' + e.message);
        console.error('Error al guardar cliente:', e);
    }
});

// Editar
window.editarCliente = (id) => {
    const c = todosLosClientes.find(c => c.codCliente === id);
    if (!c) { alert("Cliente no encontrado"); return; }

    inputId.value           = c.codCliente;
    inputNombre.value       = c.nombre ?? '';
    inputApellido.value     = c.apellido ?? '';
    inputTelefono.value     = c.numeroTelefono ?? '';
    inputCedula.value       = c.cedula ?? '';
    inputNumeroCompra.value = c.numeroCompra ?? '';
    abrirModal('Editar Cliente');
};

// Eliminar
window.eliminarCliente = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    try {
        await service.deleteCliente(id);
        await cargarClientes();
    } catch (e) {
        alert('Error al eliminar: ' + e.message);
        console.error('Error al eliminar cliente:', e);
    }
};

// Init
cargarClientes();