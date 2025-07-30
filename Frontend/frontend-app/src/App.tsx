import { useEffect } from 'react'

import './App.css'

function App() {

  useEffect(() => {
    console.log('App component mounted');
  }, []);

  return (
      <div>
        <span>Bienvenido</span>
      </div>
  )
}

export default App
