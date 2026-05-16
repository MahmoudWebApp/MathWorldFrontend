import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mathwordbackend.onrender.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net',
      },
       {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
