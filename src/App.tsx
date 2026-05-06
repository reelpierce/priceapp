import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import Converter from './components/Converter'
import Exchange from './components/Exchange'
import Wallet from './components/Wallet'
import TransactionHistory from './components/TransactionHistory'
import Deposit from './components/Deposit'
import './App.css'

type View = 'converter' | 'exchange' | 'wallet' | 'history' | 'deposit' | 'auth';
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

  // Show auth modal when user clicks login/register
  if (activeView === 'auth') {
    return (
      <div className="app">
        <main className="app-main">
          <div className="auth-modal-overlay">
            <div className="auth-modal">
              <button 
                className="close-modal" 
                onClick={() => setActiveView('exchange')}
                aria-label="Close"
              >
                ×
              </button>
              {authView === 'login' ? (
                <Login 
                  onSwitchToRegister={() => setAuthView('register')}
                  onBack={() => setActiveView('exchange')}
                />
              ) : (
                <Register 
                  onSwitchToLogin={() => setAuthView('login')}
                  onBack={() => setActiveView('exchange')}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <main className="app-main">
        <div className="app-container">
          {user ? (
            <div className="user-header">
              <div className="user-info">
                <span className="user-name">👋 {user.fullName}</span>
                <span className="user-email">{user.email}</span>
              </div>
              <button onClick={logout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <div className="guest-header">
              <div className="app-title">💱 Price App</div>
              <div className="auth-buttons">
                <button 
                  onClick={() => {
                    setAuthView('login');
                    setActiveView('auth');
                  }} 
                  className="login-button-header"
                >
                  Login
                </button>
                <button 
                  onClick={() => {
                    setAuthView('register');
                    setActiveView('auth');
                  }} 
                  className="register-button-header"
                >
                  Register
                </button>
              </div>
            </div>
          )}

          <div className="tabs">
            {user && (
              <button 
                className={`tab ${activeView === 'wallet' ? 'active' : ''}`}
                onClick={() => setActiveView('wallet')}
              >
                💰 Wallet
              </button>
            )}
            <button 
              className={`tab ${activeView === 'deposit' ? 'active' : ''}`}
              onClick={() => setActiveView('deposit')}
            >
              💳 Deposit
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
            {user && (
              <button 
                className={`tab ${activeView === 'history' ? 'active' : ''}`}
                onClick={() => setActiveView('history')}
              >
                📊 History
              </button>
            )}
          </div>

          <div className="view-container">
            {activeView === 'wallet' && user && <Wallet />}
            {activeView === 'deposit' && (
              <Deposit 
                onLoginRequired={() => {
                  setAuthView('login');
                  setActiveView('auth');
                }}
              />
            )}
            {activeView === 'exchange' && (
              <Exchange 
                onLoginRequired={() => {
                  setAuthView('login');
                  setActiveView('auth');
                }}
              />
            )}
            {activeView === 'converter' && <Converter />}
            {activeView === 'history' && user && <TransactionHistory />}
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
