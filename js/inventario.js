import { ProductoService } from './shared/services/producto.service.js';
import { ProductoRequest } from './shared/models/request/producto.request.js';

const productoService = new ProductoService();
let productosCargados = [];
let codigoEditando    = null;

// ── Cargar y renderizar ───────────────────────────────────────
async function cargarProductos() {
    const tbody = document.getElementById('tablaProductos');
    try {
        productosCargados = await productoService.getTodosProductos();

        // Obtener stock de todos en paralelo
        const stockResults = await Promise.allSettled(
            productosCargados.map(p => productoService.getStockActual(p.codigoProducto))
        );
        productosCargados.forEach((p, i) => {
            if (stockResults[i].status === 'fulfilled') {
                p.stock = stockResults[i].value ?? 0;
            }
        });

        actualizarStats(productosCargados);
        renderTabla(productosCargados);
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:red">${e.message}</td></tr>`;
    }
}

function actualizarStats(productos) {
    document.getElementById('statTotal').textContent    = productos.length;
    document.getElementById('statEnStock').textContent  = productos.filter(p => p.tieneStock).length;
    document.getElementById('statSinStock').textContent = productos.filter(p => !p.tieneStock).length;
}

function renderTabla(productos) {
    const tbody = document.getElementById('tablaProductos');
    if (productos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px">No hay productos registrados.</td></tr>`;
        return;
    }
    tbody.innerHTML = productos.map(p => `
        <tr>
            <td>${p.codigoProducto}</td>
            <td>${p.nombre ?? '-'}</td>
            <td>${p.marca ?? '-'}</td>
            <td>${p.stock}</td>
            <td>C$ ${p.precio}</td>
            <td>
                <span class="badge-estado ${p.tieneStock ? 'en-stock' : 'sin-stock'}">
                    ${p.tieneStock ? 'En Stock' : 'Sin Stock'}
                </span>
            </td>
            <td class="acciones">
                <button class="btn-edit"   onclick="abrirEditar(${p.codigoProducto})"><i class="fas fa-pen"></i></button>
                <button class="btn-delete" onclick="eliminarProducto(${p.codigoProducto})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// ── Búsqueda ──────────────────────────────────────────────────
document.getElementById('inputBuscar').addEventListener('input', function () {
    const term = this.value.toLowerCase();
    const filtrados = productosCargados.filter(p =>
        (p.nombre  ?? '').toLowerCase().includes(term) ||
        (p.marca   ?? '').toLowerCase().includes(term) ||
        String(p.codigoProducto).includes(term)
    );
    renderTabla(filtrados);
});

// ── Modal Nuevo ───────────────────────────────────────────────
document.getElementById('btnNuevoProducto').addEventListener('click', () => {
    codigoEditando = null;
    document.getElementById('modalTitulo').textContent = 'Nuevo Producto';
    document.getElementById('productoId').value = '';
    limpiarModal();
    mostrarModal();
});

// ── Modal Editar ──────────────────────────────────────────────
window.abrirEditar = async function (codigo) {
    try {
        const p = await productoService.getProducto(codigo);
        codigoEditando = p.codigoProducto;
        document.getElementById('modalTitulo').textContent  = 'Editar Producto';
        document.getElementById('productoId').value         = p.codigoProducto;
        document.getElementById('inputNombre').value        = p.nombre      ?? '';
        document.getElementById('inputDescripcion').value   = p.descripcion ?? '';
        document.getElementById('inputTalla').value         = p.talla       ?? '';
        document.getElementById('inputMarca').value         = p.marca       ?? '';
        document.getElementById('inputPrecio').value        = p.precio      ?? '';
        document.getElementById('inputStock').value         = p.stock       ?? '';
        document.getElementById('inputEstado').value        = p.estado      ?? 1;
        mostrarModal();
    } catch (e) {
        alert('Error al cargar producto: ' + e.message);
    }
};

// ── Guardar ───────────────────────────────────────────────────
document.getElementById('btnGuardarModal').addEventListener('click', async () => {
    const nombre      = document.getElementById('inputNombre').value.trim();
    const descripcion = document.getElementById('inputDescripcion').value.trim();
    const talla       = parseInt(document.getElementById('inputTalla').value);
    const marca       = document.getElementById('inputMarca').value.trim();
    const precio      = parseInt(document.getElementById('inputPrecio').value);
    const estado      = parseInt(document.getElementById('inputEstado').value);
    const stock      = parseInt(document.getElementById('inputStock').value);
    if (!nombre || isNaN(precio) || isNaN(talla) || talla <= 0) {
        alert('Nombre, Precio y Talla son obligatorios y deben ser números.');
        return;
    }

    const request = new ProductoRequest(codigoEditando, nombre, descripcion, talla, marca, estado, precio, stock);

    try {
        if (codigoEditando) {
            await productoService.updateProducto(codigoEditando, request);
        } else {
            await productoService.createProducto(request);
        }
        ocultarModal();
        await cargarProductos();
    } catch (e) {
        alert('Error: ' + e.message);
    }
});

// ── Eliminar ──────────────────────────────────────────────────
window.eliminarProducto = async function (codigo) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
        await productoService.deleteProducto(codigo);
        await cargarProductos();
    } catch (e) {
        alert('Error al eliminar: ' + e.message);
    }
};

// ── Cancelar modal ────────────────────────────────────────────
document.getElementById('btnCancelarModal').addEventListener('click', ocultarModal);

// ── Helpers ───────────────────────────────────────────────────
function mostrarModal()  { document.getElementById('modalOverlay').style.display = 'flex'; }
function ocultarModal()  { document.getElementById('modalOverlay').style.display = 'none'; }
function limpiarModal()  {
    ['inputNombre','inputDescripcion','inputTalla','inputMarca','inputPrecio','inputStock'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('inputEstado').value = '1';
}

// ── Init ──────────────────────────────────────────────────────
cargarProductos();