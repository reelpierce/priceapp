import { useState } from 'react'
import Converter from './components/Converter'
import Exchange from './components/Exchange'
import Wallet from './components/Wallet'
import './App.css'

type View = 'converter' | 'exchange' | 'wallet';

function App() {
  const [activeView, setActiveView] = useState<View>('exchange');

  return (
    <div className="app">
      <main className="app-main">
        <div className="app-container">
          <div className="tabs">
            <button 
              className={`tab ${activeView === 'wallet' ? 'active' : ''}`}
              onClick={() => setActiveView('wallet')}
            >
              💰 Wallet
            </button>
            <button 
              className={`tab ${activeView === 'exchange' ? 'active' : ''}`}
              onClick={() => setActiveView('exchange')}
            >
              🔄 Exchange
            </button>
            <button 
              className={`tab ${activeView === 'converter' ? 'active' : ''}`}
              onClick={() => setActiveView('converter')}
            >
              💱 Convert
            </button>
          </div>

          <div className="view-container">
            {activeView === 'wallet' && <Wallet />}
            {activeView === 'exchange' && <Exchange />}
            {activeView === 'converter' && <Converter />}
          </div>
        </div>
      </main>
      
      <footer className="app-footer">
        <p>Powered by free exchange rate API</p>
      </footer>
    </div>
  )
}

export default App
