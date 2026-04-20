/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                light: {
                    background: '#FFFFFF',
                    surface: '#F8FAFC',
                    text: '#1E293B',
                    accent: '#6366F1',
                    neutral: '#94A3B8',
                },
                dark: {
                    background: '#0F172A',
                    surface: '#1E293B',
                    text: '#E2E8F0',
                    accent: '#22D3EE',
                    neutral: '#475569',
                }
            }
        },
    },
    plugins: [],
}
