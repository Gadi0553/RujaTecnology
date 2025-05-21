import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from "../ApiClient";
import config from "../Config.ts";

// Interfaces
interface Producto {
    productoId: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    imagenURL: string;
    categoriaId: number;
}

interface Categoria {
    categoriaId: number;
    nombre: string;
    descripcion: string;
}

const Productos = () => {
    const navigate = useNavigate();

    // Estados principales
    const [productos, setProductos] = useState<Producto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados para imágenes
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);

    // Estados para formularios
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: '',
        descripcion: '',
        precio: '' as string | number,
        stock: '' as string | number,
        imagen: null as File | null,
        categoriaId: 0,
    });

    const [nuevaCategoria, setNuevaCategoria] = useState({
        nombre: '',
        descripcion: '',
    });

    // Estados UI
    const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false);
    const [editingProductoId, setEditingProductoId] = useState<number | null>(null);
    const [editStock, setEditStock] = useState<number | null>(null);

    // Funciones de navegación
    const handleProductClick = (productoId: number) => {
        navigate(`/producto/${productoId}`);
    };

    // Funciones de carga de datos
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

    const fetchCategorias = async () => {
        try {
            const response = await apiClient.get('/api/Categorias');
            setCategorias(response.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        }
    };

    // Funciones auxiliares
    const getImageUrl = (imageName: string) => {
        return `${config.apiurl}/Uploads/${imageName}`;
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP',
        }).format(price);
    };

    // Funciones de manejo de formularios - Productos
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'precio' || name === 'stock') {
            // Si el usuario está escribiendo en un campo numérico y el valor actual es 0, reemplazarlo
            if (nuevoProducto[name] === 0 || nuevoProducto[name] === '0') {
                setNuevoProducto(prev => ({
                    ...prev,
                    [name]: value.replace(/^0+/, '')
                }));
            } else {
                setNuevoProducto(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
        } else if (name === 'categoriaId') {
            setNuevoProducto(prev => ({
                ...prev,
                [name]: Number(value)
            }));
        } else {
            setNuevoProducto(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedImages.length === 0) {
            setError('Por favor, seleccione al menos una imagen.');
            return;
        }

        if (nuevoProducto.categoriaId === 0) {
            setError('Por favor, seleccione una categoría.');
            return;
        }

        try {
            const imageNames = [];
            // Subir todas las imágenes
            for (const file of selectedImages) {
                const formData = new FormData();
                formData.append('file', file);
                const imageResponse = await apiClient.post('/api/Files', formData);
                imageNames.push(imageResponse.data.fileName);
            }

            const producto = {
                nombre: nuevoProducto.nombre,
                descripcion: nuevoProducto.descripcion,
                precio: Number(nuevoProducto.precio),
                stock: Number(nuevoProducto.stock),
                imagenURL: imageNames.join(','), // Unir nombres de archivos con comas
                categoriaId: nuevoProducto.categoriaId
            };

            const productResponse = await apiClient.post('/api/Productos', producto);
            console.log(productResponse.data);

            // Limpiar las URLs de vista previa
            previewImages.forEach(url => URL.revokeObjectURL(url));

            fetchProductos();
            setNuevoProducto({
                nombre: '',
                descripcion: '',
                precio: '',
                stock: '',
                imagen: null,
                categoriaId: 0,
            });
            setSelectedImages([]);
            setPreviewImages([]);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        }
    };

    const handleReset = () => {
        setNuevoProducto({
            nombre: '',
            descripcion: '',
            precio: '',
            stock: '',
            imagen: null,
            categoriaId: 0,
        });
        if (previewImages.length > 0) {
            previewImages.forEach(url => URL.revokeObjectURL(url));
        }
        setSelectedImages([]);
        setPreviewImages([]);
        setError(null);
    };

    // Funciones de manejo de imágenes
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

    // Funciones de manejo de stock
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
            formData.append('categoriaId', productoActual.categoriaId.toString());

            // Si hay una URL de imagen existente, mantenerla
            if (productoActual.imagenURL) {
                formData.append('imagenURL', productoActual.imagenURL);
            }

            const response = await apiClient.put(`/api/Productos/${editingProductoId}`, formData);
            console.log(response.data);

            await fetchProductos();
            setEditingProductoId(null);
            setEditStock(null);

        } catch (err) {
            console.error('Error detallado:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        }
    };

    // Funciones de manejo de eliminación
    const handleDelete = async (productoId: number) => {
        try {
            const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este producto?');
            if (!confirmDelete) return;

            const response = await apiClient.delete(`/api/Productos/${productoId}`);
            console.log(response.data);

            fetchProductos();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        }
    };

    // Funciones de manejo de formularios - Categorías
    const handleCategoriaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNuevaCategoria((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCategoriaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await apiClient.post('/api/Categorias', nuevaCategoria);
            console.log(response.data);

            // Refrescar la lista de categorías
            fetchCategorias();

            // Limpiar el formulario
            setNuevaCategoria({
                nombre: '',
                descripcion: '',
            });

            // Mostrar mensaje de éxito
            setError('Categoría agregada con éxito');
            setTimeout(() => setError(null), 3000);

            // Ocultar el formulario después de agregar
            setMostrarFormCategoria(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        }
    };

    const handleCategoriaReset = () => {
        setNuevaCategoria({
            nombre: '',
            descripcion: '',
        });
        setError(null);
    };

    // Efectos
    useEffect(() => {
        fetchProductos();
        fetchCategorias();
    }, []);

    // Renderizado condicional para estados de carga
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-lg">Cargando productos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            {/* Mensaje de error o éxito */}
            {error && (
                <div className={`p-4 mb-6 rounded-lg ${error.includes('éxito') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {error}
                </div>
            )}

            {/* Botón para mostrar/ocultar formulario de categoría */}
            <div className="mb-6">
                <button
                    onClick={() => setMostrarFormCategoria(!mostrarFormCategoria)}
                    className={`${mostrarFormCategoria ? 'bg-gray-600' : 'bg-green-600'} text-white p-3 rounded-lg hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-medium flex items-center`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {mostrarFormCategoria ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        )}
                    </svg>
                    {mostrarFormCategoria ? 'Ocultar Formulario de Categoría' : 'Agregar Nueva Categoría'}
                </button>
            </div>

            {/* Formulario para agregar categoría */}
            {mostrarFormCategoria && (
                <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-8 border border-gray-200 transition-all duration-300">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Agregar Categoría</h2>
                    <form onSubmit={handleCategoriaSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Nombre de la Categoría</label>
                            <input
                                type="text"
                                name="nombre"
                                value={nuevaCategoria.nombre}
                                onChange={handleCategoriaChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Ingrese el nombre de la categoría"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Descripción</label>
                            <textarea
                                name="descripcion"
                                value={nuevaCategoria.descripcion}
                                onChange={handleCategoriaChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                rows={3}
                                placeholder="Ingrese una descripción para la categoría"
                                required
                            />
                        </div>
                        <div className="flex space-x-4 pt-2">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium"
                            >
                                Guardar Categoría
                            </button>
                            <button
                                type="button"
                                onClick={handleCategoriaReset}
                                className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 font-medium"
                            >
                                Limpiar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Formulario para agregar producto */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Agregar Producto</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Nombre</label>
                            <input
                                type="text"
                                name="nombre"
                                value={nuevoProducto.nombre}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Nombre del producto"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Categoría</label>
                            <select
                                name="categoriaId"
                                value={nuevoProducto.categoriaId}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                                required
                            >
                                <option value={0}>Seleccionar categoría</option>
                                {categorias.map((categoria) => (
                                    <option key={categoria.categoriaId} value={categoria.categoriaId}>
                                        {categoria.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Descripción</label>
                        <textarea
                            name="descripcion"
                            value={nuevoProducto.descripcion}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            rows={3}
                            placeholder="Descripción detallada del producto"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Precio</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500">RD$</span>
                                <input
                                    type="number"
                                    name="precio"
                                    value={nuevoProducto.precio}
                                    onChange={handleChange}
                                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    required
                                    onFocus={(e) => {
                                        if (e.target.value === '0' || e.target.value === '') {
                                            setNuevoProducto(prev => ({...prev, precio: ''}));
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Stock</label>
                            <input
                                type="number"
                                name="stock"
                                value={nuevoProducto.stock}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Cantidad disponible"
                                min="0"
                                required
                                onFocus={(e) => {
                                    if (e.target.value === '0' || e.target.value === '') {
                                        setNuevoProducto(prev => ({...prev, stock: ''}));
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Imágenes del producto (máximo 4)</label>
                        <input
                            type="file"
                            onChange={handleImageChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            accept="image/*"
                            multiple
                        />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                            {previewImages.map((preview, index) => (
                                <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200 h-32">
                                    <img
                                        src={preview}
                                        alt={`Vista previa ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors focus:outline-none"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex space-x-4 pt-2">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium"
                        >
                            Agregar Producto
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 font-medium"
                        >
                            Limpiar Formulario
                        </button>
                    </div>
                </form>
            </div>

            {/* Lista de productos disponibles */}
            <h1 className="text-2xl font-bold my-6 text-gray-800 border-b pb-2">Productos Disponibles</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productos.length === 0 ? (
                    <div className="col-span-3 text-center py-12 text-gray-500">
                        No hay productos disponibles. Agrega tu primer producto.
                    </div>
                ) : (
                    productos.map((producto) => {
                        const mainImage = producto.imagenURL ? producto.imagenURL.split(',')[0] : '';
                        const categoriaName = categorias.find(c => c.categoriaId === producto.categoriaId)?.nombre || 'Sin categoría';

                        return (
                            <div
                                key={producto.productoId}
                                className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                                onClick={() => handleProductClick(producto.productoId)}
                            >
                                <div className="p-4 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-800">{producto.nombre}</h2>
                                    <span className="text-sm text-blue-600 font-medium">{categoriaName}</span>
                                </div>
                                <div className="p-4">
                                    {mainImage && (
                                        <div className="relative w-full h-48 bg-gray-100 mb-4 rounded">
                                            <img
                                                src={getImageUrl(mainImage)}
                                                alt={producto.nombre}
                                                className="w-full h-full object-contain rounded"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.onerror = null;
                                                    target.src = 'https://via.placeholder.com/400x300?text=Producto';
                                                    target.className = target.className + ' opacity-50';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-lg font-semibold text-gray-800">{formatPrice(producto.precio)}</span>
                                        <span className={`text-sm px-3 py-1 rounded-full ${producto.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            Stock: {producto.stock}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditStock(producto.productoId, producto.stock);
                                            }}
                                            className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 text-sm font-medium"
                                        >
                                            Editar Stock
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(producto.productoId);
                                            }}
                                            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm font-medium"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal para editar stock */}
            {editingProductoId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-w-full mx-4">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Editar Stock</h2>
                        <div className="my-4">
                            <label className="block text-gray-700 font-medium mb-2">Nuevo Stock</label>
                            <input
                                type="number"
                                value={editStock || ''}
                                onChange={(e) => setEditStock(Number(e.target.value))}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                min="0"
                                placeholder="Ingrese la nueva cantidad"
                            />
                        </div>
                        <div className="flex space-x-4 pt-2">
                            <button
                                onClick={handleUpdateStock}
                                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium"
                            >
                                Actualizar
                            </button>
                            <button
                                onClick={() => setEditingProductoId(null)}
                                className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 font-medium"
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