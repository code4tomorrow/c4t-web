/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
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
