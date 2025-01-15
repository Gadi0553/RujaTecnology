import { useEffect, useState } from "react";

import apiClient from "../ApiClient";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("Usuario no autenticado");
                }

                const response = await apiClient.get("/api/Register/current-user", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(response.data);
            } catch (err) {
                setError(err.message || "Error al obtener los datos del usuario");
            }
        };

        fetchUserData();
    }, []);



    return (
        <div className="flex flex-col md:flex-row bg-gray-100 min-h-screen">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-[#232F3E] text-white p-6 md:h-screen">
                <h2 className="text-3xl font-bold mb-8">Ruja</h2>
                <ul>
                    <li><a href="/" className="text-yellow-400 hover:text-yellow-500 text-lg">Inicio</a></li>
                    <li><a href="/carrito" className="text-yellow-400 hover:text-yellow-500 text-lg">Pedidos</a></li>

                </ul>

            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 sm:p-8 md:p-10">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Mi Perfil</h1>
                {error ? (
                    <p className="text-red-600">{error}</p>
                ) : user ? (
                    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">Información del Usuario</h2>
                            <p className="text-gray-600 mt-2"><strong>Email:</strong> {user.email}</p>
                            <p className="text-gray-600"><strong>Roles:</strong> {user.roles.join(", ")}</p>
                        </div>
                        <div className="text-center mt-6">
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-full transition duration-300"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                ) : (
                    <p>Cargando información del usuario...</p>
                )}
            </div>
        </div>
    );
};

export default Profile;
