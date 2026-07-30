import type { Cotizacion, TipoUnidad } from './bcu';

export type { Cotizacion };

async function getCotizacion(tipo: TipoUnidad): Promise<Cotizacion> {
  const response = await fetch(`/api/cotizacion/${tipo}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener la cotización');
  }

  return data;
}

export function getCotizacionUI(): Promise<Cotizacion> {
  return getCotizacion('ui');
}

export function getCotizacionUR(): Promise<Cotizacion> {
  return getCotizacion('ur');
}
