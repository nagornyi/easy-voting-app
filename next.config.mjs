export default {
  async headers() {
    return [
      {
        source: '/api/updates',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache',
          },
          {
            key: 'Connection',
            value: 'keep-alive',
          },
        ],
      },
    ];
  },

  webpack: (config, { dev, isServer }) => {
    // Modify the watch options to ignore the /api/updates endpoint in development mode
    if (dev && !isServer) {
      config.watchOptions = {
        ignored: ['**/api/updates'],
      };
    }

    return config;
  },
};
