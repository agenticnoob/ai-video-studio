const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.31.6", "192.168.50.6", "ez.zzzxc.com"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

module.exports = nextConfig;
