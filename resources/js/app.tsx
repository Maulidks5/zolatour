import '../css/app.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/manrope/latin-800.css';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import type { ComponentType } from 'react';
import { createRoot } from 'react-dom/client';

const pages = import.meta.glob<{ default: ComponentType }>('./Pages/**/*.tsx');

createInertiaApp({
    title: (title) => title ? `${title} | Zola Tours & Safaris` : 'Zola Tours & Safaris',
    resolve: async (name) => (await resolvePageComponent(`./Pages/${name}.tsx`, pages)).default,
    setup({ el, App, props }) {
        if (!el) {
            return;
        }

        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#00c5e8',
    },
});
