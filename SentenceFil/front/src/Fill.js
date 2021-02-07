import React, {
  useEffect,
  useState
} from 'react';

import InputClickables from './InputClickables'
import InputEditable from './InputEditable'
import Output from './Output'

const style = {
  ofInput: {
    position: 'absolute',
    top: 0,
    right: '50%',
    bottom: 0,
    left: 0,

    borderRight: '1px solid lightgray',
    display: 'flex',
    flexDirection: 'column',
  },
  ofOutput: {
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
  const [inputEditable, setInputEditable] = useState('');
  const [inputClickables, setInputClickables] = useState([]);
  const [output, setOutput] = useState('');
  const [outputError, setOutputError] = useState('');
  const [outputParsed, setOutputParsed] = useState({});

  function toFillPhrases(fill) {
    fill.setInput2Error('');

    let input2 = fill.input2.trim();
    if (input2 === '') {
      fill.setInput2Error('Empty input');
      return;
    }

    let phrases = [...fill.phrases];

    let phraseId = '';
    let i = input2.indexOf('<id>');
    if (i > -1) {
      i += 4;
      let j = input2.indexOf('</id>', i);
      if (j > -1) {
        phraseId = input2.substring(i, j);
      }
    }

    let nSelected = 0;
    phrases.forEach((phrase) => {
      if (phrase.id === phraseId) {
        phrase.selected = true;
        nSelected++;
      } else {
        phrase.selected = false;
      }
    });

    if (phraseId !== '' && nSelected === 0) {
      fill.setInput2Error('Unknown ID');
    }

    fill.setPhrases(phrases);
  }

  function toFillSentences() {
    setOutputError('');

    let sourceLang = inputEditable;
    let targetLang = '';
    let i = sourceLang.indexOf('=====');
    if (i > -1) {
      targetLang = sourceLang.substring(i + 5);
      sourceLang = sourceLang.substring(0, i);
    }
    sourceLang = sourceLang.trim();
    // if (sourceLang === '') {
    //   setOutputError('No value in source language...');
    // }

    let note = '';
    i = targetLang.indexOf('=====');
    if (i > -1) {
      note = targetLang.substring(i + 5);
      targetLang = targetLang.substring(0, i);
    }
    note = note.trim();
    targetLang = targetLang.trim();
    // if (targetLang === '') {
    //   setOutputError('No value in target language...');
    // }

    let output = '' +
      '<source-language>\n' +
      sourceLang +
      '\n</source-language>\n' +
      '\n<phrases>\n' +
      inputClickables.filter(ic => ic.selected).map(p => '@[' + p.start + ',' + (p.start + p.text.length) + ') ' + p.id).join('\n') +
      '\n</phrases>\n' +
      '\n<target-language>\n' +
      targetLang +
      '\n</target-language>\n' +
      '\n<note>\n' +
      note +
      '\n</note>\n';

    setOutput(output);
  }

  function parseOutputtoFillSentences() {
    for (let tag of ['source-language', 'target-language']) {
      let i = output.indexOf(`<${tag}>`);
      let j = output.indexOf(`</${tag}>`);
      console.log(i, `<${tag}>`);
      console.log(j, `</${tag}>`);
      if (i < 0 || j < 0) {
        setOutputError(`No <${tag}>`);
        return;
      }

      i += tag.length + 2;
      let v = output.substring(i, j).trim();
      console.log(tag, i, j, v);
      if (v === '') {
        setOutputError(`No value in <${tag}>`);
        return;
      }
    }
  }

  let createOutput = {
    phrases: toFillPhrases,
    sentences: toFillSentences,
  }[props.filling];

  let fill = {
    ing: props.filling,
    inputEditable, setInputEditable,
    inputClickables, setInputClickables,
    outputError,
    output, setOutput
  };

  useEffect(() => {
    setInputEditable('你不要再保护我了，那是我作为朋友的拜托。\n=====\n');
  }, []);

  useEffect(() => {
    createOutput();
  }, [inputEditable]);

  useEffect(() => {
    createOutput();
  }, [inputClickables]);

  useEffect(() => {
    parseOutputtoFillSentences();
  }, [output]);

  return (
    <div>
      <div style={style.ofInput}>
        <InputEditable
          backend={props.backend}
          fill={fill}
        />
        <InputClickables
          backend={props.backend}
          fill={fill}
        />
      </div>
      <Output
        backend={props.backend}
        fill={fill}
        style={style.ofOutput}
      />
    </div>
  );
}