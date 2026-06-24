/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Remote hosts allowed for <Image />.
    // The picsum hosts are only here so the placeholder hero images render.
    // When you switch to your OWN images (placed in /public/hero/...), you
    // can remove these — local images need no config.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
