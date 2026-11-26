// script.js
let carrito = [];

const contenedorCatalogo = document.getElementById("catalogo");
const listaCarrito = document.getElementById("lista-carrito");
const subtotalCarrito = document.getElementById("subtotal-carrito");
const igvCarrito = document.getElementById("igv-carrito");
const totalCarrito = document.getElementById("total-carrito");
const contadorCarrito = document.getElementById("contador-carrito");
const btnVaciar = document.getElementById("btn-vaciar");

const redondear = (valor) => Math.round(Number(valor) * 100) / 100;

function calcularDesglose(totalConIgv, tasaIgv = 0.18) {
    const total = redondear(totalConIgv);
    const subtotal = redondear(total / (1 + tasaIgv));
    const igv = redondear(total - subtotal);
    return { subtotal, igv, total };
}

function crearTarjetaProducto(producto) {
    return `
        <article class="producto">
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion}</p>
            <p><strong>${producto.obtenerPrecioFormateado()}</strong></p>
            <button type="button" class="btn-comprar" data-id="${producto.id}">Comprar</button>
        </article>
    `;
}

function renderizarCatalogo(listaProductos) {
    if (!contenedorCatalogo) return;
    contenedorCatalogo.innerHTML = listaProductos.map(crearTarjetaProducto).join("");
}

function agregarAlCarrito(idProducto) {
    const producto = catalogoProductos.find((item) => item.id === Number(idProducto));
    if (!producto || !producto.tieneStockDisponible(1)) return;

    carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: Number(producto.precio)
    });

    actualizarCarrito();
}

function actualizarCarrito() {
    if (!listaCarrito) return;
    listaCarrito.innerHTML = "";

    let sumaTotal = 0;

    if (carrito.length === 0) {
        listaCarrito.innerHTML = "<li>El carrito está vacío.</li>";
    } else {
        carrito.forEach((item) => {
            sumaTotal = redondear(sumaTotal + Number(item.precio));
            const li = document.createElement("li");
            li.textContent = `${item.nombre} — S/ ${Number(item.precio).toFixed(2)}`;
            listaCarrito.appendChild(li);
        });
    }

    const { subtotal, igv, total } = calcularDesglose(sumaTotal);

    if (subtotalCarrito) subtotalCarrito.textContent = subtotal.toFixed(2);
    if (igvCarrito) igvCarrito.textContent = igv.toFixed(2);
    if (totalCarrito) totalCarrito.textContent = total.toFixed(2);
    if (contadorCarrito) contadorCarrito.textContent = carrito.length;
}

if (contenedorCatalogo) {
    contenedorCatalogo.addEventListener("click", (evento) => {
        const boton = evento.target.closest(".btn-comprar");
        if (!boton) return;
        const id = boton.getAttribute("data-id");
        agregarAlCarrito(id);
    });
}

if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
        carrito = [];
        actualizarCarrito();
    });
}

if (typeof catalogoProductos !== "undefined") {
    renderizarCatalogo(catalogoProductos);
}
actualizarCarrito();
