import { FetchPhrases } from './lib'


export default function Input1(props) {
  let fetchPhrases = {
    'phrase': FetchPhrases.forPhrase,
    'sentence': FetchPhrases.forSentence,
  }[props.filling];

  return (
    <div 
      style={{
        borderBottom: '2px solid lightgray',
        padding: '15px',
      }}
    >
      <textarea
        onChange={(e) => {props.fill.setInput1(e.target.value)}}
        style={{
          fontSize: '17.5px',
          padding: '15px',
          resize: 'vertical',
          width: 'calc(100% - 30px)',
        }}
        value={props.fill.input1}
      ></textarea>
      <input
        onClick={() => {fetchPhrases(props.fill)}}
        style={{
          marginRight: '15px',
          marginTop: '15px',
        }}
        type="submit"
        value="fetch phrases"
      />
    </div>
  );
}
