const { withPlaiceholder } = require("@plaiceholder/next");

const authorizedImageDomains = [
  "res.cloudinary.com",
  "images.unsplash.com",
  "www.notion.so",
  "s3.us-west-2.amazonaws.com"
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  staticPageGenerationTimeout: 900,
  reactStrictMode: true,
  images: {
    domains: authorizedImageDomains
  },
  async rewrites() {
    return [
      {
        source: "/jobs",
        destination: "/jobboard"
      }
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
    ]
  },
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
    authorizedImageDomains
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
