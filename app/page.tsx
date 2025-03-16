import Converter from "@/components/Converter"
import Footer from "@/components/Footer"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function Home() {
  return (
    <TooltipProvider>
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#1E1B4B] text-white">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Indexa<span className="text-blue-400">+</span>
        </h1>
        <div className="text-white/70 text-center mb-8">
          <p className="text-lg">Conversor de Unidades Indexadas y</p>
          <p className="text-lg">Reajustables</p>
        </div>
        <Converter />
        <Footer />
      </main>
    </TooltipProvider>
  )
}

