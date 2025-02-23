import { Github, Linkedin } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="mt-8 text-center space-y-4 p-4">
      <p className="text-sm text-white/70">© 2025 Developed by Cristopher Paiva</p>
      <div className="flex justify-center gap-4">
        <Link href="https://github.com/cristopherpds" target="_blank" className="text-white/70 hover:text-white transition-colors">
          <Github className="w-5 h-5" />
          <span className="sr-only">GitHub</span>
        </Link>
        <Link href="https://www.linkedin.com/in/pdscristopher" target="_blank" className="text-white/70 hover:text-white transition-colors">
          <Linkedin className="w-5 h-5" />
          <span className="sr-only">LinkedIn</span>
        </Link>
      </div>
    </footer>
  )
}

