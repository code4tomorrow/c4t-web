/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    minimumCacheTTL: 30 * 60 * 60 * 1000,
    domains: [
      "res.cloudinary.com"
    ]
  },
  webpack(conf) {
    conf.module.rules.push({
      test: /\.svg$/i,
      issuer: { and: [/\.(js|ts|md)x?$/] },
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            prettier: false,
            svgo: true,
            svgoConfig: { 
              plugins: [{ 
                  name: "removeViewBox",
                  active: false,
                }, {
                  name: "cleanupIDs",
                  active: false,
                }, {
                  name: "prefixIds",
                  active: false,
                }] 
            },
            titleProp: true,
          },
        },
      ],
    });
    return conf;
  }
}

module.exports = nextConfig
