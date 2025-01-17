import { Search } from 'lucide-react';
import {useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Perfil from './components/Perfil';
import Productos from './components/Productos.tsx';

import DetalleProducto from './components/DetalleProducto';
import ProtectorPantalla from './components/ProtectorPantalla';
import Carrito from './components/Carrito.tsx';
import Catalogo from './components/Catalogo';
import Covers from './components/Covers';
import Usuarios from './components/Usuarios';
import "./App.css";
import re5 from './assets/images/re5.jpg';
import re7 from './assets/images/re7.jpg';
import re3 from './assets/images/re3.png';
import seercicio from './assets/images/seviciotecni.jpg'

import tecnico from'./assets/images/tecnico.jpg';
import logoss from './assets/images/se.png';
import covercell from './assets/images/telefonoss.jpeg';
import sansum from './assets/images/s22c.jpeg';
import coverCellImage from './assets/images/cover cell.jpeg';
import { ChevronRight } from 'lucide-react';
import MobileHeader from './components/MobileHeader';
import logo from './assets/images/LogoOrigi.png';
import PageTitle from "./components/PageTitle.tsx";
import apiClient from "./ApiClient";
import ProtectedRoute from './components/ProtectedRoute.tsx';

// Componente para la página de inicio

const HomePage = ({ isLoggedIn, services }) => {
    // Array de imágenes importadas
    const images = [
        seercicio,
        covercell,
        sansum,
    ];

    // Estado para manejar la imagen actual
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        // Intervalo para cambiar la imagen cada 5 segundos
        const intervalId = setInterval(() => {
            setCurrentImage((prevImage) => (prevImage + 1) % images.length);
        }, 2000);

        // Limpiar el intervalo cuando el componente se desmonte
        return () => clearInterval(intervalId);
    }, []);

    return (
        <>
            {/* Hero Section */}
            <section className="w-full bg-gray-200 py-16 md:py-22 flex-grow">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-3">
                        {/* Info Box */}
                        <div className="bg-[#FF7043] text-white p-7 md:w-2/4">
                            <h1 className="text-3xl font-extrabold mb-4 text-white drop-shadow-md">
                                EMPRESA DE TECNOLOGÍA DE LA INFORMACIÓN
                            </h1>
                            <h2 className="text-xl font-bold mb-6 drop-shadow-md">
                                CASES / CORREAS / COVER PERSONALIZADO / AIRPODS Y MÁS
                            </h2>
                            <div className="space-y-4">
                                <p className="flex items-center drop-shadow-md">
                                    📍 (Hato Mayor) c/ Duarte casi esq Mercedes
                                </p>
                                <p className="flex items-center drop-shadow-md">
                                    • Lun a Sab 9:00 am a 7:00 pm
                                </p>
                                <p className="flex items-center drop-shadow-md">
                                    • Dom 9:00 am - 1:00 pm
                                </p>
                            </div>
                            <div className="flex items-center justify-center gap-4 mt-8">
                                <ChevronRight
                                    className="w-10 h-10 text-white animate-pulse"
                                    style={{
                                        animation: 'moveLeft 1.5s ease-in-out infinite',  // Cambio aquí para la flecha izquierda
                                        transform: 'rotate(0deg)'  // Cambié la rotación a 0 grados
                                    }}
                                />
                                <Link
                                    to="/catalogo"
                                    className="bg-white text-[#FF7043] px-8 py-3 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 font-medium flex items-center justify-center shadow-lg hover:shadow-xl text-lg"
                                >
                                    Ver Catálogo
                                </Link>
                                <ChevronRight
                                    className="w-10 h-10 text-white animate-pulse"
                                    style={{
                                        animation: 'moveRight 1.5s ease-in-out infinite',  // Cambio aquí para la flecha derecha
                                        transform: 'rotate(180deg)'  // Aquí mantuve la rotación en 180 grados
                                    }}
                                />
                            </div>
                        </div>

                        {/* Image Showcase */}
                        <div className="md:w-3/5 p-5 flex items-center justify-end h-full">
                            <img
                                src={images[currentImage]}
                                alt="Image Showcase"
                                className="w-full h-96 object-cover rounded-lg shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="w-full py-0 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
                    {services.map((service, index) => (
                        <div key={index} className="relative group overflow-hidden">
                            <img
                                src={service.image}
                                alt={`Service ${index + 1}`}
                                className="w-full h-64 object-cover transform transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="absolute bottom-4 left-4 right-4 text-white text-sm">
                                    {service.title}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Informative Section */}
            <section className="w-full py-16 bg-[#FF7043] text-white shadow-lg">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Left Text */}
                        <div className="md:w-1/2">
                            <h2 className="text-4xl font-extrabold mb-6 text-white drop-shadow-lg">
                                LA IMPORTANCIA DE LA REPARACIÓN Y VENTA DE CELULARES
                            </h2>
                            <p className="text-lg mb-6 leading-relaxed text-white opacity-90">
                                En la era actual, los dispositivos móviles se han convertido en una herramienta esencial para la vida diaria. Desde la comunicación hasta el trabajo, la educación y el entretenimiento, nuestros teléfonos inteligentes se han integrado completamente en nuestras rutinas. Sin embargo, cuando estos dispositivos sufren daños o fallos, su reparación y venta se vuelven cruciales.
                            </p>
                            <p className="text-lg mb-6 leading-relaxed text-white opacity-90">
                                La reparación de celulares no solo es importante para alargar la vida útil de los dispositivos, sino que también ayuda a reducir el impacto ambiental al evitar la obsolescencia prematura de estos aparatos. En <strong className="font-semibold">RUJA TECNOLOGY E.I.R.L</strong>, ofrecemos servicios de reparación de alta calidad para todos los modelos de teléfonos móviles, garantizando soluciones rápidas, eficientes y accesibles para nuestros clientes.
                            </p>
                            <p className="text-lg mb-6 leading-relaxed text-white opacity-90">
                                Además, entendemos que la adquisición de un nuevo dispositivo puede ser costosa. Por ello, proporcionamos una amplia gama de teléfonos móviles en venta, adecuados para todas las necesidades y presupuestos. Ya sea para aquellos que buscan un dispositivo de última generación o una opción económica, <strong className="font-semibold">RUJA TECNOLOGY E.I.R.L</strong> tiene lo que necesitas.
                            </p>
                            <p className="text-lg mb-6 leading-relaxed text-white opacity-90">
                                Con nuestra experiencia y compromiso con la satisfacción del cliente, te aseguramos que tu dispositivo estará en buenas manos. No solo reparamos, sino que también brindamos asesoramiento sobre el mantenimiento adecuado para prolongar la vida útil de tus dispositivos móviles.
                            </p>
                        </div>

                        {/* Right Image */}
                        <div className="md:w-1/2 flex justify-center items-center">
                            <img
                                src={coverCellImage}
                                alt="Cell Phone Repair and Sale"
                                className="w-full h-auto max-w-md object-cover rounded-lg shadow-2xl border-4 border-white"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};



// Componentes provisionales para las páginas de productos
const ScreenProtector = () => <div className="p-8">Página de Protectores de Pantalla</div>;
const Phones = () => <div className="p-8">Página de Teléfonos</div>;



const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchQueryInput, setSearchQueryInput] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

    const setupUserSession = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userData.userId);
        localStorage.setItem('userEmail', userData.email);
        localStorage.setItem('userRoles', JSON.stringify(userData.roles));
        const isAdminUser = userData.roles.includes('Admin');
        localStorage.setItem('isAdmin', isAdminUser.toString());

        // Actualizamos ambos estados inmediatamente
        setIsLoggedIn(true);
        setIsAdmin(isAdminUser);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';

        if (token) {
            setIsLoggedIn(true);
            setIsAdmin(storedIsAdmin);
            verifyToken(token);
        } else {
            setIsLoggedIn(false);
            setIsAdmin(false);
        }
    }, []);

    const verifyToken = async (token) => {
        try {
            const response = await apiClient.get(
                "api/Register/current-user",
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
                // Llamamos a setupUserSession con los datos del usuario
                setupUserSession(userData, token);
            }
        } catch (error) {
            console.error("Error de verificación del token:", error);
            handleLogout();
        }
    };



    // Simulamos obtener el rol del usuario desde el localStorage
    //const userRole = localStorage.getItem('role');

    const services = [
        {
            title: "La mejor reparación la tenemos aquí en Ruja.",
            image: re5
        },
        {
            title: "Reparamos tu celular como nuevo, rápido y seguro.",
            image: tecnico
        },
        {
            title: "Expertos en reparación y cuidado de tu celular.",
            image: re7
        },
        {
            title: "La mejor solución para tu teléfono, garantizada.",
            image: re3
        }
    ];

    const handleLogout = () => {
        setIsLoggedIn(false);
        setIsAdmin(false);
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRoles');
    };


useEffect(() => {
    const timeoutId = setTimeout(() => {
        setDebouncedSearchQuery(searchQueryInput);
    }, 300);

    return () => clearTimeout(timeoutId);
}, [searchQueryInput]);



const handleSearch = (e) => {
    setSearchQueryInput(e.target.value); // Esto actualiza inmediatamente el input
};

    return (
        <Router>
            <PageTitle />
            <div className="min-h-screen w-full bg-gray-100 flex flex-col">
                <MobileHeader
                    isLoggedIn={isLoggedIn}
                    isAdmin={isAdmin}
                    logo={logoss}
                    searchQueryInput={searchQueryInput}
                    handleSearch={handleSearch}
                />
                {/* Header */}
                <header className="w-full bg-white shadow-md sticky top-0 z-50 hidden lg:block">
                    <meta name="google-site-verification" content="_2uk-2NGdK6m0mVjCp3mwRTi5Q0g_yoeVd5iN-L4f_U"/>
                    <div className="container mx-auto px-4 py-2">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo */}
                            <div className="flex-shrink-0">
                                <Link to="/" className="flex items-center">
                                    <img
                                        src={logoss}
                                        alt="RUJA Logo"
                                        className="h-12 w-auto"
                                    />
                                </Link>
                            </div>

                            {/* Navigation */}
                            <nav className="flex items-center space-x-6 flex-1 justify-center">
                                <Link to="/catalogo" className="text-orange-500 hover:text-orange-600 font-medium">
                                    Catálogo
                                </Link>
                                <Link to="/Covers" className="text-orange-500 hover:text-orange-600 font-medium">
                                    Covers
                                </Link>
                                <Link to="/protectorpantalla"
                                      className="text-orange-500 hover:text-orange-600 font-medium">
                                    Protector de pantalla
                                </Link>
                                {isAdmin && (
                                    <Link to="/productos" className="text-orange-500 hover:text-orange-600 font-medium">
                                        Productos
                                    </Link>
                                )}

                                {/* Cart Button */}
                                <Link
                                    to="/carrito"
                                    className="flex items-center space-x-2 bg-gradient-to-r from-orange-400 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-500 hover:to-orange-700"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                    <span>Carrito</span>
                                </Link>
                            </nav>


                            {/* Right Section */}
                            <div className="flex items-center space-x-4">
                                {/* Search Bar */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar productos en Catalogo..."
                                        value={searchQueryInput}
                                        onChange={handleSearch}
                                        className="w-64 pl-4 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                                    />
                                    <Search
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500"
                                        size={20}/>
                                </div>


                                {/* Profile Button */}
                                {isLoggedIn && (
                                    <Link
                                        to="/perfil"
                                        className="bg-red-600 hover:bg-orange-600 text-white p-2.5 rounded-md"
                                    >
                                        <div className="w-5 h-5 flex flex-col justify-between">
                                            <div className="w-full h-0.5 bg-white"></div>
                                            <div className="w-full h-0.5 bg-white"></div>
                                            <div className="w-full h-0.5 bg-white"></div>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Routes */}
                <Routes>
                    <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} services={services}/>}/>
                    <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setIsAdmin={setIsAdmin}/>}/>
                    <Route path="/register" element={<Register/>}/>


                    <Route
                        path="/productos"
                        element={
                            <ProtectedRoute
                                isAuthenticated={isLoggedIn}
                                isAdmin={true}
                            >
                                <Productos/>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/protectorpantalla" element={<ProtectorPantalla/>}/>
                    <Route path="/Covers" element={<Covers/>}/>

                    <Route path="/protector" element={<ScreenProtector/>}/>
                    <Route path="/telefonos" element={<Phones/>}/>
                    <Route path="/catalogo" element={<Catalogo searchQuery={debouncedSearchQuery}/>}/>
                    <Route path="/perfil" element={<Perfil/>}/>
                    {/* Agregar la ruta para el detalle del producto */}
                    <Route path="/" element={<Productos/>}/>
                    <Route path="/producto/:id" element={<DetalleProducto/>}/>
                    <Route path="/carrito" element={<Carrito/>}/>
                    <Route path="/users" element={<Usuarios/>}/>
                    <Route path="/carrito/:id" element={<DetalleProducto/>}/>
                </Routes>

                {/* Footer */}
                <footer className="w-full bg-gray-900 text-white py-6 mt-auto">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Main Footer Content */}
                        <div className="text-center">
                            <p>© 2025 RUJA TECNOLOGY E.I.R.L. Todos los derechos reservados.</p>
                        </div>

                        {/* Social Links */}
                        <div className="flex justify-center mt-4 space-x-6">
                            {/* Instagram Link */}
                            <a
                                href="https://www.instagram.com/ruja.exclusividades/?hl=es"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-80"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24">
                                    <defs>
                                        <linearGradient id="instagramGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style={{stopColor: '#F58529'}}/>
                                            <stop offset="50%" style={{stopColor: '#DD2A7B'}}/>
                                            <stop offset="100%" style={{stopColor: '#8134AF'}}/>
                                        </linearGradient>
                                    </defs>
                                    <path
                                        fill="url(#instagramGradient)"
                                        d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.346 3.608 1.32.974.975 1.257 2.243 1.32 3.608.058 1.266.07 1.646.07 4.84s-.012 3.574-.07 4.84c-.062 1.366-.346 2.633-1.32 3.608-.975.974-2.242 1.257-3.608 1.32-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.346-3.608-1.32-.974-.975-1.257-2.242-1.32-3.608C2.175 15.633 2.163 15.253 2.163 12s.012-3.574.07-4.84c.062-1.366.346-2.633 1.32-3.608C4.53 2.51 5.797 2.227 7.163 2.163 8.429 2.105 8.809 2.163 12 2.163zm0-2.163C8.74 0 8.332.014 7.052.072c-1.464.063-2.777.358-3.9 1.48-1.122 1.122-1.416 2.435-1.48 3.9C1.014 8.332 1 8.74 1 12c0 3.26.014 3.668.072 4.948.063 1.464.358 2.777 1.48 3.9 1.122 1.122 2.435 1.416 3.9 1.48 1.28.058 1.688.072 4.948.072s3.668-.014 4.948-.072c1.464-.063 2.777-.358 3.9-1.48 1.122-1.122 1.416-2.435 1.48-3.9.058-1.28.072-1.688.072-4.948s-.014-3.668-.072-4.948c-.063-1.464-.358-2.777-1.48-3.9-1.122-1.122-2.435-1.416-3.9-1.48C15.668.014 15.26 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 100-2.88 1.44 1.44 0 000 2.88z"
                                    />
                                </svg>
                            </a>
                            {/* WhatsApp Link */}
                            <a
                                href="https://wa.me/18094784211"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-80"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24">
                                    <path
                                        fill="#25D366"
                                        d="M20.52 3.48a11.987 11.987 0 10-17.05 16.92l-.68 2.47 2.54-.67a11.93 11.93 0 005.27 1.21h.02c3.27 0 6.35-1.27 8.67-3.58 4.77-4.77 4.78-12.49.02-17.25zm-8.49 18.44a10.06 10.06 0 01-4.88-1.27l-.35-.19-1.82.48.49-1.77-.23-.37A10.066 10.066 0 1112.03 21.92zm5.44-7.5c-.3-.15-1.78-.88-2.05-.98-.28-.1-.48-.15-.67.15-.2.3-.77.98-.95 1.18-.18.2-.35.22-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.8-1.68-2.1-.18-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.14-.16.18-.28.28-.48.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.23-.24-.6-.48-.51-.65-.51h-.55c-.2 0-.52.07-.8.37-.28.3-1.05 1.02-1.05 2.5 0 1.47 1.08 2.9 1.23 3.1.15.2 2.13 3.28 5.17 4.6.7.3 1.25.47 1.68.6.7.22 1.35.2 1.85.12.56-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.42-.07-.12-.27-.2-.55-.35z"
                                    />
                                </svg>
                            </a>
                        </div>

                        {/* Developer Section */}
                        <div className="mt-8 text-center">

                            <img
                                src={logo}
                                alt="Logo del Desarrollador"
                                className="mx-auto mt-2 w-32"
                            />
                        </div>

                    </div>
                </footer>


            </div>
        </Router>

    );
};

export default App;

