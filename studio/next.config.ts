
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com', // For IMDb images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co', // For Spotify images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.gr-assets.com', // For Goodreads images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.tvtropes.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.universalpictures.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.xn--%20-ljja3dxqub.blog', // Punycode for static.கேட்க.blog
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.libsyn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // For Google user profile images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.simplecastcdn.com', // For Simplecast podcast images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.megaphone.fm', // For Megaphone podcast images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'is4-ssl.mzstatic.com', // For Apple iTunes/Podcasts images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org', // For The Movie Database images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'archive.org', // For Archive.org images
        port: '',
        pathname: '/**',
      }
    ],
  },
  allowedDevOrigins: [ 
    'https://6000-firebase-studio-1749447440392.cluster-sumfw3zmzzhzkx4mpvz3ogth4y.cloudworkstations.dev',
    'https://9005-firebase-studio-1749447440392.cluster-sumfw3zmzzhzkx4mpvz3ogth4y.cloudworkstations.dev' 
  ],
};

export default nextConfig;
