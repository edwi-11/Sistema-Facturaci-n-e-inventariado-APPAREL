function initMenuMobile() {
    const toggle  = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sideBar');
    const overlay = document.getElementById('menuOverlay');
    const close   = document.getElementById('menuClose');

    if (!toggle) return;

    function abrirMenu() {
        sidebar.classList.add('open');
        overlay.classList.add('active');
        toggle.style.display = 'none'; 
    }
    function cerrarMenu() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        toggle.style.display = 'flex';
    }

    toggle.addEventListener('click', abrirMenu);
    close.addEventListener('click', cerrarMenu);
    overlay.addEventListener('click', cerrarMenu);

    sidebar.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', cerrarMenu);
    });
}

function loadSideBar() {
    fetch('../components/SideBar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sideBarContainer').innerHTML = data;
            initMenuMobile(); // ahora sí está definida antes de llamarla
        })
        .catch(error => console.error('Error al cargar el SideBar:', error));
}

loadSideBar();