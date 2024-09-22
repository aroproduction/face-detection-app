'use client'

import { useState, useEffect } from 'react'
import FaceDetection from '../components/FaceDetection'

export default function Home() {
  const [isModelLoaded, setIsModelLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsModelLoaded(true), 3000) // Assume model loads in 3 seconds
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 md:p-16 lg:p-24">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Live Face Detection</h1>
      <div className="w-full max-w-2xl">
        {isModelLoaded ? (
          <FaceDetection />
        ) : (
          <p className="text-center text-lg">Loading face detection model...</p>
        )}
      </div>
    </main>
  )
}