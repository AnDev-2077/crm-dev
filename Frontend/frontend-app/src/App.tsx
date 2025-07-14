import { useEffect } from 'react'

import './App.css'
import { Button } from './components/ui/button';

function App() {

  useEffect(() => {
    console.log('App component mounted');
  }, []);

  return (
    
      
      <div>

        <Button variant="default">Click Me</Button>
      </div>
       


  )
}

export default App
