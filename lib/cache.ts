import { unstable_cache } from 'next/cache';
import type { Cotizacion } from './api';

// Cache por 1 hora (en segundos)
const CACHE_TIME = 60 * 60;

export const getCachedCotizacionUI = unstable_cache(
  async (fecha?: string): Promise<Cotizacion> => {
    const response = await fetch(
      `https://cotizaciones-ui-ur-bcu.onrender.com/api/cotizacion/ui${fecha ? `?fecha=${fecha}` : ''}`,
      {
        next: { revalidate: CACHE_TIME }
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener cotización UI');
    }

    return response.json();
  },
  ['cotizacion-ui'],
  {
    revalidate: CACHE_TIME,
    tags: ['cotizacion-ui']
  }
);

export const getCachedCotizacionUR = unstable_cache(
  async (fecha?: string): Promise<Cotizacion> => {
    const response = await fetch(
      `https://cotizaciones-ui-ur-bcu.onrender.com/api/cotizacion/ur${fecha ? `?fecha=${fecha}` : ''}`,
      {
        next: { revalidate: CACHE_TIME }
      }
    );

    if (!response.ok) {
      throw new Error('Error al obtener cotización UR');
    }

    return response.json();
  },
  ['cotizacion-ur'],
  {
    revalidate: CACHE_TIME,
    tags: ['cotizacion-ur']
  }
); 