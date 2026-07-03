// Gestión de Clientes
function abrirModalCliente() {
    document.getElementById('tituloClienteModal').textContent = 'Agregar Cliente';
    document.getElementById('clienteId').value = '';
    document.getElementById('clienteNombre').value = '';
    document.getElementById('clienteZona').value = '';
    document.getElementById('clienteTelefono').value = '';
    document.getElementById('clienteModal').style.display = 'block';
}

function cerrarModalCliente() { document.getElementById('clienteModal').style.display = 'none'; }

function guardarCliente() {
    const id = document.getElementById('clienteId').value;
    const nombre = document.getElementById('clienteNombre').value;
    const zona = document.getElementById('clienteZona').value;
    const telefono = document.getElementById('clienteTelefono').value;
    if (!nombre) { alert('El nombre del cliente es obligatorio.'); return; }
    const cliente = { id: id ? parseInt(id) : Date.now(), nombre, zona, telefono };
    if (id) {
        const index = clientes.findIndex(c => c.id == id);
        if (index !== -1) clientes[index] = cliente;
    } else { clientes.push(cliente); }
    localStorage.setItem('clientes', JSON.stringify(clientes));
    cargarClientes();
    cargarSelects();
    cerrarModalCliente();
    alert('Cliente guardado con éxito.');
}

function cargarClientes() {
    const tbody = document.getElementById('listaClientes');
    if (!tbody) return;
    if (clientes.length === 0) { tbody.innerHTML = '<tr><td colspan="5">No hay clientes registrados.</td></tr>'; return; }
    clientes.sort((a, b) => a.nombre.localeCompare(b.nombre));
    tbody.innerHTML = clientes.map(c => `
        <tr>
            <td>${c.id}</td>
            <td>${c.nombre}</td>
            <td>${c.zona || '-'}</td>
            <td>${c.telefono || '-'}</td>
            <td>
                <button onclick="editarCliente(${c.id})" style="padding: 4px 8px;">Editar</button>
                <button onclick="eliminarCliente(${c.id})" class="delete" style="padding: 4px 8px;">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function editarCliente(id) {
    const cliente = clientes.find(c => c.id == id);
    if (!cliente) return;
    document.getElementById('tituloClienteModal').textContent = 'Editar Cliente';
    document.getElementById('clienteId').value = cliente.id;
    document.getElementById('clienteNombre').value = cliente.nombre;
    document.getElementById('clienteZona').value = cliente.zona || '';
    document.getElementById('clienteTelefono').value = cliente.telefono || '';
    document.getElementById('clienteModal').style.display = 'block';
}

function eliminarCliente(id) {
    document.getElementById('confirmTitle').textContent = 'Eliminar Cliente';
    document.getElementById('confirmMessage').textContent = '¿Estás seguro de que deseas eliminar este cliente?';
    document.getElementById('confirmModal').style.display = 'block';
    window.accionConfirmada = () => {
        clientes = clientes.filter(c => c.id != id);
        localStorage.setItem('clientes', JSON.stringify(clientes));
        cargarClientes();
        cargarSelects();
        alert('Cliente eliminado con éxito.');
        cancelarAccion();
    };
}

function filtrarClientes() {
    const busqueda = document.getElementById('buscarCliente').value.toLowerCase();
    document.querySelectorAll('#listaClientes tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(busqueda) ? '' : 'none';
    });
}

function importarCSVClientes(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const lines = e.target.result.split('\n');
        let count = 0;
        lines.forEach(line => {
            const data = line.split(',').map(item => item.trim());
            if (data[0] && data[0].toLowerCase() !== "nombre") {
                clientes.push({ id: Date.now() + count, nombre: data[0], zona: data[1] || '', telefono: data[2] || '' });
                count++;
            }
        });
        if (count > 0) {
            localStorage.setItem('clientes', JSON.stringify(clientes));
            cargarClientes();
            cargarSelects();
            alert(`Se importaron ${count} clientes.`);
        }
        input.value = '';
    };
    reader.readAsText(file);
}

// Gestión de Vendedores
function abrirModalVendedor() {
    document.getElementById('tituloVendedorModal').textContent = 'Agregar Vendedor';
    document.getElementById('vendedorId').value = '';
    document.getElementById('vendedorNombre').value = '';
    document.getElementById('vendedorZona').value = '';
    document.getElementById('vendedorTelefono').value = '';
    document.getElementById('vendedorModal').style.display = 'block';
}

function cerrarModalVendedor() { document.getElementById('vendedorModal').style.display = 'none'; }

function guardarVendedor() {
    const id = document.getElementById('vendedorId').value;
    const nombre = document.getElementById('vendedorNombre').value;
    const zona = document.getElementById('vendedorZona').value;
    const telefono = document.getElementById('vendedorTelefono').value;
    if (!nombre) { alert('El nombre es obligatorio.'); return; }
    const vendedor = { id: id ? parseInt(id) : Date.now(), nombre, zona, telefono };
    if (id) {
        const index = vendedores.findIndex(v => v.id == id);
        if (index !== -1) vendedores[index] = vendedor;
    } else { vendedores.push(vendedor); }
    localStorage.setItem('vendedores', JSON.stringify(vendedores));
    cargarVendedores();
    cargarSelects();
    cerrarModalVendedor();
}

function cargarVendedores() {
    const tbody = document.getElementById('listaVendedores');
    if (!tbody) return;
    if (vendedores.length === 0) { tbody.innerHTML = '<tr><td colspan="5">No hay vendedores registrados.</td></tr>'; return; }
    tbody.innerHTML = vendedores.map(v => `
        <tr>
            <td>${v.id}</td>
            <td>${v.nombre}</td>
            <td>${v.zona || '-'}</td>
            <td>${v.telefono || '-'}</td>
            <td>
                <button onclick="editarVendedor(${v.id})" style="padding: 4px 8px;">Editar</button>
                <button onclick="eliminarVendedor(${v.id})" class="delete" style="padding: 4px 8px;">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function editarVendedor(id) {
    const v = vendedores.find(v => v.id == id);
    if (!v) return;
    document.getElementById('tituloVendedorModal').textContent = 'Editar Vendedor';
    document.getElementById('vendedorId').value = v.id;
    document.getElementById('vendedorNombre').value = v.nombre;
    document.getElementById('vendedorZona').value = v.zona || '';
    document.getElementById('vendedorTelefono').value = v.telefono || '';
    document.getElementById('vendedorModal').style.display = 'block';
}

function eliminarVendedor(id) {
    document.getElementById('confirmTitle').textContent = 'Eliminar Vendedor';
    document.getElementById('confirmMessage').textContent = '¿Seguro?';
    document.getElementById('confirmModal').style.display = 'block';
    window.accionConfirmada = () => {
        vendedores = vendedores.filter(v => v.id != id);
        localStorage.setItem('vendedores', JSON.stringify(vendedores));
        cargarVendedores();
        cargarSelects();
        cancelarAccion();
    };
}

function filtrarVendedores() {
    const busqueda = document.getElementById('buscarVendedor').value.toLowerCase();
    document.querySelectorAll('#listaVendedores tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(busqueda) ? '' : 'none';
    });
}

// Gestión de Productos
function cargarProductosGestion() {
    const cNormales = document.getElementById('listaProductosNormalesContainer');
    const cOfertas = document.getElementById('listaProductosOfertasContainer');
    if (!cNormales) return;

    const renderTable = (tipo, data) => `
        <table class="table">
            <thead><tr><th>Código</th><th>Nombre</th><th>Precio</th><th>Acciones</th></tr></thead>
            <tbody>
                ${data.map(p => `
                    <tr><td>${p.codigo}</td><td>${p.nombre}</td><td>$${p.precio || '0.00'}</td>
                    <td>
                        <button onclick="editarProducto(${p.id}, '${tipo}')">Editar</button>
                        <button onclick="eliminarProducto(${p.id}, '${tipo}')" class="delete">Eliminar</button>
                    </td></tr>`).join('')}
            </tbody>
        </table>`;
    cNormales.innerHTML = renderTable('normales', productos.normales);
    cOfertas.innerHTML = renderTable('ofertas', productos.ofertas);
}

function abrirModalProducto(tipo = 'normales') {
    document.getElementById('tituloProductoModal').textContent = tipo === 'normales' ? 'Agregar Producto' : 'Agregar Oferta';
    document.getElementById('productoId').value = '';
    document.getElementById('productoCodigo').value = '';
    document.getElementById('productoNombre').value = '';
    document.getElementById('productoPrecio').value = '';
    document.getElementById('productoTipo').value = tipo;
    document.getElementById('productoModal').style.display = 'block';
}

function cerrarModalProducto() { document.getElementById('productoModal').style.display = 'none'; }

function guardarProducto() {
    const id = document.getElementById('productoId').value;
    const codigo = document.getElementById('productoCodigo').value;
    const nombre = document.getElementById('productoNombre').value;
    const precio = parseFloat(document.getElementById('productoPrecio').value) || 0;
    const tipo = document.getElementById('productoTipo').value;
    if (!codigo || !nombre) return;
    const producto = { id: id ? parseInt(id) : Date.now(), codigo, nombre, precio, tipo };
    if (id) {
        const index = productos[tipo].findIndex(p => p.id == id);
        if (index !== -1) productos[tipo][index] = producto;
    } else { productos[tipo].push(producto); }
    localStorage.setItem('productos', JSON.stringify(productos));
    cargarProductosDisponibles();
    cargarProductosGestion();
    cerrarModalProducto();
}

function editarProducto(id, tipo) {
    const p = productos[tipo].find(p => p.id == id);
    if (!p) return;
    document.getElementById('tituloProductoModal').textContent = tipo === 'normales' ? 'Editar' : 'Editar Oferta';
    document.getElementById('productoId').value = p.id;
    document.getElementById('productoCodigo').value = p.codigo;
    document.getElementById('productoNombre').value = p.nombre;
    document.getElementById('productoPrecio').value = p.precio || 0;
    document.getElementById('productoTipo').value = tipo;
    document.getElementById('productoModal').style.display = 'block';
}

function eliminarProducto(id, tipo) {
    document.getElementById('confirmTitle').textContent = 'Eliminar';
    document.getElementById('confirmMessage').textContent = '¿Seguro?';
    document.getElementById('confirmModal').style.display = 'block';
    window.accionConfirmada = () => {
        productos[tipo] = productos[tipo].filter(p => p.id != id);
        localStorage.setItem('productos', JSON.stringify(productos));
        cargarProductosDisponibles();
        cargarProductosGestion();
        cancelarAccion();
    };
}

function filtrarProductosGestion(tipo) {
    const busqueda = document.getElementById(`buscarProducto${tipo === 'normales' ? 'Normal' : 'Oferta'}`).value.toLowerCase();
    document.querySelectorAll(`#listaProductos${tipo === 'normales' ? 'Normales' : 'Ofertas'} tr`).forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(busqueda) ? '' : 'none';
    });
}

function confirmarAccion() { if (window.accionConfirmada) { window.accionConfirmada(); window.accionConfirmada = null; } document.getElementById('confirmModal').style.display = 'none'; }
function cancelarAccion() { window.accionConfirmada = null; document.getElementById('confirmModal').style.display = 'none'; }
