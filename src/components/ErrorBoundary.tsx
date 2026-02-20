import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Mannah Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-6">
          <div className="bg-surface rounded-3xl p-8 max-w-md text-center shadow-lg">
            <div className="text-5xl mb-4">😵</div>
            <h1 className="text-xl font-extrabold text-text mb-2">Something went wrong</h1>
            <p className="text-sm text-text-light mb-4">
              {this.state.error?.message ?? 'An unexpected error occurred'}
            </p>
            <pre className="text-xs text-left bg-gray-100 rounded-xl p-3 mb-4 overflow-auto max-h-40 text-danger">
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.href = '/'
              }}
              className="bg-primary text-white font-bold px-6 py-3 rounded-2xl"
            >
              Reload App
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
