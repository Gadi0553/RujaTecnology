import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from "../ApiClient";
import {data} from "autoprefixer";

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const validateEmail = (email: string) => {
        // Expresión regular para verificar que el correo termine en dominios específicos
        const validDomains = ['gmail.com', 'hotmail.com', 'yahoo.com']; // Puedes agregar más dominios aquí
        const regex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.)+(com|org|net)$/;

        if (!regex.test(email)) {
            return false;
        }

        // Extraemos el dominio y verificamos si es uno de los válidos
        const domain = email.split('@')[1];
        return validDomains.includes(domain);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        // Validar el correo electrónico
        if (!validateEmail(email)) {
            setError('El correo electrónico debe ser de un dominio válido (gmail.com, hotmail.com, etc.).');
            setIsLoading(false);
            return;
        }

        try {
            const payload = {
                email: email,
                password: password,
                roles: [],
            };

            const response = await apiClient.post('/api/Register/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });


            console.log(response.data);
            console.log('Registration successful:', data);
            setSuccessMessage('¡Usuario registrado con éxito!');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-start justify-center bg-gray-100 pt-20">
            <div className="max-w-lg w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
                <div>
                    <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">Registrarse</h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Correo electrónico
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722] focus:z-10 sm:text-lg"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722] focus:z-10 sm:text-lg"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {/* Texto adicional debajo de la contraseña */}
                        <div className="mt-1 text-sm text-gray-500 ml-4">
                            Utiliza mayúsculas y caracteres especiales
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm mt-2">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="text-green-500 text-sm mt-2">
                            {successMessage}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-[#FF5722] hover:bg-[#E64A19] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5722]"
                        >
                            {isLoading ? 'Registrando...' : 'Registrarse'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
