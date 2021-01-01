import React, {
  useEffect,
  useState
} from 'react';

import Phrase from './Phrase'

function SentenceFill() {
  const [note, setNote] = useState('');
  const [sentence, setSentence] = useState('');
  const [phrases, setPhrases] = useState([]);

  let fetchPhrases = () => {
    fetch("http://localhost:44400/phrases/in_the_sentence", {
      method: 'POST',
      body: JSON.stringify({
        sentence
      })
    }).then((response) => response.json()).then((response) => {
      let phrases = response.phrases;
      let i = 0;
      phrases.forEach((phrase) => {
        phrase.i = i++;
        phrase.selected = false;
      })
      setPhrases(response.phrases);
    })
  }

  useEffect(() => {
    console.log(phrases);
  }, [phrases]);
  
  return (
    <div>
      <div>
        <textarea
          placeholder={"sentence"}
          style={{
            padding: '15px',
            width: 'calc(100% - 30px)',
          }}
          onChange={(e) => {setSentence(e.target.value)}}
        >
        </textarea>
        <textarea
          placeholder={"note"}
          style={{
            padding: '15px',
            width: 'calc(100% - 30px)',
            marginBottom: '15px',
          }}
          onChange={(e) => {setNote(e.target.value)}}
        >
        </textarea>
      </div>
      <div>
        <input
          onClick={() => {fetchPhrases()}}
          style={{
            marginBottom: '15px',
            marginRight: '15px',
          }}
          type="submit"
          value="tokenize"
        />
      </div>
      <div>
        {phrases.map((phrase) => (
          <div
            key={phrase.id}
            onClick={() => {
              let phrases1 = [...phrases];
              phrases1[phrase.i].selected = !phrases1[phrase.i].selected;
              setPhrases(phrases1);
            }}
            style={{
              border: phrase.selected ? '1px solid red' : '1px solid lightgray',
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

export default SentenceFill;
