// script.js
// Array para almacenar los ítems añadidos (recuperado de localStorage si existe)
let carrito = cargarCarritoGuardado();

// Selección de elementos
const contenedorCatalogo =
    document.getElementById("catalogo") || document.querySelector("#productos .contenedor");
const listaCarrito = document.getElementById("lista-carrito");
const subtotalCarrito = document.getElementById("subtotal-carrito");
const igvCarrito = document.getElementById("igv-carrito");
const totalCarrito = document.getElementById("total-carrito");
const contadorCarrito = document.getElementById("contador-carrito");
const enlaceCarrito =
    document.getElementById("enlace-carrito") || document.querySelector('a[href="#carrito"]');
const btnVaciar = document.getElementById("btn-vaciar");

const redondear = (valor) => Math.round(Number(valor) * 100) / 100;

function cargarCarritoGuardado() {
    try {
        const datos = JSON.parse(localStorage.getItem("carrito"));
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function restaurarStockDelCarrito() {
    if (typeof catalogoProductos === "undefined") {
        return;
    }
    carrito.forEach((item) => {
        const producto = catalogoProductos.find((p) => p.id === item.id);
        if (producto && producto.tieneStockDisponible(1)) {
            producto.reducirStock(1);
        }
    });
}

function calcularDesglose(totalConIgv, tasaIgv = 0.18) {
    const total = redondear(totalConIgv);
    const subtotal = redondear(total / (1 + tasaIgv));
    const igv = redondear(total - subtotal);
    return { subtotal, igv, total };
}

function obtenerColorCarrito(textoCompleto, cantidadItems) {
    const longitud = String(textoCompleto).length;
    if (longitud > 0 && Number(cantidadItems) > 0) {
        return "#dc3545"; // Rojo cuando hay artículos agregados
    }
    return "#000000"; // Negro cuando está en 0
}

function crearTarjetaProducto(producto) {
    const sinStock = !producto.tieneStockDisponible(1);
    const textoStock = sinStock ? "Sin stock" : `Stock: ${producto.stock}`;

    return `
        <div class="col">
            <article class="producto card h-100 tarjeta-producto">
                <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" loading="lazy">
                <div class="card-body d-flex flex-column">
                    <h3 class="h5 card-title">${producto.nombre}</h3>
                    <p class="card-text">${producto.descripcion}</p>
                    <p class="card-text"><small>${textoStock}</small></p>
                    <p class="card-text"><strong>${producto.obtenerPrecioFormateado()}</strong></p>
                    <button
                        type="button"
                        class="btn-comprar btn btn-primary mt-auto"
                        data-id="${producto.id}"
                        data-nombre="${producto.nombre}"
                        data-precio="${producto.precio}"
                        ${sinStock ? "disabled" : ""}
                    >
                        ${sinStock ? "Agotado" : "Comprar"}
                    </button>
                </div>
            </article>
        </div>
    `;
}

function renderizarCatalogo(listaProductos) {
    if (!contenedorCatalogo || !Array.isArray(listaProductos)) return;
    contenedorCatalogo.innerHTML = listaProductos.map(crearTarjetaProducto).join("");
}

function sincronizarStockVisual() {
    if (!contenedorCatalogo || typeof catalogoProductos === "undefined") return;
    const tarjetas = contenedorCatalogo.querySelectorAll(".producto");

    tarjetas.forEach((tarjeta) => {
        const boton = tarjeta.querySelector(".btn-comprar");
        if (!boton) return;

        const idAttr = boton.getAttribute("data-id");
        const nombreAttr = (boton.getAttribute("data-nombre") || "").trim().toLowerCase();

        const producto = catalogoProductos.find((item) => {
            if (idAttr) return Number(item.id) === Number(idAttr);
            return item.nombre.trim().toLowerCase().includes(nombreAttr) ||
                nombreAttr.includes(item.nombre.trim().toLowerCase());
        });

        if (!producto) return;

        let etiquetaStock = tarjeta.querySelector(".stock-dinamico");
        if (!etiquetaStock) {
            etiquetaStock = document.createElement("p");
            etiquetaStock.className = "card-text small stock-dinamico mb-2";
            boton.parentElement.insertBefore(etiquetaStock, boton);
        }

        const disponible = producto.tieneStockDisponible(1);
        etiquetaStock.textContent = disponible ? `Stock: ${producto.stock}` : "Sin stock";
        boton.disabled = !disponible;
        boton.textContent = disponible ? "Comprar" : "Agotado";
    });
}

function actualizarEstadoCarritoNav(cantidad) {
    if (contadorCarrito) {
        contadorCarrito.textContent = String(cantidad);
    }
    if (enlaceCarrito) {
        const textoEtiqueta = `Carrito (${cantidad})`;
        enlaceCarrito.style.color = obtenerColorCarrito(textoEtiqueta, cantidad);
    }
}

// Función para agregar ítems al arreglo validando stock
function agregarAlCarrito(idProducto, nombreFallback, precioFallback) {
    let producto = null;

    if (typeof catalogoProductos !== "undefined") {
        if (idProducto !== null && idProducto !== undefined && idProducto !== "") {
            producto = catalogoProductos.find((item) => item.id === Number(idProducto));
        } else if (nombreFallback) {
            const buscado = String(nombreFallback).trim().toLowerCase();
            producto = catalogoProductos.find(
                (item) =>
                    item.nombre.trim().toLowerCase().includes(buscado) ||
                    buscado.includes(item.nombre.trim().toLowerCase())
            );
        }
    }

    if (producto) {
        if (!producto.tieneStockDisponible(1)) return;
        producto.reducirStock(1);
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: Number(producto.precio)
        });
    } else if (nombreFallback && !Number.isNaN(Number(precioFallback))) {
        carrito.push({
            id: null,
            nombre: nombreFallback,
            precio: Number(precioFallback)
        });
    }

    guardarCarrito();
    actualizarCarrito();
}

// Función para actualizar lista, subtotal, IGV (18%), total y contador
function actualizarCarrito() {
    if (!listaCarrito) return;
    listaCarrito.innerHTML = "";

    let sumaTotal = 0;

    if (carrito.length === 0) {
        listaCarrito.innerHTML = '<li class="list-group-item">El carrito está vacío.</li>';
    } else {
        carrito.forEach((item) => {
            sumaTotal = redondear(sumaTotal + Number(item.precio));
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.textContent = `${item.nombre} — S/ ${Number(item.precio).toFixed(2)}`;
            listaCarrito.appendChild(li);
        });
    }

    // Desglose del IGV (18%)
    const { subtotal, igv, total } = calcularDesglose(sumaTotal);

    // Actualización de textos formateados a 2 decimales
    if (subtotalCarrito) subtotalCarrito.textContent = subtotal.toFixed(2);
    if (igvCarrito) igvCarrito.textContent = igv.toFixed(2);
    if (totalCarrito) totalCarrito.textContent = total.toFixed(2);

    actualizarEstadoCarritoNav(carrito.length);

    if (typeof catalogoProductos !== "undefined" && contenedorCatalogo && contenedorCatalogo.id === "catalogo") {
        renderizarCatalogo(catalogoProductos);
    } else {
        sincronizarStockVisual();
    }
}

// Escuchador de eventos para los botones "Comprar"
if (contenedorCatalogo) {
    contenedorCatalogo.addEventListener("click", (evento) => {
        const boton = evento.target.closest(".btn-comprar");
        if (!boton || boton.disabled) return;

        const id = boton.getAttribute("data-id");
        const nombre = boton.getAttribute("data-nombre");
        const precio = parseFloat(boton.getAttribute("data-precio"));
        agregarAlCarrito(id, nombre, precio);
    });
}

// Evento para limpiar el carrito de compras y devolver stock
if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
        if (typeof catalogoProductos !== "undefined") {
            carrito.forEach((item) => {
                const prod = catalogoProductos.find((p) => p.id === item.id);
                if (prod) {
                    prod.stock += 1;
                }
            });
        }
        carrito = [];
        localStorage.removeItem("carrito");
        actualizarCarrito();
    });
}

// Inicializar el catálogo y el carrito al cargar la página
restaurarStockDelCarrito();
if (typeof catalogoProductos !== "undefined" && contenedorCatalogo && contenedorCatalogo.id === "catalogo") {
    renderizarCatalogo(catalogoProductos);
}
actualizarCarrito();
