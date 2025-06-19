import React from 'react'
import { useParams } from 'react-router-dom'

export default function ClientSession() {
  const { sessionId } = useParams<{ sessionId: string }>()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Client Session
        </h1>
        <p className="text-gray-600">
          Session ID: {sessionId}
        </p>
        <p className="text-gray-500 mt-4">
          This page would show the client's form filling session in real-time.
        </p>
      </div>
    </div>
  )
}