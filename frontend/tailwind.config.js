/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          customDark: '#1c1f2e', 
        },
        
      },
    },
    plugins: [
    ],
  }