import { MetadataRoute } from 'next';
import { siteConfig, popularCountries } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = siteConfig.url;

    // Static routes
    const routes = [
        '',
        '/packages',
        '/dashboard',
        '/dashboard/orders',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    // Dynamic country routes
    const countryRoutes = popularCountries.map((country) => ({
        url: `${baseUrl}/country/${country.code.toLowerCase()}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [...routes, ...countryRoutes];
}
