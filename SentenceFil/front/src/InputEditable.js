const style = {
  ofFetch: {
    marginRight: '15px',
    marginTop: '15px',
  },
  ofInputEditable: {
    borderBottom: '2px solid lightgray',
    padding: '15px',
  },
  ofInputEditableTextarea: {
    fontSize: '17.5px',
    height: '150px',
    padding: '15px',
    resize: 'vertical',
    width: 'calc(100% - 30px)',
  },
}

export default function InputEditable(props) {
  function inputEdited() {
    let inputEditable = props.fill.inputEditable;
    let i = inputEditable.indexOf('\n=====');
    if (i > 0) {
      inputEditable = inputEditable.substring(0, i);
    }
    return inputEditable;
  }

  function fetched(response, is) {
    let inputClickables = [...response];
    let i = 0;
    for (let i = 0; i < inputClickables.length; i++) {
      inputClickables[i].i = i;
      inputClickables[i].is = is;
      inputClickables[i].selected = false;
    }
    return inputClickables;
  }

  function phrasesOfTheSame() {
    fetch(props.backend + '/chinese/phrases/of_the_same', {
      method: 'POST',
      body: JSON.stringify({
        input1: inputEdited(),
      })
    }).then((response) => response.json()).then((response) => {
      props.fill.setInputClickables(fetched(response, 'phraseOfTheSame'));
      // props.fill.setInput2(
      //   '<id></id>\n' +
      //   '\n<text></text>\n' +
      //   '\n<note>\n' +
      //   '\n</note>'
      // );
    })
  }

  function phrasesInTheSentence() {
    fetch(props.backend + '/chinese/phrases/in_the_sentence', {
      method: 'POST',
      body: JSON.stringify({
        input1: inputEdited(),
      })
    }).then((response) => response.json()).then((response) => {
      props.fill.setInputClickables(fetched(response, 'phraseInTheSentence'));
    })
  }

  let fetchInputClickablesWithPhrases = {
    phrases: phrasesOfTheSame,
    sentences: phrasesInTheSentence,
  }[props.fill.ing];

  function fetchInputClickablesWithSentences() {
    fetch(props.backend + '/chinese/sentences/matched_with', {
      method: 'POST',
      body: JSON.stringify({
        input1: inputEdited(),
      })
    }).then((response) => response.json()).then((response) => {
      console.log(response);
      props.fill.setInputClickables(fetched(response, 'sentencesMatchedWith'));
    })
  }

  return (
    <div style={style.ofInputEditable}>
      <textarea
        onChange={(e) => {props.fill.setInputEditable(e.target.value)}}
        style={style.ofInputEditableTextarea}
        value={props.fill.inputEditable}
      ></textarea>
      <div>
        <input
          onClick={() => {fetchInputClickablesWithPhrases()}}
          style={style.ofFetch}
          type="submit"
          value="fetch phrases"
        />
        {props.fill.ing === 'sentences' && (
          <input
            onClick={() => {fetchInputClickablesWithSentences(props.fill)}}
            style={style.ofFetch}
            type="submit"
            value="fetch sentences"
          />
        )}
      </div>
    </div>
  );
}
