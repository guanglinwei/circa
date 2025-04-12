import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { auth, db } from '../firebase';
import './App.css'
import { collection, getDocs } from 'firebase/firestore';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <div className='mt-5 text-amber-400'>Testing tailwind</div>
      <button onClick={() => console.log(auth.currentUser)}>asjdlfkajsdlf</button>
      <button onClick={() => {
        getDocs(collection(db, 'users')).then((value) => {
            console.log(value.docs.map(doc => doc.data()));
        }).catch((err) => console.log(err));
      }}>whats in db</button>
    </>
  )
}

export default App
