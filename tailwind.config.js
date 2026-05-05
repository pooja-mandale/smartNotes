/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./app/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: "#3B82F6",
                secondary: "#1E293B",
                accent: "#F59E0B",
                success: "#10B981",
                error: "#EF4444",
                background: "#F8FAFC",
            },
            fontFamily: {
                outfit: ["Outfit", "sans-serif"],
            }
        },
    },
    plugins: [],
};
