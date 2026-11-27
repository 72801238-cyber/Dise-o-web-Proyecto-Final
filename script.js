// script.js
let carrito = cargarCarritoGuardado();

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
const btnPagar = document.getElementById("btn-pagar");

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
        return "#ffc107"; 
    }
    return "#ffffff"; 
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

function eliminarItemCarrito(indice) {
    if (indice < 0 || indice >= carrito.length) return;

    const itemEliminado = carrito[indice];
    if (typeof catalogoProductos !== "undefined" && itemEliminado.id !== null) {
        const prod = catalogoProductos.find((p) => p.id === itemEliminado.id);
        if (prod) {
            prod.stock += 1;
        }
    }

    carrito.splice(indice, 1);
    guardarCarrito();
    actualizarCarrito();
}

function actualizarCarrito() {
    if (!listaCarrito) return;
    listaCarrito.innerHTML = "";

    let sumaTotal = 0;

    if (carrito.length === 0) {
        listaCarrito.innerHTML = '<li class="list-group-item">El carrito está vacío.</li>';
    } else {
        carrito.forEach((item, index) => {
            sumaTotal = redondear(sumaTotal + Number(item.precio));
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center gap-2";

            const textoSpan = document.createElement("span");
            textoSpan.textContent = `${item.nombre} — S/ ${Number(item.precio).toFixed(2)}`;

            const btnEliminar = document.createElement("button");
            btnEliminar.type = "button";
            btnEliminar.className = "btn btn-sm btn-outline-danger btn-eliminar-item";
            btnEliminar.setAttribute("data-index", String(index));
            btnEliminar.setAttribute("aria-label", `Eliminar ${item.nombre}`);
            btnEliminar.textContent = "×";

            li.appendChild(textoSpan);
            li.appendChild(btnEliminar);
            listaCarrito.appendChild(li);
        });
    }

    const { subtotal, igv, total } = calcularDesglose(sumaTotal);

    if (subtotalCarrito) subtotalCarrito.textContent = subtotal.toFixed(2);
    if (igvCarrito) igvCarrito.textContent = igv.toFixed(2);
    if (totalCarrito) totalCarrito.textContent = total.toFixed(2);

    actualizarEstadoCarritoNav(carrito.length);

    if (btnPagar) btnPagar.disabled = carrito.length === 0;

    if (typeof catalogoProductos !== "undefined" && contenedorCatalogo && contenedorCatalogo.id === "catalogo") {
        renderizarCatalogo(catalogoProductos);
    } else {
        sincronizarStockVisual();
    }
}

if (listaCarrito) {
    listaCarrito.addEventListener("click", (evento) => {
        const botonEliminar = evento.target.closest(".btn-eliminar-item");
        if (!botonEliminar) return;

        const indice = Number(botonEliminar.getAttribute("data-index"));
        eliminarItemCarrito(indice);
    });
}

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

const panelCobroEl = document.getElementById("panel-cobro");
const panelCobro = new bootstrap.Offcanvas(panelCobroEl);
const vistaProcesando = document.getElementById("cobro-procesando");
const vistaExito = document.getElementById("cobro-exito");
let temporizadorCobro = null;

function guardarPedido(pedido) {
    try {
        const historial = JSON.parse(localStorage.getItem("pedidos")) ?? [];
        localStorage.setItem("pedidos", JSON.stringify([...historial, pedido]));
    } catch {
        localStorage.setItem("pedidos", JSON.stringify([pedido]));
    }
}

if (btnPagar) {
    btnPagar.addEventListener("click", () => {
        if (carrito.length === 0) return;

        const suma = carrito.reduce((acum, item) => redondear(acum + Number(item.precio)), 0);
        const { total } = calcularDesglose(suma);
        const cantidad = carrito.length;
        const numeroPedido = "PED-" + Date.now().toString(36).toUpperCase();
        const productosComprados = [...carrito];

        vistaProcesando.classList.remove("d-none");
        vistaExito.classList.add("d-none");
        panelCobro.show();

        clearTimeout(temporizadorCobro);
        temporizadorCobro = setTimeout(() => {
            guardarPedido({
                numero: numeroPedido,
                fecha: new Date().toISOString(),
                productos: productosComprados,
                total: total
            });

            document.getElementById("cobro-pedido").textContent = numeroPedido;
            document.getElementById("cobro-items").textContent =
                `${cantidad} producto${cantidad === 1 ? "" : "s"}`;
            document.getElementById("cobro-total").textContent = total.toFixed(2);

            carrito = [];
            localStorage.removeItem("carrito");
            actualizarCarrito();

            vistaProcesando.classList.add("d-none");
            vistaExito.classList.remove("d-none");
        }, 1500);
    });

    panelCobroEl.addEventListener("hidden.bs.offcanvas", () => {
        if (!vistaProcesando.classList.contains("d-none")) {
            clearTimeout(temporizadorCobro);
            vistaProcesando.classList.add("d-none");
        }
    });
}

restaurarStockDelCarrito();
if (typeof catalogoProductos !== "undefined" && contenedorCatalogo && contenedorCatalogo.id === "catalogo") {
    renderizarCatalogo(catalogoProductos);
}
actualizarCarrito();
