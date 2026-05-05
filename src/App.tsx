import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import Converter from './components/Converter'
import Exchange from './components/Exchange'
import Wallet from './components/Wallet'
import './App.css'

type View = 'converter' | 'exchange' | 'wallet';
type AuthView = 'login' | 'register';

function AppContent() {
  const [activeView, setActiveView] = useState<View>('exchange');
  const [authView, setAuthView] = useState<AuthView>('login');
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="app">
        <main className="app-main">
          <div className="loading-screen">Loading...</div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app">
        <main className="app-main">
          {authView === 'login' ? (
            <Login onSwitchToRegister={() => setAuthView('register')} />
          ) : (
            <Register onSwitchToLogin={() => setAuthView('login')} />
          )}
        </main>
        <footer className="app-footer">
          <p>Powered by free exchange rate API</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="app">
      <main className="app-main">
        <div className="app-container">
          <div className="user-header">
            <div className="user-info">
              <span className="user-name">👋 {user.fullName}</span>
              <span className="user-email">{user.email}</span>
            </div>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>

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
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
