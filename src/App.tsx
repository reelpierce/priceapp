import Converter from './components/Converter'
import './App.css'

function App() {
  return (
    <div className="app">
      <main className="app-main">
        <Converter />
      </main>
      
      <footer className="app-footer">
        <p>Powered by free exchange rate API</p>
      </footer>
    </div>
  )
}

export default App
