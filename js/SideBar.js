function loadSideBar() {
    fetch('../components/SideBar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('sideBarContainer').innerHTML = data;
        })
        .catch(error => console.error('Error al cargar el SideBar:', error));
}

loadSideBar();