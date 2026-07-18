/** @type {import('next').NextConfig} */

/* Allow <Image> to optimise anything we upload to S3 / CloudFront.
   Hosts are read from env so you don't have to edit code when the bucket
   name changes. */
const remotePatterns = [
  { protocol: "https", hostname: "picsum.photos" },
  { protocol: "https", hostname: "fastly.picsum.photos" },
  { protocol: "https", hostname: "images.unsplash.com" },
];

if (process.env.AWS_S3_BUCKET && process.env.AWS_REGION) {
  remotePatterns.push({
    protocol: "https",
    hostname: `${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`,
  });
}

if (process.env.AWS_CLOUDFRONT_URL) {
  try {
    remotePatterns.push({
      protocol: "https",
      hostname: new URL(process.env.AWS_CLOUDFRONT_URL).hostname,
    });
  } catch {
    // Ignore a malformed CloudFront URL rather than crashing the build.
  }
}

const nextConfig = {
  images: { remotePatterns },
};

export default nextConfig;
