import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { 
        ...config.resolve.fallback,
        tls: false,
        net: false,
        fs: false,
        child_process: false,
        experimental: {
          turbo: true,
          serverComponentsExternalPackages: ['mysql2']
        }
      };
    }
   
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Set-Cookie',
            value: 'next-auth.session-token=...; Path=/; HttpOnly; SameSite=Lax'
          }
        ]
      }
    ]
  }
};


module.exports = nextConfig;



