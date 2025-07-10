'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Simply redirect to dashboard
    router.push('/dashboard')
  }, [router])

  return null
}