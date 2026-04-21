import Converter from './components/Converter'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>💱 Price App</h1>
        <p>Quick Naira to Dollar Converter</p>
      </header>
      
      <main className="app-main">
        <Converter />
      </main>
      
      <footer className="app-footer">
        <p>Real-time rates • Free API • No limits</p>
      </footer>
    </div>
  )
}

export default App
