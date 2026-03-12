import { Route, ROUTE_METADATA } from '@/constants/routes';
import { Metadata } from 'next';

type MetadataConfig = {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
};

const DEFAULT_METADATA = ROUTE_METADATA[Route.HOME];

/**
 * Constructs standard Next.js metadata based on the current Route enum
 * or custom override configuration.
 */
export function constructMetadata(
  routeOrConfig?: Route | MetadataConfig,
): Metadata {
  let config: MetadataConfig = { ...DEFAULT_METADATA };

  if (!routeOrConfig) {
    // Return default empty if nothing provided
  } else if (typeof routeOrConfig === 'string') {
    // It's a predefined Route enum
    const routeMeta = ROUTE_METADATA[routeOrConfig];
    if (routeMeta) {
      config = { ...config, ...routeMeta };
    }
  } else {
    // It's completely custom overrides passed directly to the function
    config = { ...config, ...routeOrConfig };
  }

  const { title, description, image, noIndex } = config;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(image && {
        images: [
          {
            url: image,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image && { images: [image] }),
      creator: '@WeTranscend',
    },
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
