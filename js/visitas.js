function cargarSelectsVisitas() {
    const vendedorSelect = document.getElementById('vendedorVisita');
    if (!vendedorSelect) return;
    vendedorSelect.innerHTML = '<option value="">Seleccionar vendedor</option>';
    vendedores.forEach(v => {
        vendedorSelect.innerHTML += `<option value="${v.id}">${v.nombre}</option>`;
    });
}

function actualizarZonasVisita() {
    const vendedorId = document.getElementById('vendedorVisita').value;
    const zonaSelect = document.getElementById('zonaVisita');
    const listaVisitas = document.getElementById('listaVisitas');

    zonaSelect.innerHTML = '<option value="">Seleccionar zona</option>';
    listaVisitas.innerHTML = 'Seleccione vendedor y zona para ver clientes.';

    if (!vendedorId) return;
    const vendedor = vendedores.find(v => v.id == vendedorId);
    if (vendedor && vendedor.zona) {
        const zonas = vendedor.zona.split(',').map(z => z.trim()).filter(z => z !== "");
        zonas.forEach(z => {
            zonaSelect.innerHTML += `<option value="${z}">${z}</option>`;
        });
    }
}

function actualizarClientesVisita() {
    const vendedorId = document.getElementById('vendedorVisita').value;
    const zona = document.getElementById('zonaVisita').value;
    const container = document.getElementById('listaVisitas');
    const fechaInicio = document.getElementById('fechaVisitaInicio').value;
    const fechaFin = document.getElementById('fechaVisitaFin').value;

    if (!vendedorId || !zona || !fechaInicio || !fechaFin) {
        container.innerHTML = 'Seleccione fechas, vendedor y zona para ver clientes.';
        return;
    }

    const clientesZona = clientes.filter(c => c.zona && c.zona.trim().toLowerCase() === zona.trim().toLowerCase());
    clientesZona.sort((a, b) => a.nombre.localeCompare(b.nombre));

    if (clientesZona.length === 0) {
        container.innerHTML = 'No hay clientes registrados en esta zona.';
        return;
    }

    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Cliente</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${clientesZona.map(c => {
                    const visitado = clienteVisitadoEnRango(c.id, fechaInicio, fechaFin);
                    return `
                        <tr>
                            <td>${c.nombre}</td>
                            <td>
                                <button onclick="marcarVisita(${c.id})" class="${visitado ? 'success' : 'delete'}" style="padding: 4px 8px;">
                                    ${visitado ? 'Visitado' : 'Sin Visita'}
                                </button>
                            </td>
                            <td>
                                <button onclick="irARemitoDesdeVisita(${vendedorId}, '${zona}', ${c.id})" style="padding: 4px 8px;">Vender</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function clienteVisitadoEnRango(clienteId, inicio, fin) {
    for (let d = new Date(inicio); d <= new Date(fin); d.setDate(d.getDate() + 1)) {
        const fechaStr = d.toISOString().split('T')[0];
        if (visitas[fechaStr] && visitas[fechaStr][clienteId]) {
            return true;
        }
    }
    return false;
}

function marcarVisita(clienteId) {
    const fechaInicio = document.getElementById('fechaVisitaInicio').value;
    const fechaFin = document.getElementById('fechaVisitaFin').value;
    const hoy = new Date().toISOString().split('T')[0];

    if (!fechaInicio || !fechaFin) {
        alert('Seleccione un rango de fechas.');
        return;
    }

    const estaVisitado = clienteVisitadoEnRango(clienteId, fechaInicio, fechaFin);

    if (estaVisitado) {
        for (let d = new Date(fechaInicio); d <= new Date(fechaFin); d.setDate(d.getDate() + 1)) {
            const fechaStr = d.toISOString().split('T')[0];
            if (visitas[fechaStr]) delete visitas[fechaStr][clienteId];
        }
    } else {
        if (!visitas[hoy]) visitas[hoy] = {};
        visitas[hoy][clienteId] = true;
    }

    localStorage.setItem('visitas', JSON.stringify(visitas));
    actualizarClientesVisita();
}

function nuevaHojaRuta() {
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fechaVisitaInicio').value = hoy;
    document.getElementById('fechaVisitaFin').value = hoy;
    actualizarClientesVisita();
}

function irARemitoDesdeVisita(vendedorId, zona, clienteId) {
    document.getElementById('vendedor').value = vendedorId;
    actualizarZonasVendedor();
    document.getElementById('zonaVendedor').value = zona;
    actualizarClientesPorZona();
    document.getElementById('cliente').value = clienteId;
    cambiarPestana('remitos');
}
