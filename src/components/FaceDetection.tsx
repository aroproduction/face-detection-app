'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import * as blazeface from '@tensorflow-models/blazeface'

const FaceDetection: React.FC = () => {
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [model, setModel] = useState<blazeface.BlazeFaceModel | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [isVideoReady, setIsVideoReady] = useState(false)

  const loadModel = async () => {
    if (!model) {
      await tf.setBackend('webgl')
      await tf.ready()
      const loadedModel = await blazeface.load()
      setModel(loadedModel)
    }
  }

  const detectFaces = useCallback(async () => {
    if (webcamRef.current && webcamRef.current.video && model && isVideoReady) {
      const video = webcamRef.current.video
      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight

      webcamRef.current.video.width = videoWidth
      webcamRef.current.video.height = videoHeight

      if (canvasRef.current) {
        canvasRef.current.width = videoWidth
        canvasRef.current.height = videoHeight
      }

      const predictions = await model.estimateFaces(video, false)

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
          predictions.forEach(prediction => {
            const start = prediction.topLeft as [number, number]
            const end = prediction.bottomRight as [number, number]
            const size = [end[0] - start[0], end[1] - start[1]]

            ctx.beginPath()
            ctx.rect(start[0], start[1], size[0], size[1])
            ctx.lineWidth = 2
            ctx.strokeStyle = 'red'
            ctx.stroke()
          })
        }
      }
    }
  }, [model, isVideoReady])

  useEffect(() => {
    loadModel()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isDetecting && isVideoReady) {
      interval = setInterval(() => {
        detectFaces()
      }, 100)
    } else if ((!isDetecting || !isVideoReady) && interval) {
      clearInterval(interval)
      interval = null
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isDetecting, detectFaces, isVideoReady])

  const toggleDetection = () => {
    setIsDetecting(prev => !prev)
    setIsVideoReady(false)
  }

  const handleVideoReady = () => {
    setIsVideoReady(true)
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <button
        onClick={toggleDetection}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200 mb-4 z-10 relative"
      >
        {isDetecting ? 'Stop Detection' : 'Start Detection'}
      </button>
      <div className="relative aspect-w-4 aspect-h-3">
        {isDetecting && (
          <>
            <Webcam
              ref={webcamRef}
              onLoadedData={handleVideoReady}
              className="absolute top-0 left-0 w-full h-full object-cover"
              key={isDetecting ? 'detecting' : 'not-detecting'}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </>
        )}
      </div>
    </div>
  )
}

export default FaceDetection