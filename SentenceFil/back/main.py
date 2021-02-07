from __init__ import app
from fastapi import Request

import json
import sys
import uvicorn

import db


class Trie:
    class node:
        def __init__(self, k):
            self.k = k
            self.next_for = {}
            self.vals = []

    def __init__(self):
        self.root = Trie.node('')

    def find(self, key):
        found = []

        node = self.root
        for i in range(len(key)):
            if key[i] not in node.next_for:
                break
            node = node.next_for[key[i]]
            found.extend(node.vals)

        return found

    def insert(self, key, val):
        node = self.root
        for i in range(len(key)):
            if key[i] not in node.next_for:
                node.next_for[key[i]] = Trie.node(key[i])
            node = node.next_for[key[i]]

        
        for i in range(len(node.vals)):
            if node.vals[i]['id'] == val['id']:
                node.vals[i] = val
                return         
        node.vals.append(val)


class Parse:
    def phrase(phrase):
        parsed = {}
        error = ''
        for line in phrase.split('\n'):
            line = line.strip()
            if line.startswith('<id>'):
                if not line.endswith('</id>'):
                    return {}, '[Invalid format] ' + line
                parsed['id'] = line[4:-5]
            elif line.startswith('<text>'):
                if not line.endswith('</text>'):
                    return {}, '[Invalid format] ' + line
                parsed['text'] = line[6:-7]
            elif line.startswith('<note>'):
                if 'note0' in parsed:
                    return {}, '[Invalid format] ' + line
                parsed['note0'] = []
            elif line.startswith('</note>'):
                if 'note0' not in parsed:
                    return {}, '[Invalid format] ' + line
                parsed['note1'] = parsed.pop('note0')
            else:
                if 'note0' in parsed:
                    parsed['note0'].append(line)
                else:
                    if line:
                        return {}, '[Invalid format] ' + line
                    else:
                        continue
        if parsed['note1']:
            for i in range(len(parsed['note1'])):
                if parsed['note1'][i]:
                    break
            for j in range(len(parsed['note1']) - 1, -1, -1):
                if parsed['note1'][j]:
                    break
            if i == j:
                parsed['note1'] = []
            else:
                parsed['note1'] = parsed['note1'][i:j + 1]
        parsed['note'] = '\n'.join(parsed.pop('note1'))

        return parsed, ''
                

class Phrases:
    class Chinese:
        def __init__(self):
            self.dbc = db.Chinese()
            self.trie = Trie()
    
            for row in self.dbc.select('phrases', ['id', 'text', 'note']):
                self.trie.insert(row['text'], row)

        def find(self, text):
            return self.trie.find(text)

        def insert(self, row):
            self.trie.insert(row['text'], row)


class Route:
    class Chinese:
        def __call__(self):
            @self.app.post(self.root + '/phrases/in_the_sentence')
            async def phrases__in_the_sentence(request: Request):
                j = await request.json()

                response = {'phrases': []}
                
                for start in range(len(j['input1'])):
                    found0 = self.phrases.find(j['input1'][start:])
                    for f in found0:
                        f['start'] = start
                    response['phrases'].extend(found0)

                return response

            @self.app.post(self.root + '/phrases/insert_or_update')
            async def phrases__insert_or_update(request: Request):
                j = await request.json()
                
                row, error = Parse.phrase(j['input2'])

                dbc = db.Chinese(commit=True)
                if 'id' in row:
                    dbc.update('phrases',
                        ['id', 'text', 'note', 'origin'],
                        [row['id'], row['text'], row['note'], j['origin']],
                        'id = "{}"'.format(row['id'])
                    )
                else:
                    next_id = 1
                    for row0 in dbc.select('phrases', ['id'], 'text = "{}"'.format(row['text'])):
                        next_id = max(next_id, int(row0['id'][row0['id'].index('/') + 1:]) + 1)
                    row['id'] = '{}/{}'.format(row['text'], next_id)

                    dbc.insert('phrases',
                        ['id', 'text', 'note', 'origin'],
                        [row['id'], row['text'], row['note'], j['origin']]
                    )
                
                self.phrases.insert(row)

                return {}

            @self.app.post(self.root + '/phrases/of_the_same')
            async def phrases__of_the_same(request: Request):
                j = await request.json()

                response = {'phrases': []}

                phrases = j['input1'].split('\n')
                if not phrases:
                    return response

                where = ' OR '.join(['text = "{}"'.format(p.strip()) for p in phrases])
                for row in db.Chinese().select('phrases', ['id', 'text', 'note'], where):
                    response['phrases'].append(row)

                return response

            @self.app.post(self.root + '/sentences/insert_or_update')
            async def sentences__insert_or_update(request: Request):
                j = await request.json()

        def __init__(self, app):
            self.phrases = Phrases.Chinese()
            self.root = '/chinese'

            self.app = app

    def __call__(self):
        Route.Chinese(self.app)()

        uvicorn.run(self.app, host='0.0.0.0', port=44400)

    def __init__(self, app):
        self.app = app


if __name__ == '__main__':
    if sys.argv[1] == 'create':
        db.Chinese().create()
    elif sys.argv[1] == 'start':
        Route(app)()

