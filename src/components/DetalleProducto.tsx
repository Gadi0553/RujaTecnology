import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from "../ApiClient";

interface Producto {
    productoId: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    imagenURL: string;
    cantidad?: number;
}

const DetalleProducto = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [producto, setProducto] = useState<Producto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

    const fetchProducto = async () => {
        if (!id) {
            setError('Producto no encontrado');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');

            const headers: { [key: string]: string } = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await apiClient.get(`/api/Productos/${id}`, {
                headers: headers
            });

            setProducto(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducto();
    }, [id]);

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

    const getImageUrl = (imageName: string) => {
        return `https://localhost:7191/Uploads/${imageName}`;
    };

    const handleImageClick = (index: number) => {
        setCurrentImageIndex(index);
    };

    const getWhatsAppLink = () => {
        if (!producto) return '';

        const formattedPrice = new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP'
        }).format(producto.precio);

        const mensaje =
            `¡Hola! 👋\n\n` +
            `Me interesa este producto:\n` +
            `*${producto.nombre}*\n` +
            `💰 Precio: ${formattedPrice}\n\n`;

        const whatsappNumber = "1-809-478-4211";
        const cleanNumber = whatsappNumber.replace(/\D/g, '');

        return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(mensaje)}`;
    };

    if (isLoading) {
        return <div className="flex justify-center p-4">Cargando producto...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    if (!producto) {
        return <div className="text-red-500 p-4">Producto no encontrado</div>;
    }

    const imageUrls = producto.imagenURL ? producto.imagenURL.split(',') : [];

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col lg:flex-row bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                <div className="lg:w-1/2 p-4">
                    <div className="relative w-full h-96 bg-gray-100 mb-4">
                        <img
                            src={getImageUrl(imageUrls[currentImageIndex])}
                            alt={`Imagen principal ${currentImageIndex + 1}`}
                            className="w-full h-full object-contain rounded"
                        />
                    </div>

                    <div className="flex space-x-2 justify-center">
                        {imageUrls.map((url, index) => (
                            <img
                                key={index}
                                src={getImageUrl(url)}
                                alt={`Miniatura ${index + 1}`}
                                className={`w-16 h-16 object-cover cursor-pointer rounded border ${index === currentImageIndex ? 'border-blue-500' : 'border-gray-300'}`}
                                onClick={() => handleImageClick(index)}
                            />
                        ))}
                    </div>
                </div>

                <div className="lg:w-1/2 p-4">
                    <h2 className="text-3xl font-semibold mb-2">{producto.nombre}</h2>
                    <p className="text-lg text-gray-600 mb-4">{producto.descripcion}</p>
                    <div className="text-xl font-bold text-gray-800 mb-2">
                        {new Intl.NumberFormat('es-DO', {style: 'currency', currency: 'DOP'}).format(producto.precio)}
                    </div>

                    <div className="text-sm text-gray-500 mb-4">Stock: {producto.stock}</div>

                    <div className="flex flex-col lg:flex-row lg:space-x-4 mb-4">
                        <a
                            href={getWhatsAppLink()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors w-full lg:w-auto mb-2 lg:mb-0"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-6 h-6 mr-2"
                            >
                                <path
                                    d="M12 2C6.486 2 2 6.486 2 12c0 1.959.508 3.894 1.471 5.572L2 22l4.468-1.442C8.136 21.492 10.066 22 12 22c5.514 0 10-4.486 10-10S17.514 2 12 2zm0 18c-1.792 0-3.557-.48-5.099-1.38l-.369-.219-2.684.866.888-2.592-.24-.393C4.452 15.33 4 13.678 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"
                                />
                                <path
                                    d="M16.163 13.518c-.25-.125-1.479-.729-1.708-.812-.229-.083-.396-.125-.563.125-.167.25-.646.812-.792.979-.146.167-.292.188-.542.063-.25-.125-1.053-.387-2.006-1.232-.74-.626-1.24-1.397-1.386-1.646-.146-.25-.016-.396.109-.521.112-.112.25-.292.375-.438.125-.146.167-.25.25-.417.083-.167.042-.313-.021-.438-.063-.125-.563-1.354-.771-1.854-.2-.479-.404-.417-.563-.417h-.458c-.146 0-.375.063-.563.313s-.729.729-.729 1.771c0 1.042.75 2.052.854 2.188.104.125 1.479 2.313 3.563 3.243.5.208.896.333 1.204.438.505.161.963.138 1.328.083.406-.063 1.25-.513 1.429-1.01.179-.5.179-.938.125-1.01-.054-.063-.208-.104-.458-.229z"
                                />
                            </svg>
                            Comprar por WhatsApp
                        </a>

                        <button
                            onClick={(e) => handleAddToCart(e, producto)}
                            className="flex items-center justify-center bg-amber-400 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors w-full lg:w-auto"
                        >
                            <ShoppingCart className="w-5 h-5 mr-2"/>
                            Añadir al carrito
                        </button>
                    </div>

                    <button
                        onClick={() => navigate('/catalogo')}
                        className="text-blue-500 underline hover:text-blue-700"
                    >
                        Volver a la lista de productos
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetalleProducto;
