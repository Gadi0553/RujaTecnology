import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiClient from "../ApiClient";

interface User {
    userId: string;
    email: string;
    roles: string[];
}

const Usuarios = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async (page: number) => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/api/Register/all-users-with-roles`, {
                params: {
                    page,
                    pageSize: 10,
                },
            });

            setUsers(response.data.items);
            setTotalPages(response.data.totalPages);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setLoading(false);
        }
    };

    // Lógica para eliminar un usuario
    const handleDelete = async (userId: string) => {
        try {
            const confirmed = window.confirm('¿Estás seguro de que quieres eliminar este usuario?');
            if (confirmed) {
                await apiClient.delete(`/api/Register/delete-user/${userId}`);
                // Refrescar la lista de usuarios después de eliminar
                fetchUsers(page);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Hubo un error al eliminar el usuario.');
        }
    };

    // Lógica para cambiar el rol de un usuario
    const handleChangeRole = async (userId: string) => {
        const newRole = prompt('Ingresa el nuevo rol (Admin, Writer):');
        if (newRole) {
            try {
                await apiClient.put(`/api/Register/change-role/${userId}`, { role: newRole });
                // Refrescar la lista de usuarios después de cambiar el rol
                fetchUsers(page);
            } catch (error) {
                console.error('Error changing user role:', error);
                alert('Hubo un error al cambiar el rol del usuario.');
            }
        }
    };

    useEffect(() => {
        fetchUsers(page);
    }, [page]);

    const handlePageChange = (newPage: number) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center text-orange-600 mb-6">Usuarios</h1>

                {loading ? (
                    <div className="text-center text-gray-600">Cargando...</div>
                ) : (
                    <div>
                        <ul className="space-y-4">
                            {users.map((user) => (
                                <li key={user.userId} className="bg-orange-100 p-4 rounded-lg shadow-md">
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="text-lg font-medium text-gray-800">{user.email}</p>
                                            <p className="text-sm text-gray-500">Roles: {user.roles.join(', ')}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleChangeRole(user.userId)}
                                                className="bg-orange-600 text-white py-1 px-3 rounded-md hover:bg-orange-700 focus:outline-none"
                                            >
                                                Cambiar Rol
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.userId)}
                                                className="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 focus:outline-none"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="flex justify-between items-center mt-6">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none disabled:bg-gray-300"
                            >
                                Anterior
                            </button>

                            <span className="text-lg font-medium text-gray-700">
                Página {page} de {totalPages}
              </span>

                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className="bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none disabled:bg-gray-300"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Usuarios;
