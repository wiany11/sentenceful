import React, {
  useEffect,
  useState
} from 'react';

import './App.css';

import PhraseFill from './PhraseFill'
import SentenceFill from './SentenceFill'

function App() {
  const [filling, setFilling] = useState('');

  useEffect(() => {
    console.log(filling);
  }, [filling]);

  return (
    <div>
      {(() => {
        if (filling === 'phrase') {
          return (
            <PhraseFill />
          )
        } else if (filling === 'sentence') {
          return (
            <SentenceFill />
          )
        } else {
          return (
            <ul>
              <li onClick={() => {setFilling('phrase')}}>
                Filling phrase
              </li>
              <li onClick={() => {setFilling('sentence')}}>
                Filling sentence
              </li>
            </ul>
          )
        }
      })()}
    </div>
  );
}

export default App;
