'use client';

import React from 'react';
import Image from 'next/image';

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-3xl',
};

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

const statusSizes = {
  xs: 'w-1.5 h-1.5 border',
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
  xl: 'w-4 h-4 border-2',
  '2xl': 'w-5 h-5 border-2',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  name = '',
  size = 'md',
  status,
  className = '',
}) => {
  const hasImage = src && src.trim() !== '';
  const initials = name ? getInitials(name) : '?';
  const bgColor = name ? getColorFromName(name) : 'bg-gray-400';

  const sizeInPx = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 96,
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {hasImage ? (
        <Image
          src={src}
          alt={alt}
          width={sizeInPx[size]}
          height={sizeInPx[size]}
          className={`
            ${sizeClasses[size]}
            rounded-full object-cover ring-2 ring-white
          `}
        />
      ) : (
        <div
          className={`
            ${sizeClasses[size]}
            ${bgColor}
            rounded-full flex items-center justify-center
            text-white font-semibold ring-2 ring-white
          `}
        >
          {initials}
        </div>
      )}
      
      {status && (
        <span
          className={`
            absolute bottom-0 right-0 block rounded-full
            ${statusColors[status]}
            ${statusSizes[size]}
            border-white
          `}
        />
      )}
    </div>
  );
};

export interface AvatarGroupProps {
  avatars: Array<{
    src?: string | null;
    name?: string;
    alt?: string;
  }>;
  max?: number;
  size?: AvatarProps['size'];
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'md',
  className = '',
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          alt={avatar.alt}
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={`
            ${sizeClasses[size]}
            rounded-full bg-gray-200 flex items-center justify-center
            text-gray-600 font-semibold ring-2 ring-white
          `}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};
