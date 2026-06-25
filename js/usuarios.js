const baseUrl = "https://localhost:7006/api";
let usuariosList = [];
let paginaActual = 1;
const porPagina = 4;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('modalOverlay').classList.add('hidden');
    cargarUsuarios();
    document.getElementById('btnNuevoUsuario').addEventListener('click', () => abrirModal());
    document.getElementById('inputBuscar').addEventListener('input', (e) => filtrarUsuarios(e.target.value));
    document.getElementById('btnCancelarModal').addEventListener('click', cerrarModal);
    document.getElementById('btnGuardarModal').addEventListener('click', guardarUsuario);
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target === document.getElementById('modalOverlay')) cerrarModal();
    });
});

async function cargarUsuarios() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${baseUrl}/Usuarios/ObtenerUsuarios`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        usuariosList = Array.isArray(data) ? data : (data.usuarios ?? data.data ?? []);
        renderTabla(usuariosList);
        actualizarStats();
    } catch (error) {
        console.error('Error cargarUsuarios:', error);
        document.getElementById('tablaUsuarios').innerHTML =
            `<tr><td colspan="4" class="tabla-error">Error al cargar usuarios</td></tr>`;
    }
}

function renderTabla(lista) {
    const tbody = document.getElementById('tablaUsuarios');
    const inicio = (paginaActual - 1) * porPagina;
    const pagina = lista.slice(inicio, inicio + porPagina);

    if (pagina.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="tabla-vacia">Sin resultados</td></tr>`;
        renderPaginacion(lista.length);
        return;
    }

    tbody.innerHTML = pagina.map(u => `
        <tr>
            <td>${(u.nombre ?? '') + ' ' + (u.apellidos ?? '')}</td>
            <td>${u.cedula ?? ''}</td>
            <td>${u.usuarioLogin ?? ''}</td>
            <td class="action-cells">
                <button class="btn-icon btn-edit" onclick="editarUsuario(${u.codUsuario})">
                    <i class="fa-solid fa-pencil"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="eliminarUsuario(${u.codUsuario})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    renderPaginacion(lista.length);
}

function renderPaginacion(total) {
    const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
    const footer = document.getElementById('paginacion');
    let html = `<button class="page-arrow" onclick="cambiarPagina(${paginaActual - 1})" ${paginaActual === 1 ? 'disabled' : ''}>«</button>`;
    for (let i = 1; i <= totalPaginas; i++) {
        html += `<button class="page-number ${i === paginaActual ? 'active' : ''}" onclick="cambiarPagina(${i})">${i}</button>`;
    }
    html += `<button class="page-arrow" onclick="cambiarPagina(${paginaActual + 1})" ${paginaActual === totalPaginas ? 'disabled' : ''}>»</button>`;
    footer.innerHTML = html;
}

function cambiarPagina(n) {
    const total = Math.ceil(usuariosList.length / porPagina);
    if (n < 1 || n > total) return;
    paginaActual = n;
    renderTabla(usuariosList);
}

function filtrarUsuarios(texto) {
    paginaActual = 1;
    const filtrado = usuariosList.filter(u =>
        (u.nombre ?? '').toLowerCase().includes(texto.toLowerCase()) ||
        (u.apellidos ?? '').toLowerCase().includes(texto.toLowerCase()) ||
        (u.usuarioLogin ?? '').toLowerCase().includes(texto.toLowerCase())
    );
    renderTabla(filtrado);
}

function actualizarStats() {
    document.getElementById('statTotal').textContent = usuariosList.length;
    const admins = usuariosList.filter(u => u.codRol === 1).length;
    document.getElementById('statAdmins').textContent = admins;
}

function abrirModal(usuario = null) {
    const esEdicion = usuario !== null;
    document.getElementById('modalTitulo').textContent     = esEdicion ? 'Editar Usuario' : 'Nuevo Usuario';
    document.getElementById('btnGuardarModal').textContent = esEdicion ? 'Guardar' : 'Agregar';
    document.getElementById('u-cod').value       = usuario?.codUsuario ?? '';
    document.getElementById('u-nombre').value    = usuario?.nombre ?? '';
    document.getElementById('u-apellidos').value = usuario?.apellidos ?? '';
    document.getElementById('u-cedula').value    = usuario?.cedula ?? '';
    document.getElementById('u-login').value     = usuario?.usuarioLogin ?? '';
    document.getElementById('u-codrol').value    = usuario?.codRol ?? 2;
    document.getElementById('u-password').style.display = esEdicion ? 'none' : 'block';
    document.getElementById('modalOverlay').classList.add('active');
}

function cerrarModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}
async function guardarUsuario() {
    const token     = localStorage.getItem('token');
    const cod       = document.getElementById('u-cod').value;
    const esEdicion = cod !== '';

    const body = {
        codUsuario:   esEdicion ? parseInt(cod) : 0,
        nombre:       document.getElementById('u-nombre').value.trim(),
        apellidos:    document.getElementById('u-apellidos').value.trim(),
        cedula:       document.getElementById('u-cedula').value.trim(),
        usuarioLogin: document.getElementById('u-login').value.trim(),
        contraseña:   esEdicion ? '' : (document.getElementById('u-password')?.value.trim() ?? ''),
        codRol:       parseInt(document.getElementById('u-codrol').value) || 2,
        estado:       1,
    };

    if (!body.nombre || !body.apellidos || !body.cedula || !body.usuarioLogin)
        return mostrarToast('Completá todos los campos', 'error');

    if (!esEdicion && !body.contraseña)
        return mostrarToast('La contraseña es requerida', 'error');

    const url    = esEdicion
        ? `${baseUrl}/Usuarios/ActualizarUsuario/${cod}`
        : `${baseUrl}/Usuarios/AgregarUsuario`;
    const method = esEdicion ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        cerrarModal();
        mostrarToast(esEdicion ? 'Usuario actualizado' : 'Usuario agregado');
        await cargarUsuarios();
    } catch (error) {
        console.error(error);
        mostrarToast('Error al guardar usuario', 'error');
    }
}

async function editarUsuario(cod) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${baseUrl}/Usuarios/VerUsuario/${cod}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data = await response.json();
        abrirModal(Array.isArray(data) ? data[0] : (data.data ?? data));
    } catch (error) {
        console.error(error);
        mostrarToast('Error al obtener usuario', 'error');
    }
}

async function eliminarUsuario(cod) {
    if (!confirm('¿Seguro que querés dar de baja este usuario?')) return;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${baseUrl}/Usuarios/DarBajaUsuario/${cod}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        mostrarToast('Usuario eliminado');
        await cargarUsuarios();
    } catch (error) {
        console.error(error);
        mostrarToast('Error al eliminar usuario', 'error');
    }
}

function mostrarToast(mensaje, tipo = 'success') {
    const t = document.createElement('div');
    t.textContent = mensaje;
    t.className = `toast toast-${tipo}`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}