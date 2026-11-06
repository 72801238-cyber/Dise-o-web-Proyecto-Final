// Array para almacenar los ítems añadidos
let carrito = [];

// Selección de elementos del DOM
const botonesComprar = document.querySelectorAll('.btn-comprar');
const listaCarrito = document.getElementById('lista-carrito');
const subtotalCarrito = document.getElementById('subtotal-carrito');
const igvCarrito = document.getElementById('igv-carrito');
const totalCarrito = document.getElementById('total-carrito');
const contadorCarrito = document.getElementById('contador-carrito');
const btnVaciar = document.getElementById('btn-vaciar');

// Escuchador de eventos para los botones "Comprar"
botonesComprar.forEach(boton => {
    boton.addEventListener('click', (e) => {
        const productoNombre = e.target.getAttribute('data-nombre');
        const productoPrecio = parseFloat(e.target.getAttribute('data-precio'));

        agregarAlCarrito(productoNombre, productoPrecio);
    });
});

// Función para agregar ítems al arreglo
function agregarAlCarrito(nombre, precio) {
    carrito.push({ nombre, precio });
    actualizarCarrito();
}

// Función para actualizar lista, subtotal, IGV (18%), total y contador
function actualizarCarrito() {
    listaCarrito.innerHTML = '';
    let total = 0;

    if (carrito.length === 0) {
        listaCarrito.innerHTML = '<li>El carrito está vacío.</li>';
    } else {
        carrito.forEach((item) => {
            total += item.precio;
            const li = document.createElement('li');
            li.textContent = `${item.nombre} — S/ ${item.precio.toFixed(2)}`;
            listaCarrito.appendChild(li);
        });
    }

    // Desglose del IGV (18%) 
    const subtotal = total / 1.18;
    const igv = total - subtotal;

    // Actualización de textos formateados a 2 decimales
    if (subtotalCarrito) subtotalCarrito.textContent = subtotal.toFixed(2);
    if (igvCarrito) igvCarrito.textContent = igv.toFixed(2);
    if (totalCarrito) totalCarrito.textContent = total.toFixed(2);
    if (contadorCarrito) contadorCarrito.textContent = carrito.length;
}

// Evento para limpiar el carrito de compras
if (btnVaciar) {
    btnVaciar.addEventListener('click', () => {
        carrito = [];
        actualizarCarrito();
    });
}

// Inicializar el carrito vacío al cargar la página
actualizarCarrito();
