const withPWA = require('next-pwa')
const runtimeCaching = require('next-pwa/cache')
const linguiConfig = require('./lingui.config.js')
const defaultTheme = require('tailwindcss/defaultTheme')

const { ChainId } = require('@sushiswap/core-sdk')

const { locales, sourceLocale } = linguiConfig
const { screens } = defaultTheme

// module.exports = {
//   webpack(config) {
//     // we depend on nextjs switching to webpack 4 by default. Probably they will
//     // change this behavior at some future major version.
//     config.node = {
//       fs: 'empty', // webpack4 era solution
//     }

//     return config
//   },
// }

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const { withSentryConfig } = require('@sentry/nextjs')

// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  webpack: (config) => {
    config.module.rules = [
      ...config.module.rules,
      {
        resourceQuery: /raw-lingui/,
        type: 'javascript/auto',
      },
    ]
    // config.resolve.fallback = {
    //   ...config.resolve.fallback,
    //   child_process: false,
    //   net: false,
    //   tls: false,
    //   readline: false,
    //   fs: false, // the solution
    // }
    return config
  },
  // experimental: {
  //   nextScriptWorkers: true,
  // },
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  swcMinify: false,
  reactStrictMode: true,
  // pwa: {
  //   dest: 'public',
  //   runtimeCaching,
  //   disable: process.env.NODE_ENV === 'development',
  // },
  images: {
    loader: 'cloudinary',
    path: 'https://res.cloudinary.com/sushi-cdn/image/fetch/',
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/swap',
        permanent: false,
      },
      {
        source: '/analytics/pairs/:path*',
        destination: '/analytics/pools/:path*',
        permanent: true,
      },
      {
        source: '/farms/special',
        destination: '/farm',
        permanent: true,
      },
      {
        source: '/onsen',
        destination: '/farm',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/stake',
        destination: '/bar',
      },
      {
        source: '/swap',
        destination: '/swap',
      },
      {
        source: '/add/:token*',
        destination: '/legacy/add/:token*',
      },
      {
        source: '/remove/:token*',
        destination: '/legacy/remove/:token*',
      },
      {
        source: '/create/:token*',
        destination: '/legacy/add/:token*',
      },
      {
        source: '/open-order',
        destination: '/limit-order/open-order',
      },
      {
        source: '/pool',
        destination: '/legacy/pool',
      },
      {
        source: '/find',
        destination: '/legacy/find',
      },
      {
        source: '/migrate',
        destination: '/legacy/migrate',
      },
      // Kashi
      {
        source: '/me',
        destination: '/user',
      },
    ]
  },
  // i18n: {
  //   localeDetection: false,
  //   locales,
  //   defaultLocale: sourceLocale,
  // },
  // serverRuntimeConfig: {},
  publicRuntimeConfig: {
    breakpoints: screens,

    [ChainId.ETHEREUM]: {
      features: [],
    },
  },
}

const SentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore
  // silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
}

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(withBundleAnalyzer(nextConfig), SentryWebpackPluginOptions)

// Don't delete this console log, useful to see the config in Vercel deployments
// console.log('next.config.js', JSON.stringify(module.exports, null, 2))
