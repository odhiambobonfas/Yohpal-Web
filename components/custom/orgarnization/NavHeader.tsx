"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import Image from "next/image"
export default function NavHeader() {
  const [isScrolled, setScrolled] = useState(false)
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      setScrolled(isScrolled)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`w-full p-3 fixed top-0 z-20 transition-all duration-300
        ${isScrolled ? "backdrop-blur-lg shadow-sm" : "bg-transparent"}`}
    >
      <div>
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo_circular.png"
            className="size-8 shrink-0"
            width={100}
            height={100}
            alt="Yohpals logo"
          />
          <span className="font-black text-2xl">Yohpal</span>
        </Link>
      </div>
    </header>
  )
}
