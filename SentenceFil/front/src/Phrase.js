export default function Phrase(props) {  
  return (
    <div>
      <p>
        <span style={{
          color: 'lightgray'
        }}>{props.phrase.id}</span>&nbsp; &nbsp;
        <span>{props.phrase.phrase}</span>
      </p>
      {props.phrase.note.split('\n').map((n, i) => {
        return (
          <p key={i}>{n}</p>
        ); 
      })}
    </div>
  );
}
