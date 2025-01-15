import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import apiClient from "../ApiClient";

const Login = ({ setIsLoggedIn, setIsAdmin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            verifyToken(token);
        }
    }, []);

    const verifyToken = async (token) => {
        try {
            const response = await apiClient.get(
                "/api/Register/current-user",
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            if (response.status === 200) {
                const userData = response.data;
                console.log("Usuario verificado:", {
                    email: userData.email,
                    roles: userData.roles,
                    userId: userData.userId
                });
                setupUserSession(userData, token);
            }
        } catch (error) {
            console.error("Error de verificación del token:", error);
            localStorage.removeItem("token");
            setIsLoggedIn(false);
            setIsAdmin(false);
        }
    };

    const setupUserSession = (userData, token) => {
        localStorage.setItem("userId", userData.userId);
        localStorage.setItem("userEmail", userData.email);
        localStorage.setItem("userRoles", JSON.stringify(userData.roles));

        const isAdmin = userData.roles.includes('Admin');
        localStorage.setItem("isAdmin", isAdmin.toString());

        console.log("Sesión de usuario establecida:", {
            email: userData.email,
            roles: userData.roles,
            userId: userData.userId,
            isAdmin: isAdmin
        });

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setIsLoggedIn(true);
        setIsAdmin(isAdmin);
        navigate("/");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const loginResponse = await apiClient.post("/login", {
                email,
                password,
            });

            console.log("Respuesta de inicio de sesión:", loginResponse.data);

            if (!loginResponse || !loginResponse.data) {
                throw new Error("No se recibió respuesta del servidor");
            }

            const token = loginResponse.data.token || loginResponse.data.accessToken || loginResponse.data;

            if (token) {
                localStorage.setItem("token", token);
                await verifyToken(token);
            } else {
                console.error("Estructura de respuesta:", loginResponse.data);
                throw new Error("Estructura de respuesta inválida del servidor");
            }
        } catch (error) {
            console.error("Detalles del error de inicio de sesión:", {
                mensaje: error.message,
                respuesta: error.response?.data,
                estado: error.response?.status
            });
            handleLoginError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginError = (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 400:
                    setError(error.response.data?.message || "Por favor verifique sus credenciales.");
                    break;
                case 401:
                    setError(error.response.data?.message || "Email o contraseña incorrectos.");
                    break;
                case 404:
                    setError("Servicio no disponible en este momento.");
                    break;
                default:
                    setError(`Error en el servidor: ${error.response.data?.message || 'Por favor intente más tarde.'}`);
            }
        } else if (error.request) {
            setError("No se pudo conectar al servidor. Verifique su conexión.");
        } else {
            setError(`Error al procesar la solicitud: ${error.message}`);
        }
        localStorage.removeItem("token");
        axios.defaults.headers.common['Authorization'] = null;
    };

    return (
        <div className="min-h-screen flex items-start justify-center bg-gray-100 pt-20">
            <div className="max-w-lg w-full space-y-8 p-10 bg-white rounded-xl shadow-xl">
                <div>
                    <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
                        Iniciar sesión
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722] focus:z-10 sm:text-lg"
                                placeholder="Correo electrónico"
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722] focus:z-10 sm:text-lg"
                                placeholder="Contraseña"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm mt-2 text-center bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white ${
                                isLoading
                                    ? 'bg-[#FF5722]/70 cursor-not-allowed'
                                    : 'bg-[#FF5722] hover:bg-[#E64A19]'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5722] transition-colors`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Iniciando sesión...
                                </span>
                            ) : (
                                "Iniciar sesión"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;