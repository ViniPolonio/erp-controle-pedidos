import React, { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <h1>Vite + React</h1>
      <button onClick={() => setCount(count + 1)}>Count is {count}</button>
    </div>
  )
}

export default App
