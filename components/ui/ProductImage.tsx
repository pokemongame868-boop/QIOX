'use client';

import Image from 'next/image';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
}

const NEXT_IMAGE_HOSTS = new Set([
  'images.unsplash.com',
  'object.pscloud.io',
  'gadgetstore.kz',
]);

function canUseNextImage(src: string) {
  if (src.startsWith('/')) return true;

  try {
    const host = new URL(src).hostname;
    return host.endsWith('.supabase.co') || NEXT_IMAGE_HOSTS.has(host);
  } catch {
    return false;
  }
}

export default function ProductImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  sizes,
  priority,
  loading,
}: ProductImageProps) {
  if (canUseNextImage(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : loading}
        className={className}
      />
    );
  }

  if (fill) {
    return <img src={src} alt={alt} className={className} loading={loading ?? 'lazy'} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading ?? 'lazy'}
    />
  );
}
