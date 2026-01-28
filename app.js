const URL_API = "https://script.google.com/macros/s/AKfycbxGJBkDaEsVY-QIxtGfIGlLIsAIje6w5roUQ7a5WHDFJC_WuafcOuVpQuFmNFtUw2ZE/exec"; 
let menu = [], carrito = [];

// Cargar datos al abrir la app
window.onload = async () => {
    try {
        const res = await fetch(URL_API);
        menu = await res.json();
        const div = document.getElementById('menu');
        div.innerHTML = menu.map((p, i) => `
            <div class="col">
                <div class="card h-100 border-0 shadow-sm text-center">
                    <img src="${p.foto || 'https://via.placeholder.com/150'}" class="card-img-top">
                    <div class="card-body p-2">
                        <p class="card-title fw-bold mb-1">${p.nombre}</p>
                        <p class="text-success small mb-2">$${p.precio}</p>
                        <button class="btn btn-sm btn-primary w-100" onclick="add(${i})">Agregar</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) {
        alert("Error al cargar el menú. Verifica tu URL de API.");
    }
};

function add(i) {
    const p = menu[i];
    const item = carrito.find(c => c.nombre === p.nombre);
    // IMPORTANTE: Aquí congelamos el precio capturando el de 'p' en este instante
    item ? item.cantidad++ : carrito.push({
        nombre: p.nombre, 
        precio: p.precio, 
        cantidad: 1
    });
    document.getElementById('count').innerText = carrito.reduce((a,b)=>a+b.cantidad, 0);
}

function mostrarCarrito() {
    const lista = document.getElementById('lista-cart');
    let total = 0;
    lista.innerHTML = carrito.map(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        return `<div class="list-group-item d-flex justify-content-between align-items-center">
            <div><b>${item.nombre}</b><br><small>$${item.precio} x ${item.cantidad}</small></div>
            <span class="badge bg-primary">$${subtotal}</span>
        </div>`;
    }).join('');
    document.getElementById('total').innerText = total;
    new bootstrap.Modal(document.getElementById('cartModal')).show();
}

async function enviar() {
    const mesa = document.getElementById('mesa').value;
    if(!mesa) return alert("Escribe el número de mesa");
    if(carrito.length === 0) return alert("El carrito está vacío");

    const btn = document.querySelector('.btn-success');
    btn.disabled = true; 
    btn.innerText = "Enviando...";
    
    const payload = {
        mesa: mesa,
        tipo_pedido: document.getElementById('tipo').value,
        comentarios: document.getElementById('notas').value,
        carrito: carrito, // Aquí viajan los precios congelados
        total: document.getElementById('total').innerText
    };

    await fetch(URL_API, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
    
    alert("✅ Pedido registrado en Google Sheets");
    location.reload(); // Limpiar todo
}