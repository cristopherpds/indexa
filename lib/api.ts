const BASE_URL = 'https://cotizaciones-ui-ur-bcu.onrender.com/api';

export interface Cotizacion {
  fecha: string;
  metadata: {
    fecha_consulta: string;
    fuente: string;
  };
  moneda: string;
  tipo: string;
  valor: number;
}

// Funciones auxiliares para el manejo del caché local
const CACHE_KEY_UI = 'cached_cotizacion_ui';
const CACHE_KEY_UR = 'cached_cotizacion_ur';

function saveToLocalCache(key: string, data: Cotizacion) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: new Date().getTime()
    }));
  }
}

function getFromLocalCache(key: string): Cotizacion | null {
  if (typeof window === 'undefined') return null;
  
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const { data, timestamp } = JSON.parse(cached);
  const now = new Date().getTime();
  const hourInMs = 3600000;

  // Devolver null si el caché tiene más de una hora
  if (now - timestamp > hourInMs) {
    localStorage.removeItem(key);
    return null;
  }

  return data;
}

async function handleResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  if (!response.ok) {
    if (contentType?.includes('application/json')) {
      const error = await response.json();
      throw new Error(error.error || 'Error en la petición');
    }
    throw new Error(`Error HTTP: ${response.status}`);
  }

  if (!contentType?.includes('application/json')) {
    throw new Error('La respuesta no es JSON válido');
  }

  return response.json();
}

export async function getCotizacionUI(fecha?: string): Promise<Cotizacion> {
  const url = fecha 
    ? `${BASE_URL}/cotizacion/ui?fecha=${fecha}`
    : `${BASE_URL}/cotizacion/ui`;
    
  try {
    console.log('Fetching UI from:', url);
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return await handleResponse(response);
  } catch (error: any) {
    console.error('Error detallado UI:', {
      message: error?.message || 'Error desconocido',
      url,
      timestamp: new Date().toISOString()
    });
    
    // Intentar obtener del caché local
    const cachedData = localStorage.getItem('cached_ui');
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      if (parsed && parsed.timestamp > Date.now() - 3600000) { // 1 hora
        return parsed.data;
      }
    }
    
    throw new Error(error?.message || 'Error al obtener cotización UI');
  }
}

export async function getCotizacionUR(fecha?: string): Promise<Cotizacion> {
  const url = fecha 
    ? `${BASE_URL}/cotizacion/ur?fecha=${fecha}`
    : `${BASE_URL}/cotizacion/ur`;
    
  try {
    console.log('Fetching UR from:', url);
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return await handleResponse(response);
  } catch (error: any) {
    console.error('Error detallado UR:', {
      message: error?.message || 'Error desconocido',
      url,
      timestamp: new Date().toISOString()
    });
    
    // Intentar obtener del caché local
    const cachedData = localStorage.getItem('cached_ur');
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      if (parsed && parsed.timestamp > Date.now() - 3600000) { // 1 hora
        return parsed.data;
      }
    }
    
    throw new Error(error?.message || 'Error al obtener cotización UR');
  }
}

export async function getHistoricoUI(inicio?: string, fin?: string) {
  const params = new URLSearchParams();
  if (inicio) params.append('inicio', inicio);
  if (fin) params.append('fin', fin);
  
  const url = `${BASE_URL}/historico/ui?${params.toString()}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return await handleResponse(response);
  } catch (error: any) {
    console.error('Error detallado histórico UI:', {
      message: error?.message || 'Error desconocido',
      url,
      timestamp: new Date().toISOString()
    });
    throw new Error(error?.message || 'Error al obtener histórico UI');
  }
}

export async function getHistoricoUR(inicio?: string, fin?: string) {
  const params = new URLSearchParams();
  if (inicio) params.append('inicio', inicio);
  if (fin) params.append('fin', fin);
  
  const url = `${BASE_URL}/historico/ur?${params.toString()}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    return await handleResponse(response);
  } catch (error: any) {
    console.error('Error detallado histórico UR:', {
      message: error?.message || 'Error desconocido',
      url,
      timestamp: new Date().toISOString()
    });
    throw new Error(error?.message || 'Error al obtener histórico UR');
  }
} 