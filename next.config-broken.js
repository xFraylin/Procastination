/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permitir acceso desde tu IP en desarrollo
      allowedDevOrigins: ['10.0.0.3'],
  
  // Configuración para producción standalone
  output: 'standalone',
  
  // Configuración de imágenes (actualizada)
      images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '10.0.0.3',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
      {
        protocol: 'http',
        hostname: '10.0.0.3',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
      {
        protocol: 'http',
        hostname: '10.0.0.3',
        port: '3000',
        pathname: '/**',
      },
    ],
  },
  
  // Headers CORS y seguridad
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },
  
  // Redirects para producción
  async redirects() {
    return [
      {
        source: '/health',
        destination: '/api/health',
        permanent: true,
      },
    ];
  },
  
  // Configuración para red
  async rewrites() {
    return [];
  },
  
  // Desactivar features que causan problemas en red
  poweredByHeader: false,
  
  // Variables de entorno expuestas
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
