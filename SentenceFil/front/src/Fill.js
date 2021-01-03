import React, {
  useEffect,
  useState
} from 'react';

import Input1 from './Input1'
import Input2 from './Input2'
import Phrases from './Phrases'
import { CheckInput2 } from './lib'

const style = {
  divLeft: {
    position: 'absolute',
    top: 0,
    right: '50%',
    bottom: 0,
    left: 0,

    borderRight: '1px solid lightgray',
    display: 'flex',
    flexDirection: 'column',
  },
  divRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: '50%',
    
    borderLeft: '1px solid lightgray',
    display: 'flex',
    flexDirection: 'column',
  },
}

export default function Fill(props) {
  let checkInput2 = {
    'phrase': CheckInput2.forPhrase,
    'sentence': CheckInput2.forSentence,
  }[props.filling];

  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [input2Error, setInput2Error] = useState('');
  const [phrases, setPhrases] = useState([]);

  let fill = {
    input1, setInput1,
    input2, setInput2,
    input2Error, setInput2Error,
    phrases, setPhrases,
  }

  useEffect(() => {
    setInput1('你不要再保护我了，那是我作为朋友的拜托。\n# 作为 || 朋友');
  }, []);

  useEffect(() => {
    checkInput2(fill);
  }, [input2]);

  return (
    <div>
      <div style={style.divLeft}>
        <Input1
          fill={fill}
          filling={props.filling}
          // savedInput2ForPhrase={savedInput2ForPhrase}
          // savedInput2ForSentence={savedInput2ForSentence}
          // setChangingInput2For={setChangingInput2For}
        />
        <Phrases
          fill={fill}
          filling={props.filling}
        />
      </div>
      <Input2
        fill={fill}
        filling={props.filling}
        style={style.divRight}
      />
    </div>
  )
}