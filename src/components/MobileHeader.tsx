import  { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';

const MobileHeader = ({ isLoggedIn, isAdmin, logo  }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Función para cerrar el menú
    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <div className="lg:hidden w-full bg-white shadow-sm sticky top-0 z-50">
            <div className="px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to="/">
                    <img
                        src={logo}
                        alt="RUJA Logo"
                        className="h-12 w-auto"
                    />
                </Link>

                {/* Hamburger Button and Cart Button */}
                <div className="flex items-center space-x-4">

                    {/* Cart Button */}
                    <Link
                        to="/carrito"
                        className="flex items-center space-x-2 bg-gradient-to-r from-orange-400 to-orange-600 text-white py-2 px-4 rounded-lg"
                    >
                        <ShoppingCart size={20} />
                        <span>Carrito</span>
                    </Link>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-[#FF5722] hover:bg-orange-50 rounded-lg transition-colors"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="bg-white border-t border-gray-100 px-4 py-2">
                    <div className="space-y-4">



                        {/* Navigation Links */}
                        <nav className="flex flex-col space-y-3">
                            <Link
                                to="/catalogo"
                                className="text-[#FF5722] hover:text-orange-600 py-2"
                                onClick={closeMenu} // Cierra el menú cuando se hace clic
                            >
                                Catálogo
                            </Link>
                            <Link
                                to="/Covers"
                                className="text-[#FF5722] hover:text-orange-600 py-2"
                                onClick={closeMenu}
                            >
                                Covers
                            </Link>
                            <Link
                                to="/protectorpantalla"
                                className="text-[#FF5722] hover:text-orange-600 py-2"
                                onClick={closeMenu}
                            >
                                Protector de pantalla
                            </Link>

                            {isAdmin && (
                                <Link
                                    to="/productos"
                                    className="text-[#FF5722] hover:text-orange-600 py-2"
                                    onClick={closeMenu}
                                >
                                    Productos
                                </Link>
                            )}

                            {isLoggedIn && (
                                <Link
                                    to="/perfil"
                                    className="text-[#FF5722] hover:text-orange-600 py-2"
                                    onClick={closeMenu}
                                >
                                    Mi Perfil
                                </Link>
                            )}
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileHeader;
