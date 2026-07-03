async function generarPDF() {
    const hoy = new Date().toISOString().split('T')[0];
    const desde = document.getElementById('filtroResumenFechaDesde').value;
    const hasta = document.getElementById('filtroResumenFechaHasta').value;
    const vF = document.getElementById('filtroResumenVendedor').value;
    const zF = document.getElementById('filtroResumenZona').value;

    let rF = remitos;
    if (desde) rF = rF.filter(r => r.fecha >= desde);
    if (hasta) rF = rF.filter(r => r.fecha <= hasta);
    if (vF) rF = rF.filter(r => r.vendedor === vF);
    if (zF) rF = rF.filter(r => r.zona === zF);

    if (rF.length === 0) { alert('Sin remitos'); return; }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const resP = {};
    rF.forEach(r => r.productos.forEach(p => {
        if (!resP[p.codigo]) resP[p.codigo] = { nombre: p.nombre, cantidad: 0, kilos: 0 };
        resP[p.codigo].cantidad += p.cantidad || 0;
        resP[p.codigo].kilos += p.kilos || 0;
    }));

    let y = 20; let remPag = 0; let pagAct = 1;
    rF.forEach((rem, idx) => {
        if (remPag === 0) {
            if (idx > 0) { doc.addPage(); y = 20; pagAct++; }
            doc.setFontSize(16); doc.text(`NÁPOLES CONGELADOS - Pág. ${pagAct}`, 105, 10, { align: 'center' });
        }
        doc.setFontSize(12); doc.text(`Factura: ${rem.numFactura || '________________'}`, 20, y); y += 6;
        doc.setFontSize(10); doc.text(`Fecha: ${rem.fecha}    Vendedor: ${rem.vendedor}`, 20, y); y += 6;
        doc.text(`Cliente: ${rem.cliente}    Zona: ${rem.zona}`, 20, y); y += 4;
        const headers = [['Código', 'Producto', 'Precio', 'Cantidad', 'Kilos']];
        const data = rem.productos.map(p => [p.codigo, p.nombre, `$${p.precio||'0'}`, p.cantidad||0, p.kilos?p.kilos.toFixed(2):'']);
        doc.autoTable({ head: headers, body: data, startY: y, margin: { left: 20 }, styles: { fontSize: 8 }, headStyles: { fillColor: [40, 50, 80] } });
        y = doc.lastAutoTable.finalY + 6;
        doc.text(`Observaciones: ${rem.obs || '________________________________'}`, 20, y); y += 6;
        doc.text(`Monto Total: $ ${rem.montoTotal > 0 ? rem.montoTotal.toFixed(2) : '________________'}`, 20, y); y += 4;
        if (remPag < 2 && idx < rF.length - 1) { doc.setLineDash([1, 1], 0); doc.line(20, y, 190, y); doc.setLineDash([], 0); y += 8; }
        else { y += 6; }
        remPag++; if (remPag === 3 || idx === rF.length - 1) remPag = 0;
    });

    doc.addPage();
    doc.setFontSize(16); doc.text('RESUMEN VENTAS POR PRODUCTO', 105, 10, { align: 'center' });
    doc.setFontSize(10); doc.text(`Periodo: ${desde||'ini'} al ${hasta||'hoy'} ${vF?'Vend: '+vF:''} ${zF?'Zona: '+zF:''}`, 20, 20);
    const resHeaders = [['Código', 'Producto', 'Cant. Total', 'Kilos Totales']];
    const resData = Object.entries(resP).map(([c, d]) => [c, d.nombre, d.cantidad, d.kilos.toFixed(2)]);
    doc.autoTable({ head: resHeaders, body: resData, startY: 30, margin: { left: 20 }, styles: { fontSize: 8 }, headStyles: { fillColor: [40, 50, 80] } });

    const dateStr = (desde === hasta && desde) ? desde : (desde || hasta || hoy);
    const fileName = `Ventas_Napoles_${dateStr}.pdf`;
    if (window.Android && window.Android.savePdf) { window.Android.savePdf(doc.output('datauristring').split(',')[1], fileName); }
    else { doc.save(fileName); }
    cerrarResumenModal();
}

async function generarPDFResumenProductos() {
    const hoy = new Date().toISOString().split('T')[0];
    const desde = document.getElementById('filtroResumenFechaDesde').value;
    const hasta = document.getElementById('filtroResumenFechaHasta').value;
    const vF = document.getElementById('filtroResumenVendedor').value;
    const zF = document.getElementById('filtroResumenZona').value;
    let rF = remitos;
    if (desde) rF = rF.filter(r => r.fecha >= desde);
    if (hasta) rF = rF.filter(r => r.fecha <= hasta);
    if (vF) rF = rF.filter(r => r.vendedor === vF);
    if (zF) rF = rF.filter(r => r.zona === zF);
    if (rF.length === 0) return;
    const resP = {};
    rF.forEach(r => r.productos.forEach(p => {
        if (!resP[p.codigo]) resP[p.codigo] = { nombre: p.nombre, cantidad: 0 };
        resP[p.codigo].cantidad += p.cantidad || 0;
    }));
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    doc.setFontSize(16); doc.text('NÁPOLES CONGELADOS', 105, 15, { align: 'center' });
    doc.setFontSize(13); doc.text('Resumen por Producto', 105, 23, { align: 'center' });
    doc.setFontSize(10); doc.text(`Periodo: ${desde||'ini'} al ${hasta||'hoy'} ${vF?'Vend: '+vF:''} ${zF?'Zona: '+zF:''}`, 105, 31, { align: 'center' });
    const headers = [['Código', 'Producto', 'Cant. Total']];
    const data = Object.entries(resP).map(([c, d]) => [c, d.nombre, d.cantidad]);
    doc.autoTable({ head: headers, body: data, startY: 40, margin: { left: 20 }, styles: { fontSize: 10 }, headStyles: { fillColor: [31, 78, 121] } });
    const dateStr = (desde === hasta && desde) ? desde : (desde || hasta || hoy);
    const fileName = `Resumen_Productos_${dateStr}.pdf`;
    if (window.Android && window.Android.savePdf) { window.Android.savePdf(doc.output('datauristring').split(',')[1], fileName); }
    else { doc.save(fileName); }
}

async function generarPDFResumenHistorial() {
    const busq = document.getElementById('buscarHistorial').value.toLowerCase();
    const desde = document.getElementById('historialFechaDesde').value;
    const hasta = document.getElementById('historialFechaHasta').value;
    const est = document.getElementById('historialFiltroEstado').value;
    const rF = remitos.filter(r => {
        const cB = r.cliente.toLowerCase().includes(busq) || r.vendedor.toLowerCase().includes(busq);
        const cD = desde ? r.fecha >= desde : true;
        const cH = hasta ? r.fecha <= hasta : true;
        const cE = est ? r.estadoPago === est : true;
        return cB && cD && cH && cE;
    }).sort((a, b) => {
        const o = { 'Pagado': 1, 'Cta Cte': 2, 'Pendiente': 3 };
        return (o[a.estadoPago] || 4) - (o[b.estadoPago] || 4);
    });
    if (rF.length === 0) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    doc.setFontSize(16); doc.text('RESUMEN DE FACTURACIÓN', 105, 15, { align: 'center' });
    const vendU = [...new Set(rF.map(r => r.vendedor))];
    const zonaU = [...new Set(rF.map(r => r.zona))];
    let infoVZ = ""; if (vendU.length === 1) infoVZ += `Vendedor: ${vendU[0]} `; if (zonaU.length === 1) infoVZ += `| Zona: ${zonaU[0]}`;
    if (infoVZ) doc.text(infoVZ, 105, 20, { align: 'center' });
    doc.setFontSize(10); doc.text(`Filtros: ${est||'Todos'} | Periodo: ${desde||'ini'} a ${hasta||'hoy'}`, 105, 26, { align: 'center' });
    const headers = [['Fecha', 'Cliente', 'Vendedor', 'Factura', 'Estado', 'Monto']];
    const data = []; let lastE = null; let subT = 0;
    rF.forEach((r, idx) => {
        const curE = r.estadoPago || 'Pendiente';
        if (lastE !== null && lastE !== curE) {
            data.push([{ content: `SUBTOTAL ${lastE.toUpperCase()}: $${subT.toFixed(2)}`, colSpan: 6, styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 245, 245] } }]);
            subT = 0;
        }
        if (lastE !== curE) { data.push([{ content: `ESTADO: ${curE.toUpperCase()}`, colSpan: 6, styles: { fillColor: [230, 230, 230], fontStyle: 'bold' } }]); }
        data.push([r.fecha, r.cliente, r.vendedor, r.numFactura || '', curE, r.montoTotal > 0 ? `$${r.montoTotal.toFixed(2)}` : '']);
        subT += (parseFloat(r.montoTotal) || 0); lastE = curE;
        if (idx === rF.length - 1) { data.push([{ content: `SUBTOTAL ${curE.toUpperCase()}: $${subT.toFixed(2)}`, colSpan: 6, styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 245, 245] } }]); }
    });
    doc.autoTable({ head: headers, body: data, startY: 32, styles: { fontSize: 8 }, headStyles: { fillColor: [31, 78, 121] }, theme: 'grid' });
    const totalG = rF.reduce((s, r) => s + (parseFloat(r.montoTotal) || 0), 0);
    doc.setFontSize(11); doc.text(`TOTAL GENERAL: $${totalG.toFixed(2)}`, 190, doc.lastAutoTable.finalY + 12, { align: 'right' });
    const fileName = `Resumen_Facturacion_${new Date().getTime()}.pdf`;
    if (window.Android && window.Android.savePdf) { window.Android.savePdf(doc.output('datauristring').split(',')[1], fileName); }
    else { doc.save(fileName); }
}

async function generarPDFVisitas() {
    const fI = document.getElementById('fechaVisitaInicio').value;
    const fF = document.getElementById('fechaVisitaFin').value;
    const vI = document.getElementById('vendedorVisita').value;
    const z = document.getElementById('zonaVisita').value;
    if (!vI || !z || !fI || !fF) return;
    const vend = vendedores.find(v => v.id == vI);
    const clZ = clientes.filter(c => c.zona && c.zona.trim().toLowerCase() === z.trim().toLowerCase()).sort((a,b)=>a.nombre.localeCompare(b.nombre));
    const { jsPDF } = window.jspdf; const doc = new jsPDF();
    doc.setFontSize(16); doc.text('REPORTE DE VISITAS Y CONTACTOS', 105, 15, { align: 'center' });
    doc.setFontSize(10); doc.text(`Periodo: ${fI} al ${fF} | Vendedor: ${vend.nombre} | Zona: ${z}`, 20, 25);
    const data = clZ.map(c => [c.nombre, c.telefono || '-', clienteVisitadoEnRango(c.id, fI, fF) ? 'VISITADO' : 'PENDIENTE']);
    doc.autoTable({ head: [['Cliente', 'Teléfono', 'Estado']], body: data, startY: 30, styles: { fontSize: 9 }, headStyles: { fillColor: [31, 78, 121] } });
    const vCount = clZ.filter(c => clienteVisitadoEnRango(c.id, fI, fF)).length;
    doc.text(`Total: ${clZ.length} | Visitados: ${vCount} | Pendientes: ${clZ.length - vCount}`, 20, doc.lastAutoTable.finalY + 10);
    const fileName = `Visitas_${vend.nombre}_${z}.pdf`;
    if (window.Android && window.Android.savePdf) { window.Android.savePdf(doc.output('datauristring').split(',')[1], fileName); }
    else { doc.save(fileName); }
}
