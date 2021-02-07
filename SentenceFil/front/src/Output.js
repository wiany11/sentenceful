const style = {
  div1: {
    flexGrow: '1',
    // margin: '15px',
    overflowY: 'auto',
    padding: '15px',
  },
  div2: {
    color: 'red',
    marginBottom: '15px',
    padding: '0 15px 0 15px',
  },
  div3: {
    padding: '0 15px 15px 15px',
  },
  ofButton: {
    marginRight: '15px',
  },
  ofOutput: {
    fontSize: '17.5px',
    height: 'calc(100% - 30px)',
    padding: '15px',
    resize: 'vertical',
    width: 'calc(100% - 30px)',
  },
};

export default function Output(props) {
  function insertOrUpdateToFillPhrases() {
    fetch("http://sentenceful.cafe24.com:44400/chinese/phrases/insert_or_update", {
      method: 'POST',
      body: JSON.stringify({
        input2: props.fill.input2,
        origin: 'wiany11@gmail.com',
      })
    }).then((response) => response.json()).then((response) => {
      console.log(response);
    });
  }

  function insertOrUpdateToFillSentences() {
    if (props.fill.outputError !== '')
      return;

    fetch("http://sentenceful.cafe24.com:44400/chinese/sentences/insert_or_update", {
      method: 'POST',
      body: JSON.stringify({
        input2: props.fill.input2,
        origin: 'wiany11@gmail.com',
      })
    }).then((response) => response.json()).then((response) => {
      if ('error' in response) {
        props.fill.outOutputError(response.error);
      } else {
        alert('Inserted');
      }
    });      
  }

  let insertOrUpdate = {
    phrases: insertOrUpdateToFillPhrases,
    sentences: insertOrUpdateToFillSentences,
  }[props.fill.ing];

  return (
    <div style={props.style}>
      <div style={style.div1}>
        <textarea
          onChange={(e) => {props.fill.setOutput(e.target.value)}}
          style={style.ofOutput}
          value={props.fill.output}
        ></textarea>
      </div>
      {(() => {
        if (props.fill.outputError !== '') {
          return (
            <div style={style.div2}>
              {props.fill.outputError}
            </div>
          )
        }
      })()}
      <div style={style.div3}>
        <input
          onClick={() => {insertOrUpdate(props.fill)}}
          style={style.ofButton}
          type="submit"
          value={"insert or update"}
        />
      </div>
    </div>
  );
}
