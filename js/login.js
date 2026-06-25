const baseUrl = "https://apparelpos-cac6btffezf5g2cy.canadacentral-01.azurewebsites.net";

// función para decodificar JWT
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

    const endpoint = `${baseUrl}/api/login/IniciarSesion`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(login)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Login successful:', data);

            // guardar token
            localStorage.setItem('token', data.token);

            // decodificar token
            const decoded = parseJwt(data.token);
            console.log("TOKEN DECODED:", decoded);

            // sacar rol 
            const rol = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

            console.log("ROL:", rol);

            // guardar rol para usarlo en el menú
            localStorage.setItem("rol", rol);

            // redirigir al dashboard
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