import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ErrorBoundary } from 'react-error-boundary'
import { AlertTriangle, RotateCw } from 'lucide-react'
import { Button } from './components/ui/button.tsx'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="min-h-screen flex items-center justify-center bg-background text-foreground flex-col gap-4">
      <AlertTriangle className="w-16 h-16 text-destructive" />
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <pre className="text-sm text-destructive bg-secondary p-4 rounded-md">{error.message}</pre>
      <Button onClick={resetErrorBoundary}>
        <RotateCw className="mr-2 h-4 w-4" /> Try again
      </Button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
    <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
