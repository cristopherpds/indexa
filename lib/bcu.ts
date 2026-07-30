import { unstable_cache } from 'next/cache';

// Web Services oficiales de cotizaciones del BCU (SOAP).
// Especificación: "Web Service de Cotizaciones" v3 (28/09/2020).
const BASE_URL = 'https://cotizaciones.bcu.gub.uy/wscotizaciones/servlet';

// Cache por 1 hora (en segundos)
const CACHE_TIME = 60 * 60;

export type TipoUnidad = 'ui' | 'ur' | 'up';

// Códigos de moneda del BCU (grupo 2: Cotizaciones Locales)
const MONEDAS: Record<TipoUnidad, { codigo: number; nombre: string }> = {
  ui: { codigo: 9800, nombre: 'Unidad Indexada' },
  ur: { codigo: 9900, nombre: 'Unidad Reajustable' },
  up: { codigo: 9700, nombre: 'Unidad Previsional' },
};

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

async function soapCall(servlet: string, action: string, bodyXml: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/${servlet}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: `"Cotizaaction/${action}.Execute"`,
    },
    body: `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cot="Cotiza">
  <soapenv:Body>${bodyXml}</soapenv:Body>
</soapenv:Envelope>`,
  });

  if (!response.ok) {
    throw new Error(`El servicio del BCU respondió HTTP ${response.status}`);
  }

  return response.text();
}

function tag(xml: string, name: string): string | null {
  const match = xml.match(new RegExp(`<${name}>([^<]*)</${name}>`));
  return match ? match[1] : null;
}

async function getUltimoCierre(): Promise<string> {
  const xml = await soapCall('awsultimocierre', 'AWSULTIMOCIERRE', '<cot:wsultimocierre.Execute/>');
  const fecha = tag(xml, 'Fecha');
  if (!fecha) {
    throw new Error('El BCU no devolvió la fecha del último cierre');
  }
  return fecha;
}

async function fetchCotizacion(tipo: TipoUnidad): Promise<Cotizacion> {
  const { codigo, nombre } = MONEDAS[tipo];

  // Se consulta la fecha del último cierre para pedir la cotización vigente
  // (pedir la fecha de hoy falla en fines de semana y feriados).
  const fechaCierre = await getUltimoCierre();

  const xml = await soapCall(
    'awsbcucotizaciones',
    'AWSBCUCOTIZACIONES',
    `<cot:wsbcucotizaciones.Execute>
      <cot:Entrada>
        <cot:Moneda><cot:item>${codigo}</cot:item></cot:Moneda>
        <cot:FechaDesde>${fechaCierre}</cot:FechaDesde>
        <cot:FechaHasta>${fechaCierre}</cot:FechaHasta>
        <cot:Grupo>2</cot:Grupo>
      </cot:Entrada>
    </cot:wsbcucotizaciones.Execute>`
  );

  const codigoError = tag(xml, 'codigoerror');
  if (codigoError && codigoError !== '0') {
    throw new Error(tag(xml, 'mensaje') || `El BCU devolvió el error ${codigoError}`);
  }

  const dato = xml.match(/<datoscotizaciones\.dato[\s\S]*?<\/datoscotizaciones\.dato>/)?.[0];
  if (!dato) {
    throw new Error(`El BCU no devolvió cotización de ${nombre} para ${fechaCierre}`);
  }

  const valor = Number(tag(dato, 'TCV'));
  const fecha = tag(dato, 'Fecha');
  if (!fecha || !Number.isFinite(valor) || valor <= 0) {
    throw new Error(`Respuesta del BCU inválida para ${nombre}`);
  }

  return {
    fecha,
    metadata: {
      fecha_consulta: new Date().toISOString(),
      fuente: 'Banco Central del Uruguay (awsbcucotizaciones)',
    },
    moneda: 'UYU',
    tipo: tipo.toUpperCase(),
    valor,
  };
}

export const getCotizacionBCU = unstable_cache(fetchCotizacion, ['cotizacion-bcu'], {
  revalidate: CACHE_TIME,
  tags: ['cotizaciones'],
});
