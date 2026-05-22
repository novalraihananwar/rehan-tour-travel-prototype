import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/driver/', '/api/'],
      },
    ],
    sitemap: 'https://rehantour.id/sitemap.xml',
    host: 'https://rehantour.id',
  }
}
