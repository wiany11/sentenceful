import React, {
  useState
} from 'react';

import Phrase from './Phrase'

function PhraseFill() {
  const [note, setNote] = useState('');
  const [phrase, setPhrase] = useState('');
  const [phrases, setPhrases] = useState([]);
  const [lastId, setLastId] = useState(-1);
  
  let phrases__insert = () => {
    fetch("http://localhost:44400/phrases/insert", {
      method: 'POST',
      body: JSON.stringify({
        lastId,
        note,
        phrase,
      })
    });
  }

  let phrases__of_the_same = () => {
    fetch("http://localhost:44400/phrases/of_the_same", {
      method: 'POST',
      body: JSON.stringify({
        phrase
      })
    }).then((response) => response.json()).then((response) => {
      setLastId(response.lastId);
      setPhrases(response.phrases);
    })
  }

  return (
    <div>
      <div>
        <input 
          onChange={(e) => {
            setLastId(-1);
            setPhrase(e.target.value);
            setPhrases([]);
          }}
          placeholder={"phrase"}
          style={{
            width: '100%',
          }}
          type="text"
        />
        <textarea
          onChange={(e) => {setNote(e.target.value)}}
          placeholder={"note"}
          style={{
            width: '100%',
            marginBottom: '15px',
          }}
        >
        </textarea>
      </div>
      <div>
        <input
          onClick={() => {phrases__of_the_same()}}
          style={{
            marginBottom: '15px',
            marginRight: '15px',
          }}
          type="submit"
          value="phrases of the same"
        />
        {(() => {
          if (lastId > -1) {
            return (
              <input
                onClick={() => {phrases__insert()}}
                type="submit"
                value="insert the phrase"
              />
            );
          }
        })()}
      </div>
      <div>
        {phrases.map((phrase) => (
          <div 
            key={phrase.id}
            style={{
              border: '1px solid lightgray',
              marginBottom: '15px',
              padding: '0 5px 0 5px',
            }}
          >
            <Phrase phrase={phrase} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PhraseFill;
