function cargarSelects() {
    const vendedorSelect = document.getElementById('vendedor');
    if (!vendedorSelect) return;
    vendedorSelect.innerHTML = '<option value="">Seleccionar vendedor</option>';
    vendedores.forEach(vendedor => {
        vendedorSelect.innerHTML += `<option value="${vendedor.id}">${vendedor.nombre}</option>`;
    });

    document.getElementById('zonaVendedor').innerHTML = '<option value="">Seleccionar zona</option>';
    document.getElementById('cliente').innerHTML = '<option value="">Seleccionar cliente</option>';
}

function actualizarZonasVendedor() {
    const vendedorId = document.getElementById('vendedor').value;
    const zonaSelect = document.getElementById('zonaVendedor');
    const clienteSelect = document.getElementById('cliente');

    zonaSelect.innerHTML = '<option value="">Seleccionar zona</option>';
    clienteSelect.innerHTML = '<option value="">Seleccionar cliente</option>';

    if (!vendedorId) return;

    const vendedor = vendedores.find(v => v.id == vendedorId);
    if (vendedor && vendedor.zona) {
        const zonas = vendedor.zona.split(',').map(z => z.trim()).filter(z => z !== "");
        zonas.forEach(z => {
            zonaSelect.innerHTML += `<option value="${z}">${z}</option>`;
        });
    }
}

function actualizarClientesPorZona() {
    const zonaSeleccionada = document.getElementById('zonaVendedor').value;
    const clienteSelect = document.getElementById('cliente');

    clienteSelect.innerHTML = '<option value="">Seleccionar cliente</option>';

    if (!zonaSeleccionada) return;

    const clientesFiltrados = clientes.filter(c =>
        c.zona && c.zona.trim().toLowerCase() === zonaSeleccionada.trim().toLowerCase()
    );

    clientesFiltrados.forEach(cliente => {
        clienteSelect.innerHTML += `<option value="${cliente.id}">${cliente.nombre}</option>`;
    });
}

function cargarProductosDisponibles() {
    const containerNormales = document.getElementById('productosNormales');
    const containerOfertas = document.getElementById('productosOfertas');
    if (!containerNormales) return;

    containerNormales.innerHTML = productos.normales.map(p => `
        <div class="product-add">
            <span><strong>${p.codigo}</strong> - ${p.nombre} <strong>($${p.precio || '0.00'})</strong></span>
            <div class="input-group">
                <input type="number" id="cantidad-${p.id}-normal" placeholder="Cant" value="" min="0.01" step="0.01">
                <button onclick="agregarProductoAlRemito(${p.id}, 'normal')" style="padding: 4px 8px;">Agregar</button>
            </div>
        </div>
    `).join('');

    containerOfertas.innerHTML = productos.ofertas.map(p => `
        <div class="product-add">
            <span><strong>${p.codigo}</strong> - ${p.nombre} <strong>($${p.precio || '0.00'})</strong></span>
            <div class="input-group">
                <input type="number" id="cantidad-${p.id}-oferta" placeholder="Cant" value="" min="0.01" step="0.01">
                <button onclick="agregarProductoAlRemito(${p.id}, 'oferta')" style="padding: 4px 8px;">Agregar</button>
            </div>
        </div>
    `).join('');
}

function agregarProductoAlRemito(id, tipo) {
    const clave = tipo === 'normal' ? 'normales' : 'ofertas';
    const producto = productos[clave].find(p => p.id === id);
    if (!producto) return;

    const cantidadInput = document.getElementById(`cantidad-${id}-${tipo}`);
    const cantidad = parseFloat(cantidadInput.value) || 0;

    if (cantidad <= 0) {
        alert('La cantidad debe ser mayor a 0.');
        return;
    }

    const existe = remitoActual.productos.find(p => p.id === id && p.tipo === tipo);
    if (existe) {
        existe.cantidad += cantidad;
    } else {
        remitoActual.productos.push({ ...producto, cantidad, kilos: 0, tipo });
    }

    cantidadInput.value = '';
    actualizarPedidoActual();
    actualizarContador();
}

function actualizarPedidoActual() {
    const container = document.getElementById('pedidoActual');
    if (!container) return;
    if (remitoActual.productos.length === 0) {
        container.innerHTML = 'Sin productos seleccionados.';
        return;
    }
    container.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${remitoActual.productos.map((p, index) => `
                    <tr>
                        <td>${p.codigo}</td>
                        <td>${p.nombre}</td>
                        <td>$${p.precio || '0.00'}</td>
                        <td>
                            <input type="number" value="${p.cantidad || 0}"
                                   oninput="actualizarCantidadEnRemito(${index}, this.value)"
                                   style="width: 60px; text-align: center;" min="0">
                        </td>
                        <td><button onclick="eliminarProductoDelRemito(${index})" class="delete" style="padding: 4px 8px;">X</button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function actualizarCantidadEnRemito(index, cantidad) {
    if (remitoActual.productos[index]) {
        remitoActual.productos[index].cantidad = parseFloat(cantidad) || 0;
    }
}

function eliminarProductoDelRemito(index) {
    remitoActual.productos.splice(index, 1);
    actualizarPedidoActual();
    actualizarContador();
}

function actualizarContador() {
    const el = document.getElementById('contador');
    if (!el) return;
    const total = remitoActual.productos.reduce((sum, p) => sum + (p.cantidad || 0), 0);
    el.textContent = total;
}

function guardarRemito() {
    // Auto-agregar remanentes
    [['normales', 'normal'], ['ofertas', 'oferta']].forEach(([clave, tipo]) => {
        (productos[clave] || []).forEach(p => {
            const input = document.getElementById(`cantidad-${p.id}-${tipo}`);
            if (!input) return;
            const raw = input.value.trim();
            const cantidad = parseFloat(raw);
            if (!raw || isNaN(cantidad) || cantidad <= 0) return;
            const existe = remitoActual.productos.find(x => x.id === p.id && x.tipo === tipo);
            if (existe) { existe.cantidad += cantidad; }
            else { remitoActual.productos.push({ ...p, cantidad, kilos: 0, tipo }); }
            input.value = '';
        });
    });

    const clienteId = document.getElementById('cliente').value;
    const vendedorId = document.getElementById('vendedor').value;
    const zonaVendedor = document.getElementById('zonaVendedor').value;
    const fecha = new Date().toISOString().split('T')[0];
    const obs = document.getElementById('obsTextarea').value;
    const numFactura = document.getElementById('numFactura').value;
    const montoTotal = parseFloat(document.getElementById('montoTotal').value) || 0;
    const estadoPago = document.getElementById('estadoPago').value;

    if (!clienteId || !vendedorId || !zonaVendedor) {
        alert('Debe seleccionar vendedor, zona y cliente.');
        return;
    }

    const cliente = clientes.find(c => c.id == clienteId);
    const vendedor = vendedores.find(v => v.id == vendedorId);

    if (remitoActual.productos.length === 0) {
        alert('Debe agregar al menos un producto al remito.');
        return;
    }

    remitoActual.cliente = cliente.nombre;
    remitoActual.vendedor = vendedor.nombre;
    remitoActual.zona = zonaVendedor;
    remitoActual.fecha = fecha;
    remitoActual.obs = obs;
    remitoActual.numFactura = numFactura;
    remitoActual.montoTotal = montoTotal;
    remitoActual.estadoPago = estadoPago;

    if (remitoActual.id === null) {
        remitoActual.id = Date.now();
        remitos.push(JSON.parse(JSON.stringify(remitoActual)));
    } else {
        const index = remitos.findIndex(r => r.id === remitoActual.id);
        if (index !== -1) remitos[index] = JSON.parse(JSON.stringify(remitoActual));
    }

    localStorage.setItem('remitos', JSON.stringify(remitos));
    alert('Remito guardado con éxito.');
    nuevoRemito();
    cargarHistorial();
}

function nuevoRemito() {
    remitoActual = { id: null, cliente: '', vendedor: '', zona: '', fecha: '', productos: [], obs: '', numFactura: '', montoTotal: 0, estadoPago: 'Pendiente' };
    const ids = ['cliente', 'vendedor', 'zonaVendedor', 'obsTextarea', 'numFactura', 'montoTotal'];
    ids.forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ''; });
    if(document.getElementById('estadoPago')) document.getElementById('estadoPago').value = 'Pendiente';
    if(document.getElementById('previewObs')) document.getElementById('previewObs').textContent = '';
    if(document.getElementById('remitoNumero')) document.getElementById('remitoNumero').textContent = 'Nuevo';
    if(document.getElementById('seccionFacturacion')) document.getElementById('seccionFacturacion').style.display = 'none';

    actualizarPedidoActual();
    actualizarContador();
    cargarProductosDisponibles();
    actualizarZonasVendedor();
}

function abrirModalObs() { document.getElementById('obsModal').style.display = 'block'; }
function cerrarModalObs() { document.getElementById('obsModal').style.display = 'none'; }
function guardarObs() {
    const obsValue = document.getElementById('obsTextarea').value;
    remitoActual.obs = obsValue;
    actualizarPreviewObs();
    cerrarModalObs();
}
function actualizarPreviewObs() {
    const preview = document.getElementById('previewObs');
    const content = document.getElementById('obsTextarea').value;
    if (preview) preview.textContent = content.trim() ? content.substring(0, 30) + (content.length > 30 ? "..." : "") : "Sin observaciones";
}
