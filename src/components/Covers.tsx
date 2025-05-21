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

const Covers: React.FC = () => {
    const navigate = useNavigate();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
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
            const response = await apiClient.get('/api/Productos');

            const filtered = response.data
                ? response.data.filter((producto) =>
                    producto.nombre.toLowerCase().includes('cover') ||
                    producto.nombre.toLowerCase().includes('funda')
                )
                : [];
            setProductos(filtered);
            setFilteredProductos(filtered);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        // Filtrar productos cuando el usuario escriba algo
        const filtered = productos.filter((producto) =>
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

    useEffect(() => {
        // Vuelve a aplicar el filtro cada vez que los productos cambian o cuando cambia la búsqueda
        const filtered = productos.filter((producto) =>
            producto.nombre.toLowerCase().includes(searchQuery)
        );
        setFilteredProductos(filtered);
    }, [searchQuery, productos]);

    if (isLoading) {
        return <div className="flex justify-center p-4">Cargando covers...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    return (
        <>
            <div className="container mx-auto px-2 sm:px-4 mt-4">
                <div className="flex items-center bg-gray-100 rounded-lg p-2 m-2 sm:hidden border-2 border-orange-400">
                    <i className="fas fa-search text-gray-400 mr-2"></i>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Buscar productos..."
                        className="w-full bg-transparent focus:outline-none text-lg rounded-md py-2 px-4"
                    />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6 mb-8">
                    {filteredProductos.length === 0 ? (
                        <div className="w-full text-center text-lg text-red-500">
                            El producto no existe
                        </div>
                    ) : (
                        filteredProductos.map((producto) => {
                            const mainImage = producto.imagenURL ? producto.imagenURL.split(',')[0] : '';

                            return (
                                <div
                                    key={producto.productoId}
                                    className="bg-white sm:rounded-lg sm:shadow-lg overflow-hidden border-b sm:border border-gray-200 transform transition-all duration-300 hover:shadow-md cursor-pointer"
                                    onClick={() => handleProductClick(producto.productoId)}
                                >
                                    <div className="relative w-full aspect-square sm:h-48">
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

                                    <div className="p-2 sm:p-4">
                                        <h2 className="text-sm sm:text-xl font-medium line-clamp-2 mb-1">
                                            {producto.nombre}
                                        </h2>

                                        <div className="text-lg font-bold text-black">
                                            {new Intl.NumberFormat('es-DO', {
                                                style: 'currency',
                                                currency: 'DOP',
                                            }).format(producto.precio)}
                                        </div>

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

            {/* Modal personalizado */}
            {showAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full transform transition-all shadow-xl">
                        <div className="text-xl font-bold text-center mb-2">
                            ¡Producto Agregado!
                        </div>
                        <div className="text-center text-gray-600 mb-4">
                            {alertMessage}
                        </div>
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

export default Covers;
