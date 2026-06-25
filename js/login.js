const baseUrl = "https://apparelpos-cac6btffezf5g2cy.canadacentral-01.azurewebsites.net/api"; 

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
}

async function handleLoginSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const login = Object.fromEntries(formData.entries());

    console.log('Login data:', login);

    const endpoint = `${baseUrl}/Login/IniciarSesion`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(login)
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            const decoded = parseJwt(data.token);
            const rol = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            localStorage.setItem("rol", rol);
            window.location.href = "../pages/Dashboard.html";
        } else {
            alert('Login failed: ' + (data.message || 'Credenciales incorrectas'));
        }

    } catch (error) {
        console.error('Error de conexión:', error);
        alert('No se pudo conectar con el servidor.');
    }
}

document.getElementById('loginForm').addEventListener('submit', handleLoginSubmit);