import { InsertOrUpdate } from './lib'

const style = {
  div1: {
    flexGrow: '1',
    overflowY: 'auto',
    padding: '15px',
  },
  div2: {
    color: 'red',
    padding: '0 15px 15px 15px',
  },
  div3: {
    padding: '0 15px 15px 15px',
  },
  input2: {
    fontSize: '17.5px',
    height: 'calc(100% - 30px)',
    padding: '15px',
    resize: 'vertical',
    width: 'calc(100% - 30px)',
  },
};

export default function Input2(props) {
  let insertOrUpdate = {
    phrase: InsertOrUpdate.forPhrase,
    sentence: InsertOrUpdate.forSentence,
  }[props.filling];

  return (
    <div style={props.style}>
      <div style={style.div1}>
        <textarea
          onChange={(e) => {props.fill.setInput2(e.target.value)}}
          style={style.input2}
          value={props.fill.input2}
        ></textarea>
      </div>
      {props.fill.input2Error !== '' && (
        <div style={style.div2}>
          {props.fill.input2Error}
        </div>
      )}
      <div style={style.div3}>
        <input
          onClick={() => {insertOrUpdate(props.fill)}}
          style={{
            marginRight: '15px',
          }}
          type="submit"
          value={"insert or update"}
        />
      </div>
    </div>
  );
}
