function input2From(input1, phrases) {
    return '<source-language>\n' +
        input1+
        '\n</source-language>\n' +
        '\n<phrases>\n' +
        phrases.map(p => '@[' + p.start + ',' + (p.start + p.text.length) + ') ' + p.id).join('\n') +
        '\n</phrases>\n' +
        '\n<target-language>\n' +
        '\n</target-language>';
}

export class FetchPhrases {
    static forPhrase(fill) {
        fetch("http://localhost:44400/phrases/chinese/of_the_same", {
            method: 'POST',
            body: JSON.stringify({
                input1: fill.input1
            })
        }).then((response) => response.json()).then((response) => {
            let i = 0;
            response.phrases.forEach((phrase) => {
                phrase.i = i++;
                phrase.selected = false;
            });

            fill.setPhrases(response.phrases);
            fill.setInput2(
                '<id></id>\n' +
                '\n<text></text>\n' +
                '\n<note>\n' +
                '\n</note>'
            );
        }) 
    }

    static forSentence(fill) {
        fetch("http://localhost:44400/phrases/chinese/in_the_sentence", {
            method: 'POST',
            body: JSON.stringify({
                input1: fill.input1
            })
        }).then((response) => response.json()).then((response) => {
            let i = 0;
            response.phrases.forEach((phrase) => {
                phrase.i = i++;
                phrase.selected = false;
            });

            fill.setPhrases(response.phrases);
            fill.setInput2(input2From(fill.input1, []));
        })
    }    
}

export class CheckInput2 {
    static forPhrase(fill) {
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
            if (phrase.id == phraseId) {
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

    static forSentence() {
        // setInput2ForPhraseError('');
        // let input2 = input2ForPhrase.trim();
    }
}

export class ChangeInput2 {
    static forPhrase(phrase, fill) {
        fill.setInput2(
            '<id>' + phrase.id + '</id>\n' +
            '\n<text>' + phrase.text + '</text>\n' +
            '\n<note>\n' + phrase.note + '\n</note>'
        );
    }

    static forSentence(phrase, fill) {
        let newPhrases = [...fill.phrases];
        newPhrases[phrase.i].selected = !newPhrases[phrase.i].selected;

        fill.setPhrases(newPhrases);
        fill.setInput2(input2From(fill.input1, newPhrases.filter(p => p.selected)));
    }
}

export class InsertOrUpdate {
    static forPhrase(fill) {
        fetch("http://localhost:44400/phrases/chinese/insert_or_update", {
            method: 'POST',
            body: JSON.stringify({
                input2: fill.input2,
                origin: 'wiany11@gmail.com',
            })
        }).then((response) => response.json()).then((response) => {
            console.log(response);
        });
    }

    static forSentence(fill){
        fetch("http://localhost:44400/sentences/chinese/insert_or_update", {
            method: 'POST',
            body: JSON.stringify({
                input2: fill.input2,
                origin: 'wiany11@gmail.com',
            })
        }).then((response) => response.json()).then((response) => {
            console.log(response);
        });      
    }
}