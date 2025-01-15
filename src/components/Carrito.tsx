import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import apiClient from "../ApiClient";
import config from "../Config.ts";

interface Producto {
    productoId: number;
    nombre: string;
    precio: number;
    stock: number;
    imagenURL: string;
    cantidad: number;
}

interface Usuario {
    email: string;
    roles: string[];
    userId: string;
}

const Carrito = () => {
    const navigate = useNavigate();
    const [productosEnCarrito, setProductosEnCarrito] = useState<Producto[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState<Usuario | null>(null);

    useEffect(() => {
        // Intentar obtener usuario si está logueado
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const email = localStorage.getItem('userEmail');
        const roles = JSON.parse(localStorage.getItem('userRoles') || '[]');

        if (token && userId && email) {
            setUsuario({
                email,
                roles,
                userId
            });
            verificarUsuario(token);
        }

        // Cargar el carrito usando la clave correspondiente
        const carritoKey = userId ? `carrito_${userId}` : 'carrito_invitado';
        const carritoGuardado = localStorage.getItem(carritoKey);

        if (carritoGuardado) {
            const productos = JSON.parse(carritoGuardado);
            setProductosEnCarrito(productos);
            calcularTotal(productos);
        }

        setLoading(false);
    }, []);

    const verificarUsuario = async (token: string) => {
        try {
            const response = await apiClient.get(
                "api/Register/current-user",
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            if (response.status === 200) {
                const userData = response.data;
                setUsuario({
                    email: userData.email,
                    roles: userData.roles,
                    userId: userData.userId
                });
            }
        } catch (error) {
            console.error("Error al verificar usuario:", error);
        }
    };

    const guardarCarritoLocalmente = (productos: Producto[]) => {
        const carritoKey = usuario?.userId ? `carrito_${usuario.userId}` : 'carrito_invitado';
        localStorage.setItem(carritoKey, JSON.stringify(productos));
    };

    const calcularTotal = (productos: Producto[]) => {
        const totalCarrito = productos.reduce((acc, producto) =>
            acc + producto.precio * producto.cantidad, 0);
        setTotal(totalCarrito);
    };

    const eliminarProductoDelCarrito = (productoId: number) => {
        const carritoActualizado = productosEnCarrito.filter(
            producto => producto.productoId !== productoId
        );

        setProductosEnCarrito(carritoActualizado);
        calcularTotal(carritoActualizado);
        guardarCarritoLocalmente(carritoActualizado);
    };

    const manejarCantidad = (productoId: number, cantidad: number) => {
        const carritoActualizado = productosEnCarrito.map(producto => {
            if (producto.productoId === productoId) {
                if (cantidad <= producto.stock && cantidad >= 1) {
                    return { ...producto, cantidad };
                }
            }
            return producto;
        });

        setProductosEnCarrito(carritoActualizado);
        calcularTotal(carritoActualizado);
        guardarCarritoLocalmente(carritoActualizado);
    };

    const getImageUrls = (imageNames: string) => {
        return imageNames.split(',').map(imageName =>
            `${config.apiurl}/Uploads/${imageName}`);
    };

    const generarMensajeWhatsApp = (producto: Producto) => {
        const precioTotal = producto.precio * producto.cantidad;
        const userInfo = usuario ? `\nEmail: ${usuario.email}` : '\nCompra como invitado';
        return `Hola, estoy interesado en comprar ${producto.nombre}. Quiero comprar ${producto.cantidad} unidad(es) a ${producto.precio} cada una (total: ${precioTotal}).${userInfo}`;
    };

    const generarMensajePagoTotal = () => {
        const userInfo = usuario ? `\nEmail del comprador: ${usuario.email}` : '\nCompra como invitado';
        return `Hola, quiero comprar los siguientes productos: \n${
            productosEnCarrito
                .map(producto => `${producto.nombre}: ${producto.cantidad} unidad(es)`)
                .join('\n')
        }\nEl total es: $${total.toFixed(2)}.${userInfo}`;
    };

    const irADetalleProducto = (productoId: number) => {
        navigate(`/Producto/${productoId}`);
    };

    if (loading) {
        return <div className="container mx-auto p-6 text-center">Cargando...</div>;
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl">

            {productosEnCarrito.length === 0 ? (
                <div className="text-center text-lg text-gray-600">Tu carrito está vacío.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {productosEnCarrito.map((producto) => (
                        <div
                            key={producto.productoId}
                            className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-100 cursor-pointer"
                            onClick={() => irADetalleProducto(producto.productoId)}
                        >
                            <div className="flex items-start mb-4">
                                {producto.imagenURL && (
                                    <img
                                        src={getImageUrls(producto.imagenURL)[0]}
                                        alt={producto.nombre}
                                        className="w-24 h-24 object-contain mr-4 border rounded-md shadow-sm"
                                    />
                                )}
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-gray-800">
                                        {producto.nombre}
                                    </h3>
                                    <div className="text-lg font-bold text-gray-900 mt-3">
                                        {new Intl.NumberFormat('es-DO', {
                                            style: 'currency',
                                            currency: 'DOP'
                                        }).format(producto.precio)}
                                    </div>

                                    <div className="text-sm text-gray-600 mt-2">
                                        Stock disponible: {producto.stock}
                                    </div>

                                    <div className="mt-4 flex items-center">
                                        <input
                                            type="number"
                                            value={producto.cantidad}
                                            min="1"
                                            max={producto.stock}
                                            onChange={(e) => manejarCantidad(
                                                producto.productoId,
                                                parseInt(e.target.value)
                                            )}
                                            className="w-16 text-center bg-gray-100 border border-gray-300 rounded-md mx-2"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>

                                    <div className="flex justify-between mt-4">
                                        <a
                                            href={`https://wa.me/18094784211?text=${encodeURIComponent(
                                                generarMensajeWhatsApp(producto)
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <img
                                                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                                alt="WhatsApp"
                                                className="w-5 h-5 mr-2"
                                            />
                                            Comprar
                                        </a>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                eliminarProductoDelCarrito(producto.productoId);
                                            }}
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {productosEnCarrito.length > 0 && (
                <>
                    <div className="flex justify-between items-center mt-6 bg-gray-50 p-4 rounded-lg shadow-md">
                        <div className="text-xl font-semibold text-gray-800">Total:</div>
                        <div className="text-2xl font-bold text-gray-900">
                            {new Intl.NumberFormat('es-DO', {style: 'currency', currency: 'DOP'}).format(total)}
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <a
                            href={`https://wa.me/18094784211?text=${encodeURIComponent(
                                generarMensajePagoTotal()
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-semibold"
                        >
                            Pagar en WhatsApp
                        </a>
                    </div>
                </>
            )}
        </div>
    );
};

export default Carrito;