/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Pure static output: no server, no API routes, no ISR/SSR, no middleware.
     `next build` writes the whole site to `out/`. */
  output: 'export',
  /* Directory-style URLs (`out/en/index.html`), so every page resolves from a
     plain file server and `out/index.html` opens directly. */
  trailingSlash: true,
  /* The optimizer is a server feature and cannot run in an exported build. */
  images: { unoptimized: true },
}

export default nextConfig
