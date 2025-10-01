Este proyecto está usando NodeJs

No se usa base de datos pero si se usa una de las muchas funciones de nodejs ya que permite ejecutar javascript del lado del
servidor

// Este MISMO código corre en el servidor
let carrito = [];
carrito.push({producto: "Laptop", precio: 15000});
// TODOS los usuarios lo comparten
// Persiste mientras el servidor está corriendo

A diferencia de si no usaramos NodeJs, en caso de por ejemplo, abrir la misma página en otras pestañas, no se estaría reflejando 
los cambios que se hacen, así en vez de que un solo usuario pueda ver los cambios, con el servidor de nodejs se puede
mostrar los cambios en todos los usuarios.

Otra diferencia es que la memoria ram que se está usando para el manejo de datos, es la del SERVIDOR, no la de el cliente.

Si se quisiera hacer más robusta la aplicación, si es necesario usar una base de datos ya que, como se muestra aqui, solo
persistirán los datos el tiempo que el servidor quede prendido, si se apaga y vuelve a prender, se reinician los datos, también 
con la implementación de una base de datos, no estaría limitado por la memoria ram, ya que como dije anteriormente, estos datos 
se guardan en la memoria ram del SERVIDOR

"
const express = require('express'); // ← Solo existe en Node.js
const app = express();

app.get('/api/products', (req, res) => {
  res.json(products); // ← Servidor web (gracias a Node.js)
});

app.listen(3001); // ← Escuchar peticiones HTTP (gracias a Node.js)

"

EN RESUMEN: -----------------------------------------------------------------------------------------------------------------
Node.js es lo que permite:

 Ejecutar ese JavaScript en un servidor
 Compartir esos datos entre múltiples usuarios
 Mantener los datos en RAM del servidor (no del cliente)
 Crear APIs y servidores web
 Acceder al sistema de archivos

