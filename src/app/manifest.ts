import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Atelier — Daily Agenda & Note',
    short_name: 'Atelier',
    description: 'Minimal, single-day productivity workspace for your notes, tasks, and agenda.',
    start_url: '/',
    display: 'standalone',
    background_color: '#161412',
    theme_color: '#F7F4ED',
    icons: [
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
