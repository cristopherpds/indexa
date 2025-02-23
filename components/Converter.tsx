"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type UnitType = "indexada" | "reajustable"

interface CurrentValues {
  indexada: number
  reajustable: number
}

export default function Converter() {
  const [activeTab, setActiveTab] = useState<UnitType>("indexada")
  const [units, setUnits] = useState<string>("")
  const [result, setResult] = useState<number>(0)

  const currentValues: CurrentValues = {
    indexada: 6.2323,
    reajustable: 1747.25,
  }

  const handleCalculate = () => {
    const value = Number.parseFloat(units) || 0
    const multiplier = currentValues[activeTab]
    setResult(value * multiplier)
  }

  return (
    <Card className="w-full max-w-md bg-white text-gray-900">
      <CardHeader>
        <CardTitle className="text-xl text-center">
          Conversor Indexa<span className="text-blue-500">+</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as UnitType)} className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-gray-50 p-1 rounded-md">
            <TabsTrigger
              value="indexada"
              className="rounded data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Indexada
            </TabsTrigger>
            <TabsTrigger
              value="reajustable"
              className="rounded data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Reajustable
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="p-4 bg-gray-50 rounded-lg space-y-6">
          <div className="space-y-1">
            <div className="text-sm font-medium">Valor actual:</div>
            <div className="text-lg">$ {currentValues[activeTab]}</div>
          </div>

          <div className="space-y-2">
            <label htmlFor="units" className="text-sm font-medium">
              {activeTab === "indexada" ? "Unidades indexadas" : "Unidades reajustables"}:
            </label>
            <Input
              id="units"
              type="number"
              value={units}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUnits(e.target.value)}
              placeholder="0"
              className="text-lg bg-white border-gray-200 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <Button
            onClick={handleCalculate}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium"
            size="lg"
          >
            Calcular
          </Button>

          <div className="space-y-1">
            <div className="text-sm font-medium">Resultado en pesos uruguayos:</div>
            <div className="text-2xl font-bold">
              ${" "}
              {result.toLocaleString("es-UY", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                useGrouping: true,
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

