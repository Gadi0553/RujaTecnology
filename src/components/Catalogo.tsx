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
    const [filterText, setFilterText] = useState<string>(searchQuery);

    const handleProductClick = (productoId: number) => {
        navigate(`/producto/${productoId}`);
    };

    const fetchProductos = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get('api/Productos');


            setProductos(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    };

    const getImageUrl = (imageName: string) => {
        return `${config.apiurl}/Uploads/${imageName}`;
    };

    const getCartKey = () => {
        const userId = localStorage.getItem('userId');
        return userId ? `carrito_${userId}` : 'carrito_invitado';
    };

    const handleAddToCart = (e: React.MouseEvent, producto: Producto) => {
        e.stopPropagation(); // Prevent navigation when clicking the add to cart button

        const carritoKey = getCartKey();
        const carritoGuardado = localStorage.getItem(carritoKey);
        let carrito: Producto[] = [];

        if (carritoGuardado) {
            carrito = JSON.parse(carritoGuardado);
            const productoExistente = carrito.find(p => p.productoId === producto.productoId);

            if (productoExistente) {
                if (productoExistente.cantidad && productoExistente.cantidad < producto.stock) {
                    productoExistente.cantidad += 1;
                } else {
                    alert("No hay más stock disponible de este producto");
                    return;
                }
            } else {
                carrito.push({ ...producto, cantidad: 1 });
            }
        } else {
            carrito = [{ ...producto, cantidad: 1 }];
        }

        localStorage.setItem(carritoKey, JSON.stringify(carrito));
        alert("Producto agregado al carrito exitosamente");
        navigate('/carrito');
    };

    useEffect(() => {
        fetchProductos();
    }, []);

    useEffect(() => {
        setFilterText(searchQuery);
    }, [searchQuery]);

    useEffect(() => {
        const filtered = productos.filter((producto) =>
            producto.nombre.toLowerCase().includes(filterText.toLowerCase())
        );
        setFilteredProductos(filtered);
    }, [filterText, productos]);

    if (isLoading) {
        return <div className="flex justify-center p-4">Cargando productos...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto px-2 sm:px-4 mt-4">
            {/* Barra de búsqueda móvil */}
            <div className="flex items-center bg-gray-100 rounded-lg p-2 m-2 sm:hidden border-2 border-orange-400">
                <i className="fas fa-search text-gray-400 mr-2"></i>
                <input
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Buscar productos..."
                    className="w-full bg-transparent focus:outline-none text-lg rounded-md py-2 px-4"
                />
            </div>

            {/* Grid de productos */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6 mb-8">
                {filteredProductos.length === 0 ? (
                    <div className="col-span-full text-center text-lg text-red-500">
                        El producto no existe
                    </div>
                ) : (
                    filteredProductos.map((producto) => {
                        const mainImage = producto.imagenURL ? producto.imagenURL.split(',')[0] : '';

                        return (
                            <div
                                key={producto.productoId}
                                className="bg-white sm:rounded-lg sm:shadow-lg overflow-hidden border-b sm:border border-gray-200 transform transition-all duration-300 hover:shadow-md cursor-pointer flex flex-col h-full"
                                onClick={() => handleProductClick(producto.productoId)}
                            >
                                {/* Imagen del producto */}
                                <div className="relative w-full aspect-square sm:h-48 flex-shrink-0">
                                    <img
                                        src={getImageUrl(mainImage)}
                                        alt={producto.nombre}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = 'https://via.placeholder.com/400x300?text=Producto';
                                            target.className = target.className + ' opacity-50';
                                        }}
                                    />
                                </div>

                                {/* Contenedor de información y botón */}
                                <div className="p-2 sm:p-4 flex flex-col flex-grow">
                                    {/* Contenedor de información */}
                                    <div className="flex-grow">
                                        {/* Nombre del producto */}
                                        <h2 className="text-sm sm:text-xl font-medium line-clamp-2 mb-1">
                                            {producto.nombre}
                                        </h2>

                                        {/* Precio */}
                                        <div className="text-lg font-bold text-black">
                                            {new Intl.NumberFormat('es-DO', {
                                                style: 'currency',
                                                currency: 'DOP',
                                            }).format(producto.precio)}
                                        </div>

                                        {/* Stock */}
                                        <div className="mt-1 space-y-1">
                                            <p className="text-xs text-gray-500">
                                                {producto.stock > 0 ? (
                                                    <span className="text-green-600">
                                                        <i className="fas fa-check-circle mr-1"></i>
                                                        En stock ({producto.stock})
                                                    </span>
                                                ) : (
                                                    <span className="text-red-600">
                                                        <i className="fas fa-times-circle mr-1"></i>
                                                        Agotado
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Botón fijo en la parte inferior */}
                                    <button
                                        onClick={(e) => handleAddToCart(e, producto)}
                                        disabled={producto.stock === 0}
                                        className={`mt-2 w-full text-sm font-medium py-1 px-3 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 
                                            ${producto.stock === 0
                                            ? 'bg-gray-300 cursor-not-allowed'
                                            : 'bg-yellow-400 hover:bg-yellow-500'
                                        }`}
                                    >
                                        {producto.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Catalogo;