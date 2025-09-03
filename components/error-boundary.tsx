"use client"

import React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
          <div className="max-w-md w-full">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                Une erreur s'est produite dans l'application FEG.
                {this.state.error && (
                  <details className="mt-2 text-sm">
                    <summary className="cursor-pointer">Détails de l'erreur</summary>
                    <pre className="mt-2 whitespace-pre-wrap text-xs">{this.state.error.message}</pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => window.location.reload()}
              className="w-full mt-4 bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recharger l'application
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
