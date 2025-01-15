import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from "../ApiClient";
import {Simulate} from "react-dom/test-utils";
import reset = Simulate.reset;
import config from "../Config.ts";

interface Producto {
    productoId: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    imagenURL: string;
}

const Productos = () => {
    const navigate = useNavigate();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: '',
        descripcion: '',
        precio: 0,
        stock: 0,
        imagen: null as File | null,
    });

    const [editingProductoId, setEditingProductoId] = useState<number | null>(null);
    const [editStock, setEditStock] = useState<number | null>(null);

    const handleProductClick = (productoId: number) => {
        navigate(`/producto/${productoId}`);
    };

    const fetchProductos = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get('/api/Productos');


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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNuevoProducto((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + selectedImages.length > 4) {
            setError('Solo puedes seleccionar hasta 4 imágenes.');
            return;
        }

        const newSelectedImages = [...selectedImages, ...files];
        const newPreviewImages = [
            ...previewImages,
            ...files.map(file => URL.createObjectURL(file))
        ];

        setSelectedImages(newSelectedImages.slice(0, 4));
        setPreviewImages(newPreviewImages.slice(0, 4));
    };


    const removeImage = (index: number) => {
        URL.revokeObjectURL(previewImages[index]);
        setSelectedImages(selectedImages.filter((_, i) => i !== index));
        setPreviewImages(previewImages.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedImages.length === 0) {
            setError('Por favor, seleccione al menos una imagen.');
            return;
        }

        try {
            const imageNames = [];
            // Subir todas las imágenes
            for (const file of selectedImages) {
                const formData = new FormData();
                formData.append('file', file);
                const imageResponse = await apiClient.post('/api/Files', formData)

                imageNames.push(imageResponse.data.fileName);
            }

            const producto = {
                nombre: nuevoProducto.nombre,
                descripcion: nuevoProducto.descripcion,
                precio: nuevoProducto.precio,
                stock: nuevoProducto.stock,
                imagenURL: imageNames.join(','), // Unir nombres de archivos con comas
            };

            const productResponse = await apiClient.post('/api/Productos', producto)

          console.log(productResponse.data);

            // Limpiar las URLs de vista previa
            previewImages.forEach(url => URL.revokeObjectURL(url));

            fetchProductos();
            setNuevoProducto({
                nombre: '',
                descripcion: '',
                precio: 0,
                stock: 0,
                imagen: null,
            });
            setSelectedImages([]);
            setPreviewImages([]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        }
    };

    const handleReset = () => {
        setNuevoProducto({
            nombre: '',
            descripcion: '',
            precio: 0,
            stock: 0,
            imagen: null,
        });
        if (previewImages[0]) {
            URL.revokeObjectURL(previewImages[0]);
        }
        setSelectedImages([]);
        setPreviewImages([]);
        setError(null);
    };

    const handleDelete = async (productoId: number) => {
        try {
            const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este producto?');
            if (!confirmDelete) return;

            const response = await apiClient.delete(`/api/Productos/${productoId}` )

          console.log(response.data);

            fetchProductos();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        }
    };

    const handleEditStock = (productoId: number, currentStock: number) => {
        setEditingProductoId(productoId);
        setEditStock(currentStock);
    };

    const handleUpdateStock = async () => {
        if (editStock === null || editingProductoId === null) return;

        try {
            const productoActual = productos.find(p => p.productoId === editingProductoId);
            if (!productoActual) return;

            // Crear FormData con todos los campos necesarios
            const formData = new FormData();
            formData.append('productoId', editingProductoId.toString());
            formData.append('nombre', productoActual.nombre);
            formData.append('descripcion', productoActual.descripcion);
            formData.append('precio', productoActual.precio.toString());
            formData.append('stock', editStock.toString());

            // Si hay una URL de imagen existente, mantenerla
            if (productoActual.imagenURL) {
                formData.append('imagenURL', productoActual.imagenURL);
            }

            const response = await apiClient.put(`/api/Productos/${editingProductoId}`, formData )

            console.log(response.data)

            await fetchProductos();
            setEditingProductoId(null);
            setEditStock(null);


        } catch (err) {
            console.error('Error detallado:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        }
    };


    React.useEffect(() => {
        fetchProductos();
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
        }).format(price);
    };

    if (isLoading) {
        return <div className="flex justify-center p-4">Cargando productos...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    return (
        <div className="container mx-auto p-4">
            {/* Formulario para agregar producto */}
            <h2 className="text-2xl font-bold mt-8 mb-4">Agregar Producto</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block">Nombre</label>
                    <input
                        type="text"
                        name="nombre"
                        value={nuevoProducto.nombre}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block">Descripción</label>
                    <input
                        type="text"
                        name="descripcion"
                        value={nuevoProducto.descripcion}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block">Precio</label>
                    <input
                        type="number"
                        name="precio"
                        value={nuevoProducto.precio}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block">Stock</label>
                    <input
                        type="number"
                        name="stock"
                        value={nuevoProducto.stock}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                    />
                </div>
                <div>
                    <label className="block">Imágenes del producto (máximo 4)</label>
                    <input
                        type="file"
                        onChange={handleImageChange}
                        className="w-full p-2 border border-gray-300 rounded"
                        accept="image/*"
                        multiple
                    />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {previewImages.map((preview, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover rounded"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <div className="flex space-x-4">
                    <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                        Agregar Producto
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="bg-gray-500 text-white p-2 rounded"
                    >
                        Limpiar Formulario
                    </button>
                </div>
            </form>

            {/* Lista de productos disponibles */}
            <h1 className="text-2xl font-bold my-6">Productos Disponibles</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productos.map((producto) => {
                    const mainImage = producto.imagenURL ? producto.imagenURL.split(',')[0] : '';

                    return (
                        <div
                            key={producto.productoId}
                            className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                            onClick={() => handleProductClick(producto.productoId)}
                        >
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="text-xl font-semibold">{producto.nombre}</h2>
                            </div>
                            <div className="p-4">
                                {mainImage && (
                                    <div className="relative w-full h-48 bg-gray-100 mb-4 rounded">
                                        <img
                                            src={getImageUrl(mainImage)}
                                            alt={producto.nombre}
                                            className="w-full h-full object-contain rounded" // Cambié object-cover por object-contain
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null;
                                                target.src = 'https://via.placeholder.com/400x300?text=Producto';
                                                target.className = target.className + ' opacity-50';
                                            }}
                                        />

                                    </div>
                                )}
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-lg font-semibold">{formatPrice(producto.precio)}</span>
                                    <span className="text-sm text-gray-500">Stock: {producto.stock}</span>
                                </div>
                                <div className="flex justify-between">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditStock(producto.productoId, producto.stock);
                                        }}
                                        className="bg-yellow-500 text-white p-2 rounded"
                                    >
                                        Editar Stock
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(producto.productoId);
                                        }}
                                        className="bg-red-500 text-white p-2 rounded"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal para editar stock */}
            {editingProductoId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded shadow-lg w-96">
                        <h2 className="text-xl font-bold">Editar Stock</h2>
                        <div className="my-4">
                            <label className="block">Nuevo Stock</label>
                            <input
                                type="number"
                                value={editStock || ''}
                                onChange={(e) => setEditStock(Number(e.target.value))}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={handleUpdateStock}
                                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
                            >
                                Actualizar
                            </button>
                            <button
                                onClick={() => setEditingProductoId(null)}
                                className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Productos;
