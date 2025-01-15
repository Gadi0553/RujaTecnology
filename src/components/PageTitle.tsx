import { useEffect } from 'react';
import logoss from '../assets/images/R.png'; // Asegúrate de que la ruta sea correcta

const PageTitle = () => {
    useEffect(() => {
        // Cambiar el título de la página
        document.title = 'RUJA TECNOLOGY E.I.R.L';

        // Cambiar el favicon
        const favicon = document.querySelector('link[rel="icon"]');
        if (!favicon) {
            const newFavicon = document.createElement('link');
            newFavicon.rel = 'icon';
            newFavicon.href = logoss;
            document.head.appendChild(newFavicon);
        } else {
            favicon.href = logoss;
        }
    }, []);

    return null;
};

export default PageTitle;