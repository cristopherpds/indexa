"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getCotizacionUI, getCotizacionUR, type Cotizacion } from "@/lib/api"
import { InfoIcon, Calculator } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

type UnitType = "indexada" | "reajustable"

interface CurrentValues {
  indexada: Cotizacion | null
  reajustable: Cotizacion | null
}

export default function Converter() {
  const [activeTab, setActiveTab] = useState<UnitType>("indexada")
  const [units, setUnits] = useState<string>("")
  const [result, setResult] = useState<number>(0)
  const [currentValues, setCurrentValues] = useState<CurrentValues>({
    indexada: null,
    reajustable: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [liveRegion, setLiveRegion] = useState<string>("")

  useEffect(() => {
    const fetchCotizaciones = async () => {
      try {
        setLoading(true)
        setError(null)
        setLiveRegion("Cargando cotizaciones...")
        const [ui, ur] = await Promise.all([
          getCotizacionUI(),
          getCotizacionUR()
        ])
        setCurrentValues({
          indexada: ui,
          reajustable: ur
        })
        setLiveRegion("Cotizaciones actualizadas")
      } catch (err) {
        setError("Error al obtener cotizaciones. Por favor, intente más tarde.")
        setLiveRegion("Error al cargar las cotizaciones")
        console.error("Error fetching cotizaciones:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCotizaciones()
  }, [])

  const handleCalculate = async () => {
    setCalculating(true)
    setLiveRegion("Calculando resultado...")
    const value = Number.parseFloat(units) || 0
    const currentCotizacion = currentValues[activeTab]
    if (currentCotizacion?.valor) {
      const result = value * currentCotizacion.valor
      setResult(result)
      setLiveRegion(`Resultado calculado: ${result.toLocaleString("es-UY", {
        style: "currency",
        currency: "UYU"
      })}`)
    }
    await new Promise(resolve => setTimeout(resolve, 300))
    setCalculating(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCalculate()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Card 
        className="w-full max-w-md bg-white text-gray-900 shadow-lg border-t-4 border-t-blue-500"
        role="region"
        aria-label="Conversor de unidades indexadas y reajustables"
      >
        <CardHeader className="space-y-3 pb-4">
          <div className="flex flex-col items-center space-y-1">
            <Calculator className="w-8 h-8 text-blue-500 mb-2" aria-hidden="true" />
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Conversor Indexa+
            </CardTitle>
            <p className="text-sm text-gray-500">
              Cotizaciones oficiales del Banco Central del Uruguay
            </p>
          </div>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-red-500 text-sm text-center p-3 bg-red-50 rounded-lg border border-red-100"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          <Tabs 
            value={activeTab} 
            onValueChange={(value: string) => {
              setActiveTab(value as UnitType)
              setResult(0)
              setUnits("")
              setLiveRegion(`Cambiado a ${value === 'indexada' ? 'unidades indexadas' : 'unidades reajustables'}`)
            }} 
            className="w-full"
          >
            <TabsList 
              className="grid grid-cols-2 w-full bg-gray-50 p-1 rounded-lg"
              aria-label="Seleccione el tipo de unidad"
            >
              <TabsTrigger
                value="indexada"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
                aria-label="Unidades indexadas"
              >
                Indexada
              </TabsTrigger>
              <TabsTrigger
                value="reajustable"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all duration-200"
                aria-label="Unidades reajustables"
              >
                Reajustable
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div 
            className="p-4 bg-gray-50 rounded-lg space-y-6 shadow-inner"
            role="region"
            aria-label="Área de conversión"
          >
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
                role="status"
                aria-live="polite"
              >
                <div 
                  className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-blue-500 border-t-transparent"
                  aria-hidden="true"
                ></div>
                <p className="mt-3 text-sm text-gray-600">Cargando cotizaciones...</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div 
                  className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm"
                  role="region"
                  aria-label="Valor actual de la cotización"
                >
                  <div className="text-sm font-medium text-gray-600 mb-2">Valor actual:</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold text-gray-900">
                      $ {currentValues[activeTab]?.valor.toFixed(4) || "No disponible"}
                    </span>
                    {currentValues[activeTab]?.fecha_corte && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            type="button" 
                            className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-1"
                            aria-label={`Ver fecha de corte: ${formatDate(currentValues[activeTab]?.fecha_corte || '')}`}
                          >
                            <InfoIcon className="h-5 w-5 text-blue-500 hover:text-blue-600 transition-colors cursor-help" aria-hidden="true" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="center" className="bg-gray-900 text-white">
                          <p className="font-medium">
                            Fecha de corte: {formatDate(currentValues[activeTab]?.fecha_corte || '')}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="units" className="text-sm font-medium text-gray-700 block">
                    {activeTab === "indexada" ? "Unidades indexadas" : "Unidades reajustables"}:
                  </label>
                  <Input
                    id="units"
                    type="number"
                    value={units}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUnits(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ingrese el valor a convertir"
                    className="text-lg bg-white border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 rounded-lg shadow-sm"
                    aria-label={`Ingrese cantidad de ${activeTab === "indexada" ? "unidades indexadas" : "unidades reajustables"}`}
                    aria-describedby="calc-instructions"
                  />
                  <VisuallyHidden id="calc-instructions">
                    Presione Enter o el botón Calcular para convertir a pesos uruguayos
                  </VisuallyHidden>
                </div>

                <Button
                  onClick={handleCalculate}
                  className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all duration-200 rounded-lg shadow-sm
                    ${calculating ? 'opacity-90 cursor-wait' : 'hover:shadow-md transform hover:-translate-y-0.5'}
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  size="lg"
                  disabled={loading || !currentValues[activeTab]?.valor || calculating}
                  aria-busy={calculating}
                >
                  {calculating ? (
                    <span className="inline-flex items-center">
                      <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" aria-hidden="true"></span>
                      Calculando...
                    </span>
                  ) : (
                    'Calcular'
                  )}
                </Button>

                <AnimatePresence>
                  {result > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-blue-50 p-4 rounded-lg border border-blue-100"
                      role="region"
                      aria-label="Resultado de la conversión"
                      aria-live="polite"
                    >
                      <div className="text-sm font-medium text-blue-700 mb-1">
                        Resultado en pesos uruguayos:
                      </div>
                      <div className="text-3xl font-bold text-blue-900">
                        ${" "}
                        {result.toLocaleString("es-UY", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                          useGrouping: true,
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Región live para anuncios de estado */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {liveRegion}
      </div>
    </TooltipProvider>
  )
}

