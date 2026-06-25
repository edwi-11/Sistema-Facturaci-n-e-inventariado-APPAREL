document.addEventListener("DOMContentLoaded", () => {
    const rol = localStorage.getItem("rol");

    const usuariosLi = document.getElementById("usuariosLi");

    if (rol !== "Admin") {
        usuariosLi.style.display = "none";
    }
});