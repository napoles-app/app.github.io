function cargarHistorial() {
    const container = document.getElementById('listaHistorial');
    if (!container) return;
    if (remitos.length === 0) { container.innerHTML = '<p>No hay remitos.</p>'; return; }
    container.innerHTML = remitos.map(r => `
        <div class="history-item">
            <div class="info" onclick="cargarRemito(${r.id})">
                <strong>Remito #${r.id}</strong> - ${r.cliente} (${r.fecha})<br>
                Vendedor: ${r.vendedor} | Total: $${r.montoTotal || 0} | Estado: <span style="color: ${r.estadoPago === 'Pagado' ? 'green' : (r.estadoPago === 'Cta Cte' ? 'orange' : 'red')}">${r.estadoPago || 'Pendiente'}</span>
                ${r.obs ? `<br><small style="color: #666;">Obs: ${r.obs}</small>` : ''}
            </div>
            <div class="history-actions">
                <button onclick="cargarRemito(${r.id})">Editar</button>
                <button onclick="eliminarRemito(${r.id})" class="delete">Borrar</button>
            </div>
        </div>
    `).join('');
}

function filtrarHistorial() {
    const busqueda = document.getElementById('buscarHistorial').value.toLowerCase();
    const desde = document.getElementById('historialFechaDesde').value;
    const hasta = document.getElementById('historialFechaHasta').value;
    const estado = document.getElementById('historialFiltroEstado').value;
    const container = document.getElementById('listaHistorial');

    const remitosFiltrados = remitos.filter(r => {
        const coincideBusqueda = r.cliente.toLowerCase().includes(busqueda) || r.vendedor.toLowerCase().includes(busqueda);
        const coincideDesde = desde ? r.fecha >= desde : true;
        const coincideHasta = hasta ? r.fecha <= hasta : true;
        const coincideEstado = estado ? r.estadoPago === estado : true;
        return coincideBusqueda && coincideDesde && coincideHasta && coincideEstado;
    });

    remitosFiltrados.sort((a, b) => {
        const orden = { 'Pagado': 1, 'Cta Cte': 2, 'Pendiente': 3 };
        return (orden[a.estadoPago] || 4) - (orden[b.estadoPago] || 4);
    });

    if (remitosFiltrados.length === 0) { container.innerHTML = '<p>No se encontraron remitos.</p>'; return; }

    container.innerHTML = remitosFiltrados.map(r => `
        <div class="history-item">
            <div class="info" onclick="cargarRemito(${r.id})">
                <strong>Remito #${r.id}</strong> - ${r.cliente} (${r.fecha})<br>
                Vendedor: ${r.vendedor} | Total: $${r.montoTotal || 0} | Estado: <span style="color: ${r.estadoPago === 'Pagado' ? 'green' : (r.estadoPago === 'Cta Cte' ? 'orange' : 'red')}">${r.estadoPago || 'Pendiente'}</span>
            </div>
            <div class="history-actions">
                <button onclick="cargarRemito(${r.id})">Editar</button>
                <button onclick="eliminarRemito(${r.id})" class="delete">Borrar</button>
            </div>
        </div>
    `).join('');
}

function cargarRemito(id) {
    const remito = remitos.find(r => r.id === id);
    if (!remito) return;
    remitoActual = JSON.parse(JSON.stringify(remito));
    document.getElementById('vendedor').value = vendedores.find(v => v.nombre === remito.vendedor)?.id || '';
    actualizarZonasVendedor();
    document.getElementById('zonaVendedor').value = remito.zona || '';
    actualizarClientesPorZona();
    document.getElementById('cliente').value = clientes.find(c => c.nombre === remito.cliente)?.id || '';
    document.getElementById('obsTextarea').value = remito.obs || '';
    if (typeof actualizarPreviewObs === 'function') actualizarPreviewObs();
    document.getElementById('numFactura').value = remito.numFactura || '';
    document.getElementById('montoTotal').value = remito.montoTotal || '';
    document.getElementById('estadoPago').value = remito.estadoPago || 'Pendiente';
    document.getElementById('remitoNumero').textContent = `Remito #${remito.id}`;
    document.getElementById('seccionFacturacion').style.display = 'grid';
    actualizarPedidoActual();
    actualizarContador();
    cambiarPestana('remitos');
}

function eliminarRemito(id) {
    document.getElementById('confirmTitle').textContent = 'Eliminar Remito';
    document.getElementById('confirmMessage').textContent = '¿Seguro?';
    document.getElementById('confirmModal').style.display = 'block';
    window.accionConfirmada = () => {
        remitos = remitos.filter(r => r.id !== id);
        localStorage.setItem('remitos', JSON.stringify(remitos));
        cargarHistorial();
        cancelarAccion();
    };
}

function cerrarJornada() {
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('filtroResumenFechaDesde').value = hoy;
    document.getElementById('filtroResumenFechaHasta').value = hoy;
    const vendedoresHoy = [...new Set(remitos.map(r => r.vendedor))];
    const zonasHoy = [...new Set(remitos.map(r => r.zona))];
    document.getElementById('filtroResumenVendedor').innerHTML = '<option value="">Todos</option>' + vendedoresHoy.map(v => `<option value="${v}">${v}</option>`).join('');
    document.getElementById('filtroResumenZona').innerHTML = '<option value="">Todas</option>' + zonasHoy.map(z => `<option value="${z}">${z}</option>`).join('');
    actualizarResumenJornada();
    document.getElementById('resumenModal').style.display = 'block';
}

function actualizarResumenJornada() {
    const desde = document.getElementById('filtroResumenFechaDesde').value;
    const hasta = document.getElementById('filtroResumenFechaHasta').value;
    const vF = document.getElementById('filtroResumenVendedor').value;
    const zF = document.getElementById('filtroResumenZona').value;
    let rF = remitos;
    if (desde) rF = rF.filter(r => r.fecha >= desde);
    if (hasta) rF = rF.filter(r => r.fecha <= hasta);
    if (vF) rF = rF.filter(r => r.vendedor === vF);
    if (zF) rF = rF.filter(r => r.zona === zF);
    const resP = {};
    rF.forEach(r => { r.productos.forEach(p => {
        if (!resP[p.codigo]) resP[p.codigo] = { nombre: p.nombre, cantidad: 0, kilos: 0 };
        resP[p.codigo].cantidad += p.cantidad || 0;
        resP[p.codigo].kilos += p.kilos || 0;
    }); });
    const container = document.getElementById('resumenJornada');
    container.innerHTML = `<h3>Remitos filtrados: ${rF.length}</h3>
        <table class="table"><thead><tr><th>Código</th><th>Producto</th><th>Cant.</th><th>Kilos</th></tr></thead><tbody>
        ${Object.entries(resP).map(([c, d]) => `<tr><td>${c}</td><td>${d.nombre}</td><td>${d.cantidad}</td><td>${d.kilos.toFixed(2)}</td></tr>`).join('') || '<tr><td colspan="4">Sin datos</td></tr>'}
        </tbody></table>`;
}

function cerrarResumenModal() { document.getElementById('resumenModal').style.display = 'none'; }
