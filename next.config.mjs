/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permitir acceso desde tu IP en desarrollo
  allowedDevOrigins: ['10.0.0.3'],
  
  // Desactivar output standalone para evitar Server Action errors
  // output: 'standalone',
  
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
