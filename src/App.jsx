// src/App.jsx
import React, { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Vite + React</h1>
      <button onClick={() => setCount(count + 1)}>Count is {count}</button>
    </>
  )
}

export default App
