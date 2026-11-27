// script.js
const contenedorCatalogo = document.getElementById("catalogo");
const listaCarrito = document.getElementById("lista-carrito");
const subtotalCarrito = document.getElementById("subtotal-carrito");
const igvCarrito = document.getElementById("igv-carrito");
const totalCarrito = document.getElementById("total-carrito");
const contadorCarrito = document.getElementById("contador-carrito");
const enlaceCarrito = document.querySelector('a[href="#carrito"]');
const btnVaciar = document.getElementById("btn-vaciar");

function redondearCentimos(valor) {
    const numero = Number(valor);
    return Math.round(numero * 100) / 100;
}

function calcularSubtotal(totalConIgv, tasaIgv = 0.18) {
    const limpio = redondearCentimos(totalConIgv);
    return redondearCentimos(limpio / (1 + Number(tasaIgv)));
}

function calcularIgv(totalConIgv, tasaIgv = 0.18) {
    const total = redondearCentimos(totalConIgv);
    const subtotal = calcularSubtotal(total, tasaIgv);
    return redondearCentimos(total - subtotal);
}

function obtenerColorPorTexto(texto, unidades) {
    const totalUnidades = Number(unidades);
    if (texto.length === 0) {
        return "#000000";
    }
    if (totalUnidades === 0) {
        return "#000000";
    }
    return "#dc3545";
}

class Carrito {
    constructor(productos) {
        this.productos = productos;
        this.items = new Map(); 
    }

    buscarProducto(idProducto) {
        const idBuscado = Number(idProducto);
        for (const prod of this.productos) {
            if (prod.id === idBuscado) {
                return prod;
            }
        }
        return undefined;
    }

    agregar(idProducto, cantidad = 1) {
        const cant = Number(cantidad);
        const producto = this.buscarProducto(idProducto);
        if (!producto || cant <= 0) {
            return false;
        }
        if (!producto.tieneStockDisponible(cant)) {
            return false;
        }
        producto.reducirStock(cant);
        const actual = this.items.get(producto.id) ?? 0;
        this.items.set(producto.id, actual + cant);
        return true;
    }

    restar(idProducto) {
        const id = Number(idProducto);
        const actual = this.items.get(id) ?? 0;
        const producto = this.buscarProducto(id);
        if (actual <= 0 || !producto) {
            return false;
        }
        producto.stock = Number(producto.stock) + 1;
        if (actual === 1) {
            this.items.delete(id);
        } else {
            this.items.set(id, actual - 1);
        }
        return true;
    }

    quitar(idProducto) {
        const id = Number(idProducto);
        const actual = this.items.get(id) ?? 0;
        const producto = this.buscarProducto(id);
        if (actual <= 0 || !producto) {
            return false;
        }
        producto.stock = Number(producto.stock) + actual;
        this.items.delete(id);
        return true;
    }

    vaciar() {
        for (const [id, cantidad] of this.items.entries()) {
            const producto = this.buscarProducto(id);
            if (producto) {
                producto.stock = Number(producto.stock) + Number(cantidad);
            }
        }
        this.items.clear();
    }

    totalUnidades() {
        let suma = 0;
        for (const cantidad of this.items.values()) {
            suma += Number(cantidad);
        }
        return suma;
    }

    totalPagar() {
        let suma = 0;
        for (const [id, cantidad] of this.items.entries()) {
            const producto = this.buscarProducto(id);
            if (producto) {
                const importe = redondearCentimos(Number(producto.precio) * Number(cantidad));
                suma = redondearCentimos(suma + importe);
            }
        }
        return suma;
    }
}

const carrito = new Carrito(catalogoProductos);

function tarjetaHtml(producto) {
    const sinStock = Number(producto.stock) <= 0;
    const estadoStock = sinStock ? "Agotado" : `Stock: ${producto.stock}`;
    const atributoDisabled = sinStock ? "disabled" : "";
    const textoBoton = sinStock ? "Sin stock" : "Comprar";

    return `
        <div class="col">
            <article class="producto card h-100 tarjeta-producto">
                <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" loading="lazy">
                <div class="card-body d-flex flex-column">
                    <h3 class="h5 card-title">${producto.nombre}</h3>
                    <p class="card-text">${producto.descripcion}</p>
                    <p class="card-text"><small>${estadoStock}</small></p>
                    <p class="card-text"><strong>${producto.obtenerPrecioFormateado()}</strong></p>
                    <button type="button" class="btn-comprar btn btn-primary mt-auto" data-id="${producto.id}" ${atributoDisabled}>${textoBoton}</button>
                </div>
            </article>
        </div>
    `;
}

function pintarCatalogo() {
    if (!contenedorCatalogo) return;
    contenedorCatalogo.innerHTML = catalogoProductos.map(tarjetaHtml).join("");
}

function pintarEncabezadoCarrito(unidades) {
    if (contadorCarrito) {
        contadorCarrito.textContent = String(unidades);
    }
    if (enlaceCarrito) {
        const etiquetaCompleta = `Carrito (${unidades})`;
        enlaceCarrito.style.color = obtenerColorPorTexto(etiquetaCompleta, unidades);
    }
}

function pintarCarrito() {
    if (!listaCarrito) return;
    listaCarrito.innerHTML = "";

    if (carrito.items.size === 0) {
        listaCarrito.innerHTML = '<li class="list-group-item">El carrito está vacío.</li>';
    } else {
        for (const [id, cantidad] of carrito.items.entries()) {
            const producto = carrito.buscarProducto(id);
            if (!producto) continue;

            const importe = redondearCentimos(Number(producto.precio) * Number(cantidad));
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center gap-2 flex-wrap";
            li.innerHTML = `
                <span>
                    <strong>${producto.nombre}</strong> — S/ ${Number(producto.precio).toFixed(2)} x ${cantidad}
                    = <strong>S/ ${importe.toFixed(2)}</strong>
                </span>
                <span class="d-flex gap-1">
                    <button type="button" class="btn btn-sm btn-outline-secondary btn-restar" data-id="${id}">-</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary btn-sumar" data-id="${id}" ${Number(producto.stock) <= 0 ? "disabled" : ""}>+</button>
                    <button type="button" class="btn btn-sm btn-danger btn-quitar" data-id="${id}">Quitar</button>
                </span>
            `;
            listaCarrito.appendChild(li);
        }
    }

    const total = carrito.totalPagar();
    const subtotal = calcularSubtotal(total);
    const igv = calcularIgv(total);
    const unidades = carrito.totalUnidades();

    if (subtotalCarrito) subtotalCarrito.textContent = subtotal.toFixed(2);
    if (igvCarrito) igvCarrito.textContent = igv.toFixed(2);
    if (totalCarrito) totalCarrito.textContent = total.toFixed(2);
    pintarEncabezadoCarrito(unidades);
}

function actualizarTodo() {
    pintarCatalogo();
    pintarCarrito();
}

if (contenedorCatalogo) {
    contenedorCatalogo.addEventListener("click", (evento) => {
        const boton = evento.target.closest(".btn-comprar");
        if (!boton) return;
        const id = boton.getAttribute("data-id");
        if (carrito.agregar(id, 1)) {
            actualizarTodo();
        }
    });
}

if (listaCarrito) {
    listaCarrito.addEventListener("click", (evento) => {
        const boton = evento.target.closest("button");
        if (!boton) return;
        const id = boton.getAttribute("data-id");
        let accion = "";

        if (boton.classList.contains("btn-sumar")) accion = "sumar";
        else if (boton.classList.contains("btn-restar")) accion = "restar";
        else if (boton.classList.contains("btn-quitar")) accion = "quitar";

        switch (accion) {
            case "sumar":
                if (carrito.agregar(id, 1)) actualizarTodo();
                break;
            case "restar":
                if (carrito.restar(id)) actualizarTodo();
                break;
            case "quitar":
                if (carrito.quitar(id)) actualizarTodo();
                break;
            default:
                break;
        }
    });
}

if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
        carrito.vaciar();
        actualizarTodo();
    });
}

actualizarTodo();
