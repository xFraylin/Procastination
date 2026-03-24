/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permitir acceso desde tu IP en desarrollo
  allowedDevOrigins: ['10.0.0.3'],
  
  // Configuración para producción standalone
  output: 'standalone',
  
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
