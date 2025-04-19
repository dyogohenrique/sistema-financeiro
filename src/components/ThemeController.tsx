"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { FaSun, FaMoon } from "react-icons/fa"

export function ThemeController() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    console.log("Tema atual:", theme)
    console.log("Tema resolvido:", resolvedTheme)
  }, [theme, resolvedTheme])

  if (!mounted) {
    return null
  }

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "night" ? "corporate" : "night"
    console.log("Alternando tema para:", newTheme)
    setTheme(newTheme)
  }

  return (
    <div className="fixed top-4 right-4">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full bg-base-200 hover:bg-base-300 transition-colors"
        aria-label="Alternar tema"
      >
        {resolvedTheme === "night" ? (
          <FaSun className="w-5 h-5 text-yellow-500" />
        ) : (
          <FaMoon className="w-5 h-5 text-gray-700" />
        )}
      </button>
    </div>
  )
}
