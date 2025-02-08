// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173, // Adjust if needed
    // Configure CORS if necessary
    cors: true,
    // Specify that the server should be accessible from outside
    host: "0.0.0.0",
  },
  // If you have any plugins specific to your setup, add them here
  plugins: [],
});
