import { Router } from "express";
import { cartModel } from "../models/carts.models.js";
import { productModel } from "../models/products.models.js";

const cartRouter = Router();

// GET para obtener un carrito con productos completos (usando "populate")
cartRouter.get('/:cid', async (req, res) => {
    const { cid } = req.params;

    try {
        const cart = await cartModel.findById(cid).populate('products.product');

        if (cart) {
            res.status(200).send({ respuesta: 'OK', mensaje: cart });
        } else {
            res.status(404).send({ respuesta: 'Error en consultar Carrito', mensaje: 'Not Found' });
        }
    } catch (error) {
        res.status(400).send({ respuesta: 'Error en consulta carrito', mensaje: error });
    }
});


// POST para crear un carrito con productos iniciales
cartRouter.post('/', async (req, res) => {
    try {
        // Define los productos iniciales que deseas agregar al carrito
        const initialProducts = req.body.products; // Utiliza los productos del cuerpo de la solicitud

        // Crea un nuevo carrito con los productos iniciales
        const cart = await cartModel.create({ products: initialProducts });

        res.status(200).send({ respuesta: 'OK', mensaje: cart });
    } catch (error) {
        console.error('Error al crear el carrito:', error);
        res.status(500).send({ respuesta: 'Error en crear Carrito', mensaje: error.message });
    }
});


cartRouter.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body;

    try {
        // Busca el carrito por su ID
        const cart = await cartModel.findById(cid);

        if (cart) {
            // Reemplaza los productos actuales con los nuevos
            cart.products = products;

            // Guarda el carrito actualizado
            const updatedCart = await cart.save();
            res.status(200).send({ respuesta: 'OK', mensaje: updatedCart });
        } else {
            res.status(404).send({ respuesta: 'Error en actualizar carrito', mensaje: 'Cart Not Found' });
        }
    } catch (error) {
        console.error(error);
        res.status(400).send({ respuesta: 'Error en actualizar carrito', mensaje: error });
    }
});

// PUT para actualizar la cantidad de ejemplares de un producto en el carrito
cartRouter.put('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    try {
        const updatedCart = await cartModel.findByIdAndUpdate(
            cid,
            { $set: { "products.$[elem].quantity": quantity } },
            { new: true, arrayFilters: [{ "elem.product": pid }] }
        );

        if (updatedCart) {
            res.status(200).send({ respuesta: 'OK', mensaje: updatedCart });
        } else {
            res.status(404).send({ respuesta: 'Error en actualizar cantidad de producto Carrito', mensaje: 'Cart Not Found' });
        }
    } catch (error) {
        console.error(error);
        res.status(400).send({ respuesta: 'Error en actualizar cantidad de producto Carrito', mensaje: error });
    }
});



// DELETE para eliminar todos los productos del carrito
cartRouter.delete('/:cid', async (req, res) => {
    const { cid } = req.params;

    try {
        const cart = await cartModel.findById(cid);

        if (cart) {
            cart.products = [];
            const respuesta = await cartModel.findByIdAndUpdate(cid, cart);
            res.status(200).send({ respuesta: 'OK', mensaje: respuesta });
        } else {
            res.status(404).send({ respuesta: 'Error en eliminar productos del Carrito', mensaje: 'Cart Not Found' });
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({ respuesta: 'Error en eliminar productos del Carrito', mensaje: error });
    }
});

// DELETE para eliminar un producto específico del carrito
cartRouter.delete('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;

    try {
        const cart = await cartModel.findById(cid);

        if (cart) {
            cart.products = cart.products.filter(item => item.id_prod != pid);
            const respuesta = await cartModel.findByIdAndUpdate(cid, cart);
            res.status(200).send({ respuesta: 'OK', mensaje: respuesta });
        } else {
            res.status(404).send({ respuesta: 'Error en eliminar producto del Carrito', mensaje: 'Cart Not Found' });
        }
    } catch (error) {
        console.log(error);
        res.status(400).send({ respuesta: 'Error en eliminar producto del Carrito', mensaje: error });
    }
});


// Renderiza la vista HTML del carrito específico
cartRouter.get('/cart/:cid', async (req, res) => {
    const { cid } = req.params;

    try {
        const cart = await cartModel.findById(cid).populate('products.product');

        if (cart) {
            // Renderiza la vista 'cartSpecific.handlebars' con los datos del carrito
            res.render('cartSpecific', { cart }); // Asegúrate de tener acceso al objeto 'cart'
        } else {
            res.status(404).send({ respuesta: 'Error en consultar Carrito', mensaje: 'Not Found' });
        }
    } catch (error) {
        res.status(500).send('Error al cargar el carrito específico.');
    }
});


  
export default cartRouter;
