const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Datos en memoria (en producción usarías una base de datos)
let products = [
  { id: 1, name: 'Laptop HP', price: 15000, stock: 5, image: 'laptop.jpg' },
  { id: 2, name: 'Mouse Inalámbrico', price: 500, stock: 20, image: 'mouse.jpg' },
  { id: 3, name: 'Teclado Mecánico', price: 1200, stock: 15, image: 'keyboard.jpg' },
  { id: 4, name: 'Monitor 24"', price: 3500, stock: 8, image: 'monitor.jpg' },
  { id: 5, name: 'Audífonos Bluetooth', price: 800, stock: 12, image: 'headphones.jpg' }
];

let cart = [];
let nextOrderId = 1;
let orders = [];

// Rutas

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Obtener todos los productos
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    products: products
  });
});

// API: Obtener un producto específico
app.get('/api/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado'
    });
  }
  
  res.json({
    success: true,
    product: product
  });
});

// API: Agregar producto al carrito
app.post('/api/cart/add', (req, res) => {
  const { productId, quantity } = req.body;
  
  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos'
    });
  }
  
  const product = products.find(p => p.id === parseInt(productId));
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado'
    });
  }
  
  if (product.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: 'Stock insuficiente'
    });
  }
  
  // Verificar si el producto ya está en el carrito
  const existingItem = cart.find(item => item.productId === parseInt(productId));
  
  if (existingItem) {
    existingItem.quantity += parseInt(quantity);
  } else {
    cart.push({
      productId: parseInt(productId),
      name: product.name,
      price: product.price,
      quantity: parseInt(quantity)
    });
  }
  
  res.json({
    success: true,
    message: 'Producto agregado al carrito',
    cartCount: cart.reduce((total, item) => total + item.quantity, 0)
  });
});

// API: Obtener carrito
app.get('/api/cart', (req, res) => {
  const cartWithTotals = cart.map(item => ({
    ...item,
    total: item.price * item.quantity
  }));
  
  const grandTotal = cartWithTotals.reduce((total, item) => total + item.total, 0);
  
  res.json({
    success: true,
    cart: cartWithTotals,
    grandTotal: grandTotal,
    itemCount: cart.length
  });
});

// API: Eliminar producto del carrito
app.delete('/api/cart/:productId', (req, res) => {
  const productId = parseInt(req.params.productId);
  const itemIndex = cart.findIndex(item => item.productId === productId);
  
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Producto no encontrado en el carrito'
    });
  }
  
  cart.splice(itemIndex, 1);
  
  res.json({
    success: true,
    message: 'Producto eliminado del carrito',
    cartCount: cart.reduce((total, item) => total + item.quantity, 0)
  });
});

// API: Procesar orden
app.post('/api/order', (req, res) => {
  const { customerName, customerEmail } = req.body;
  
  if (!customerName || !customerEmail || cart.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Datos incompletos o carrito vacío'
    });
  }
  
  // Verificar stock disponible
  for (let item of cart) {
    const product = products.find(p => p.id === item.productId);
    if (product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente para ${product.name}`
      });
    }
  }
  
  // Actualizar stock
  cart.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    product.stock -= item.quantity;
  });
  
  // Crear orden
  const order = {
    id: nextOrderId++,
    customerName,
    customerEmail,
    items: [...cart],
    total: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
    date: new Date().toISOString(),
    status: 'confirmada'
  };
  
  orders.push(order);
  
  // Limpiar carrito
  cart = [];
  
  res.json({
    success: true,
    message: 'Orden procesada exitosamente',
    orderId: order.id,
    order: order
  });
});

// API: Obtener órdenes
app.get('/api/orders', (req, res) => {
  res.json({
    success: true,
    orders: orders
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Archivos estáticos servidos desde: ${path.join(__dirname, 'public')}`);
  console.log('📊 Datos de ejemplo cargados:');
  console.log(`   - ${products.length} productos disponibles`);
  console.log('🛒 API endpoints disponibles:');
  console.log('   - GET  /api/products - Listar productos');
  console.log('   - POST /api/cart/add - Agregar al carrito');
  console.log('   - GET  /api/cart - Ver carrito');
  console.log('   - POST /api/order - Procesar orden');
});

module.exports = app;