const style = {
  ofInputClickable: (inputClickable) => {
    return {
      backgroundColor: inputClickable.selected ? 'white' : 'gainsboro',
      border: '2px solid lightgray',
      marginBottom: '5px',
      padding: '0 5px 0 5px',
    }
  },
  ofInputClickables: {
    marginBottom: '0',
    overflowY: 'auto',
    padding: '15px',
  },
}

function Phrase(props) {  
  let note = props.phrase.note.split('\n');

  return (
    <div
      style={{lineHeight: '75%'}}
      title={props.phrase.id}
    >
      <p>
        <b style={{marginRight: '10px'}}>{props.phrase.text}</b>
        <span>{note[0]}</span>
      </p>
      {note.slice(1).map((n, i) => {
        return (
          <p key={i}>{n}</p>
        ); 
      })}
    </div>
  );
}

export default function InputClickables(props) {
  function clickMany(inputClickable) {
    let inputClickables = [...props.fill.inputClickables];
    inputClickables[inputClickable.i].selected = !inputClickables[inputClickable.i].selected;
    return inputClickables;
  }

  function clickOne(inputClickable) {
    let inputClickables = [...props.fill.inputClickables];
    for (let i = 0; i < inputClickables.length; i++) {
      if (inputClickables[i].i === inputClickable.i)
        inputClickables[i].selected = true;
      else
        inputClickables[i].selected = false;
    }
    return inputClickables;
    // fill.setInput2(
    //   '<id>' + phrase.id + '</id>\n' +
    //   '\n<text>' + phrase.text + '</text>\n' +
    //   '\n<note>\n' + phrase.note + '\n</note>'
    // );
  }

  function click(inputClickable) {
    let inputClickables = [];
    switch (inputClickable.is) {
      case 'phraseInTheSentence':
        inputClickables = clickMany(inputClickable);
        break;
      case 'phraseOfTheSame':
        inputClickables = clickOne(inputClickable);
        break;
    }
    props.fill.setInputClickables(inputClickables);
  }

  return (
    <div style={style.ofInputClickables}>
      {props.fill.inputClickables.map((inputClickables, i) => (
        <div
          key={'' + i}
          onClick={() => {click(inputClickables)}}
          style={style.ofInputClickable(inputClickables)}
        >
          {(() => {
            if (true) {
              return (
                <Phrase phrase={inputClickables}/>
              );
            }
          })()}
        </div>
      ))}
      <div style={{height: '15px'}}></div>
    </div>
  );
}
