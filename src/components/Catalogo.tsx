import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from "../ApiClient";
import config from "../Config.ts";

interface Producto {
    productoId: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    imagenURL: string;
    cantidad?: number;
}

interface CatalogoProps {
    searchQuery: string;
}

const Catalogo: React.FC<CatalogoProps> = ({ searchQuery }) => {
    const navigate = useNavigate();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const handleProductClick = (productoId: number) => {
        navigate(`/producto/${productoId}`);
    };

    const getCartKey = () => {
        const userId = localStorage.getItem('userId');
        return userId ? `carrito_${userId}` : 'carrito_invitado';
    };

    const handleAddToCart = (e: React.MouseEvent, producto: Producto) => {
        e.stopPropagation();

        const carritoKey = getCartKey();
        const carritoGuardado = localStorage.getItem(carritoKey);
        let carrito: Producto[] = [];

        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado);
            const productoExistente = carrito.find(p => p.productoId === producto.productoId);

            if (productoExistente) {
                if (productoExistente.cantidad && productoExistente.cantidad < producto.stock) {
                    productoExistente.cantidad += 1;
                    setAlertMessage(`¡Genial! Has añadido otra unidad de ${producto.nombre} a tu carrito 🛍️`);
                } else {
                    setAlertMessage('Lo sentimos, no hay más unidades disponibles de este producto 😔');
                    setShowAlert(true);
                    return;
                }
            } else {
                carrito.push({ ...producto, cantidad: 1 });
                setAlertMessage(`¡Excelente elección! ${producto.nombre} ha sido añadido a tu carrito 🎉`);
            }
        } else {
            carrito = [{ ...producto, cantidad: 1 }];
            setAlertMessage(`¡Fantástico! ${producto.nombre} es el primer producto en tu carrito 🛒`);
        }

        localStorage.setItem(carritoKey, JSON.stringify(carrito));
        setShowAlert(true);
    };

    const fetchProductos = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get('api/Productos');
            setProductos(response.data);
            setFilteredProductos(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value.toLowerCase();
        const filtered = productos.filter(producto =>
            producto.nombre.toLowerCase().includes(query)
        );
        setFilteredProductos(filtered);
    };

    const getImageUrl = (imageName: string) => {
        return `${config.apiurl}/Uploads/${imageName}`;
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center p-4">Cargando productos...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    return (
        <>
            <div className="container mx-auto px-2 sm:px-4 mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6 mb-8">
                    {filteredProductos.length === 0 ? (
                        <div className="w-full text-center text-lg text-red-500">
                            No se encontraron productos.
                        </div>
                    ) : (
                        filteredProductos.map(producto => (
                            <div
                                key={producto.productoId}
                                className="bg-white sm:rounded-lg sm:shadow-lg overflow-hidden border-b sm:border border-gray-200 transform transition-all duration-300 hover:shadow-md cursor-pointer flex flex-col"
                                onClick={() => handleProductClick(producto.productoId)}
                            >
                                <div className="relative w-full aspect-square sm:h-48">
                                    <img
                                        src={getImageUrl(producto.imagenURL.split(',')[0])}
                                        alt={producto.nombre}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = 'https://via.placeholder.com/400x300?text=Producto';
                                            target.className += ' opacity-50';
                                        }}
                                    />
                                </div>
                                <div className="p-2 sm:p-4 flex flex-col flex-grow">
                                    <h2 className="text-sm sm:text-xl font-medium line-clamp-2 mb-1">
                                        {producto.nombre}
                                    </h2>
                                    <div className="text-lg font-bold text-black">
                                        {new Intl.NumberFormat('es-DO', {
                                            style: 'currency',
                                            currency: 'DOP',
                                        }).format(producto.precio)}
                                    </div>
                                    <div className="mt-1">
                                        <p className="text-xs text-gray-500">
                                            {producto.stock > 0 ? (
                                                <span className="text-green-600">
                                                En stock ({producto.stock})
                                            </span>
                                            ) : (
                                                <span className="text-red-600">Agotado</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="mt-auto">
                                        <button
                                            onClick={(e) => handleAddToCart(e, producto)}
                                            disabled={producto.stock === 0}
                                            className={`mt-2 w-full text-sm font-medium py-1 px-3 rounded-full focus:outline-none ${
                                                producto.stock === 0
                                                    ? 'bg-gray-300 cursor-not-allowed'
                                                    : 'bg-yellow-400 hover:bg-yellow-500'
                                            }`}
                                        >
                                            {producto.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full transform transition-all shadow-xl">
                        <div className="text-xl font-bold text-center mb-2">
                            ¡Producto Agregado!
                        </div>
                        <div className="text-center text-gray-600 mb-4">{alertMessage}</div>
                        <button
                            onClick={() => setShowAlert(false)}
                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-4 rounded-full transition-colors duration-200"
                        >
                            Continuar Comprando
                        </button>
                    </div>
                </div>
            )}
        </>
    );

};

export default Catalogo;

