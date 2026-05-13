let cart = JSON.parse(localStorage.getItem("cart")) || [];
let selectedSize = null;

// =========================
// GUARDAR CARRITO
// =========================
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// =========================
// ABRIR / CERRAR CARRITO
// =========================
function toggleCart() {
  document.getElementById("cart-sidebar").classList.toggle("active");
  renderCart();
}

// =========================
// SELECCIONAR TALLE
// =========================
function selectSize(btn) {
  document.querySelectorAll(".size-options button")
    .forEach(b => b.classList.remove("active"));

  btn.classList.add("active");
  selectedSize = btn.innerText;
}

// =========================
// AGREGAR AL CARRITO
// =========================
function addToCart() {

  if (!selectedSize) {
    alert("Seleccioná un talle");
    return;
  }

  const productData = document.getElementById("product-data");

  const name = productData.dataset.name;
  const price = parseInt(productData.dataset.price);
  const idBase = productData.dataset.id;

  const product = {
    id: idBase + "-" + selectedSize,
    name: name + " (" + selectedSize + ")",
    price: price,
    qty: 1,
    size: selectedSize
  };

  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.qty++;
  } else {
    cart.push(product);
  }

  saveCart();
  renderCart();
  toggleCart();
}

// =========================
// RENDER CARRITO
// =========================
function renderCart() {

  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");

  container.innerHTML = "";

  let total = 0;

  cart.forEach((item, index) => {

    total += item.price * item.qty;

    const div = document.createElement("div");

    div.innerHTML = `
      <div class="cart-item">

        <div class="cart-item-info">
          <strong>${item.name}</strong>
          <span>Talle: ${item.size}</span>
          <span>$${item.price}</span>
        </div>

        <div class="qty-controls">

          <button class="qty-btn" onclick="decreaseQty(${index})">−</button>
          <span class="qty-number">${item.qty}</span>
          <button class="qty-btn" onclick="increaseQty(${index})">+</button>
          <button class="remove-btn" onclick="removeItem(${index})">✕</button>

        </div>

      </div>
    `;

    container.appendChild(div);
  });

  totalEl.innerText = total;
}

// =========================
// CANTIDADES
// =========================
function increaseQty(index) {
  cart[index].qty++;
  saveCart();
  renderCart();
}

function decreaseQty(index) {
  if (cart[index].qty > 1) {
    cart[index].qty--;
  } else {
    cart.splice(index, 1);
  }

  saveCart();
  renderCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

// =========================
// WHATSAPP (OPCIONAL)
// =========================
function checkoutWhatsApp() {
  let message = "Hola! quiero comprar:%0A%0A";
  let total = 0;

  cart.forEach(item => {
    message += `- ${item.name} x${item.qty} ($${item.price})%0A`;
    total += item.price * item.qty;
  });

  message += `%0ATotal: $${total}`;

  window.open(`https://wa.me/59897458846?text=${message}`, "_blank");
}

// =========================
// 💳 MERCADO PAGO (ARREGLADO)
// =========================
async function checkoutMercadoPago() {
  try {
    const res = await fetch("https://antera-backend.onrender.com/create-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: cart }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Error al generar pago");
    }

  } catch (error) {
    console.log(error);
    alert("Error conectando con el servidor");
  }
}