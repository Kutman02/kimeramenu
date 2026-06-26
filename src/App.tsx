import { Suspense, lazy, useEffect, useState } from 'react'
import { HomePage } from './pages/HomePage'

const AdminPage = lazy(async () => {
  const module = await import('./pages/AdminPage')
  return { default: module.AdminPage }
})

function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname)

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  if (pathname.startsWith('/admin')) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <p className="text-gray-700 text-sm">Loading admin panel...</p>
          </div>
        }
      >
        <AdminPage />
      </Suspense>
    )
  }

  return <HomePage />
}

export default App
