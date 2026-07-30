import { NextResponse } from 'next/server';
import { getCotizacionBCU, type TipoUnidad } from '@/lib/bcu';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tipo: string }> }
) {
  const { tipo } = await params;

  if (tipo !== 'ui' && tipo !== 'ur') {
    return NextResponse.json(
      { error: 'Tipo de unidad inválido: use "ui" o "ur"', codigo: 'TIPO_INVALIDO' },
      { status: 400 }
    );
  }

  try {
    const cotizacion = await getCotizacionBCU(tipo as TipoUnidad);
    return NextResponse.json(cotizacion);
  } catch (error) {
    console.error(`Error al obtener cotización ${tipo} del BCU:`, error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error al consultar el BCU',
        codigo: 'BCU_ERROR',
      },
      { status: 502 }
    );
  }
}
