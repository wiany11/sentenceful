import { ChangeInput2 } from './lib'

function Phrase(props) {  
  let note = props.phrase.note.split('\n');

  return (
    <div
      style={{
        lineHeight: '75%',
      }}
      title={props.phrase.id}
    >
      <p>
        <b
          style={{
            marginRight: '10px',
          }}
        >{props.phrase.text}</b>
        <span
        >{note[0]}</span>
      </p>
      {note.slice(1).map((n, i) => {
        return (
          <p key={i}>{n}</p>
        ); 
      })}
    </div>
  );
}

export default function Phrases(props) {
  let changeInput2 = {
    phrase: ChangeInput2.forPhrase,
    sentence: ChangeInput2.forSentence,
  }[props.filling];

  return (
    <div
      style={{
        marginBottom: '0',
        overflowY: 'auto',
        padding: '15px',
      }}
    >
      {props.fill.phrases.map((phrase, i) => (
        <div
          key={'' + i}
          onClick={() => {changeInput2(phrase, props.fill)}}
          style={{
            backgroundColor: phrase.selected ? 'white' : 'gainsboro',
            border: '2px solid lightgray',
            marginBottom: '5px',
            padding: '0 5px 0 5px',
          }}
        >
          <Phrase phrase={phrase}/>
        </div>
      ))}
      <div style={{height: '15px'}}></div>
    </div>
  );
}
