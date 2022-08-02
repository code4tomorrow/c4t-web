const { withPlaiceholder } = require("@plaiceholder/next");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "res.cloudinary.com"
    ]
  },
  async redirects() {
    return [
      {
        source: "/index.html",
        destination: "/",
        permanent: true
      },
      {
        source: "/about.html",
        destination: "/about",
        permanent: true
      },
      {
        source: "/learn.html",
        destination: "/learn",
        permanent: true
      },
      {
        source: "/courses.html",
        destination: "/courses",
        permanent: true
      },
      {
        source: "/volunteer.html",
        destination: "/volunteer",
        permanent: true
      },
      {
        source: "/jobboard.html",
        destination: "/jobboard",
        permanent: true
      },
      {
        source: "/jobboard",
        destination: "https://v1.code4tomorrow.org/jobboard.html",
        permanent: false
      }
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

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer(withPlaiceholder(nextConfig));
