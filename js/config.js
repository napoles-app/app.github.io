// Datos iniciales de productos
const productosIniciales = {
    normales: [
        { id: 1, codigo: "13", nombre: "ALBONDIGAS DE CARNE x KG", precio: 16800 },
        { id: 2, codigo: "14", nombre: "ALBONDIGAS DE POLLO x KG", precio: 10280 },
        { id: 3, codigo: "18", nombre: "CHORIZO PARRILLERO GRANALIER x KG", precio: 7180 },
        { id: 4, codigo: "6", nombre: "EMPANADAS ARABES x 6 unid", precio: 4900 },
        { id: 5, codigo: "4", nombre: "EMPANADAS DE CARNE x 6 unid", precio: 4410 },
        { id: 6, codigo: "7", nombre: "EMPANADAS JAMON/QUESO x 6 unid", precio: 4410 },
        { id: 7, codigo: "5", nombre: "EMPANADAS DE POLLO x 6 unid", precio: 4410 },
        { id: 8, codigo: "95", nombre: "FIAMBRE COCIDO DE CERDO pieza el kg", precio: 6770 },
        { id: 9, codigo: "3", nombre: "HAMB. CARNE", precio: 4500 },
        { id: 10, codigo: "12", nombre: "MEDALLON POLLO", precio: 2690 },
        { id: 11, codigo: "2", nombre: "MILA POLLO x 3 KG EL KG", precio: 7500 },
        { id: 12, codigo: "1", nombre: "MILA VACUNA x 3 KG el KG", precio: 12790 },
        { id: 13, codigo: "16", nombre: "MILA CERDO x KG", precio: 8190 },
        { id: 14, codigo: "10", nombre: "MOLIDA POLLO", precio: 10500 },
        { id: 15, codigo: "19", nombre: "MORCILLA GRANALIER x KG", precio: 5250 },
        { id: 16, codigo: "94", nombre: "MORTA BOCHA 254 pieza x KG", precio: 6150 },
        { id: 17, codigo: "96", nombre: "MORTA CIL Don Alejandro pieza x KG", precio: 4650 },
        { id: 18, codigo: "11", nombre: "NUGGETS POLLO x KG", precio: 9290 },
        { id: 19, codigo: "15", nombre: "PIZZA PRELISTA", precio: 4900 },
        { id: 20, codigo: "91", nombre: "QUESO BARRA pieza x KG", precio: 11550 },
        { id: 21, codigo: "17", nombre: "QUESO CREMOSO pieza x KG", precio: 10500 },
        { id: 22, codigo: "20", nombre: "SALCHICHA GRANALIER x 6 - 20pq", precio: 25300 },
        { id: 23, codigo: "9", nombre: "VARENIKES x DOC", precio: 3675 }
    ],
    ofertas: [
        { id: 24, codigo: "O13", nombre: "ALBONDIGAS POLLO x 5 KG", precio: 15850 },
        { id: 25, codigo: "OF2", nombre: "MILA POLLO x 5 CAJAS x KG", precio: 6300 },
        { id: 26, codigo: "O1", nombre: "MILA CARNE x 3 CAJAS x KG", precio: 11190 },
        { id: 27, codigo: "O2", nombre: "MILA POLLO x 3 CAJAS x KG", precio: 6950 },
        { id: 28, codigo: "O11", nombre: "NUGGETS x 5 KG por KG", precio: 8230 }
    ]
};

// Variables globales
let clientes = JSON.parse(localStorage.getItem('clientes')) || [];
let vendedores = JSON.parse(localStorage.getItem('vendedores')) || [];
let productos = JSON.parse(localStorage.getItem('productos')) || { normales: [], ofertas: [] };
let remitos = JSON.parse(localStorage.getItem('remitos')) || [];
let visitas = JSON.parse(localStorage.getItem('visitas')) || {};
let remitoActual = { id: null, cliente: '', vendedor: '', zona: '', fecha: '', productos: [], obs: '', numFactura: '', montoTotal: 0, estadoPago: 'Pendiente' };

// Inicialización de productos si están vacíos
if (productos.normales.length === 0 && productos.ofertas.length === 0) {
    productos = JSON.parse(JSON.stringify(productosIniciales));
    localStorage.setItem('productos', JSON.stringify(productos));
}

// Función general para cambiar de pestaña
function cambiarPestana(pestana) {
    document.querySelectorAll('.pestana').forEach(p => p.classList.remove('active'));
    document.getElementById(`pestana-${pestana}`).classList.add('active');
}

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // Fecha de hoy por defecto en visitas
    const hoy = new Date().toISOString().split('T')[0];
    if (document.getElementById('fechaVisitaInicio')) {
        document.getElementById('fechaVisitaInicio').value = hoy;
        document.getElementById('fechaVisitaFin').value = hoy;
    }

    // Cargar todos los módulos
    if (typeof cargarProductosDisponibles === 'function') cargarProductosDisponibles();
    if (typeof cargarProductosGestion === 'function') cargarProductosGestion();
    if (typeof cargarSelects === 'function') cargarSelects();
    if (typeof cargarSelectsVisitas === 'function') cargarSelectsVisitas();
    if (typeof cargarClientes === 'function') cargarClientes();
    if (typeof cargarVendedores === 'function') cargarVendedores();
    if (typeof cargarHistorial === 'function') cargarHistorial();
    if (typeof nuevoRemito === 'function') nuevoRemito();

    // Empezar en visitas
    cambiarPestana('visitas');
});
