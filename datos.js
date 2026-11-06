/* =============================================================
   Curso      : Diseño Web
   Proyecto   : Tienda Web - FURY Gamer
   Archivo    : datos.js
   Descripción: Definición de la clase Producto y catálogo base
   ============================================================= */

// Clase POO con constructor y 3 métodos requeridos por la rúbrica
class Producto {
    constructor(id, nombre, precio, categoria, stock, imagen, descripcion) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.categoria = categoria;
        this.stock = stock;
        this.imagen = imagen;
        this.descripcion = descripcion;
    }

    // Método 1: Devuelve el precio formateado con el símbolo de moneda y 2 decimales
    obtenerPrecioFormateado() {
        return `S/ ${this.precio.toFixed(2)}`;
    }

    // Método 2: Verifica si hay stock disponible para agregar al carrito
    tieneStockDisponible(cantidadSolicitada = 1) {
        return this.stock >= cantidadSolicitada;
    }

    // Método 3: Actualiza o reduce el stock tras realizar una compra
    reducirStock(cantidad) {
        if (this.tieneStockDisponible(cantidad)) {
            this.stock -= cantidad;
            return true;
        }
        return false;
    }
}

const productosBase = [
    {
        id: 1,
        nombre: "Laptop Gamer FURY Pro",
        precio: 1800.00,
        categoria: "Laptops",
        stock: 5,
        imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZyKz0BaeU7JSATAptnjuASKaHzunkkGYiBqzdqWRjTM3TD-4Q4DXYwoVi&s=10",
        descripcion: "Laptop de alto rendimiento con tarjeta gráfica dedicada y pantalla de 144Hz."
    },
    {
        id: 2,
        nombre: "Celular",
        precio: 900.00,
        categoria: "Celulares",
        stock: 8,
        imagen: "https://promart.vteximg.com.br/arquivos/ids/10286892/Image-1.jpg?v=639077232605400000",
        descripcion: "Smartphone optimizado para juegos móviles con refrigeración líquida."
    },
    {
        id: 3,
        nombre: "Auriculares Gamer ",
        precio: 80.00,
        categoria: "Accesorios",
        stock: 15,
        imagen: "https://rimage.ripley.com.pe/home.ripley/Attachment/MKP/4835/PMP20000382167/thumbnail-1.jpeg",
        descripcion: "Auriculares con sonido envolvente 7.1 y micrófono con cancelación de ruido."
    },
    {
        id: 4,
        nombre: "Silla Gamer ",
        precio: 499.90,
        categoria: "Mobiliario",
        stock: 4,
        imagen: "https://rimage.ripley.com.pe/home.ripley/Attachment/MKP/4835/PMP20000382167/thumbnail-1.jpeg",
        descripcion: "Silla reclinable hasta 180° con soporte lumbar y descansabrazos 3D."
    },
    {
        id: 5,
        nombre: "Torre Gaming",
        precio: 3800.00,
        categoria: "Computadoras",
        stock: 3,
        imagen: "https://rimage.ripley.com.pe/home.ripley/Attachment/MKP/4835/PMP20000382167/thumbnail-1.jpeg",
        descripcion: "PC de escritorio armada con procesador de última generación y refrigeración líquida."
    },
    {
        id: 6,
        nombre: "Mouse Pad Gaming ",
        precio: 40.00,
        categoria: "Accesorios",
        stock: 20,
        imagen: "https://rimage.ripley.com.pe/home.ripley/Attachment/MKP/4835/PMP20000382167/thumbnail-1.jpeg",
        descripcion: "Mouse pad de tela de alta precisión con bordes cosidos e iluminación RGB."
    },
    {
        id: 7,
        nombre: "Micrófono Gamer ",
        precio: 59.90,
        categoria: "Accesorios",
        stock: 10,
        imagen: "https://rimage.ripley.com.pe/home.ripley/Attachment/MKP/4835/PMP20000382167/thumbnail-1.jpeg",
        descripcion: "Micrófono USB ideal para streaming y podcast con patrón polar cardioide."
    },
    {
        id: 8,
        nombre: "Pack Completo Hatsune Miku Edition",
        precio: 1500.00,
        categoria: "Computadoras",
        stock: 2,
        imagen: "https://rimage.ripley.com.pe/home.ripley/Attachment/MKP/4835/PMP20000382167/thumbnail-1.jpeg",
        descripcion: "Set edición especial de gabinete, teclado, mouse y auriculares con temática anime."
    }
];

// Instanciación del catálogo usando la clase Producto
const catalogoProductos = productosBase.map(
    p => new Producto(p.id, p.nombre, p.precio, p.categoria, p.stock, p.imagen, p.descripcion)
);