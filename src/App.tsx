import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <AppRoutes />
      </div>
    </BrowserRouter>
  )
}