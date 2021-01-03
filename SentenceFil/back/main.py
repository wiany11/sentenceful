from __init__ import app
from fastapi import Request

import json
import mariadb
import sys
import uvicorn


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


class database:
    class create:
        def __call__(self):
            self.phrases()

            self.db.conn.commit()

        def __del__(self):
            self.crsr.close()

        def __init__(self):
            self.db = database()
            self.crsr = self.db.conn.cursor()

        def phrases(self):
            self.crsr.execute('DROP TABLE IF EXISTS phrases__chinese')
            self.crsr.execute(
                'CREATE TABLE phrases__chinese ('
                '    `key`  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,'
                '    id     VARCHAR(32) NOT NULL UNIQUE,'
                '    text   VARCHAR(32) NOT NULL,'
                '    note   TEXT,'
                '    origin VARCHAR(32) NOT NULL, '
                'INDEX (text)'
                ')'
            )

            for l in open('rsc/cedict_ts.jsonl'):
                j = json.loads(l)
                self.crsr.execute("INSERT INTO phrases__chinese (id, text, note, origin) VALUES (?, ?, ?, ?)", (
                    j['id'].encode('utf-8'),
                    j['text'].encode('utf-8'),
                    j['note'].encode('utf-8'),
                    j['origin'].encode('utf-8')
                ))

        def sentences(self):
            self.crsr.execute('DROP TABLE IF EXISTS sentences__chinese')
            self.crsr.execute(
                'CREATE TABLE sentences__chinese ('
                '    `key`       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,'
                '    source_lang TEXT NOT NULL,'
                '    target_lang TEXT NOT NULL,'
                '    phrase_id   TEXT NOT NULL, FULLTEXT(phrase_id),'
                '    phrase_text TEXT NOT NULL, FULLTEXT(phrase_text)'
                ') ENGINE=MyISAM'
            )

    class selection:
        def __call__(self, where):
            self.crsr.execute(
                'SELECT ' + ', '.join(self.columns) +
                ' FROM ' + self.table +
                ' WHERE ' + where
            )
            return self

        def __del__(self):
            self.crsr.close()

        def __init__(self, db, table, columns):
            self.db = db
            self.table = table
            self.columns = columns
            self.crsr = self.db.conn.cursor()

        def __iter__(self):
            return self

        def __next__(self):
            row = self.fetchone()
            if row:
                return row
            else:
                raise StopIteration

        def fetchone(self):
            row = self.crsr.fetchone()
            if row:
                return {self.columns[i]: row[i] for i in range(len(self.columns))}
            else:
                return None

    def __del__(self):
        if self.commit:
            self.conn.commit()    
        self.conn.close()

    def __init__(self, commit=False):
        # https://mariadb.com/kb/en/setting-character-sets-and-collations/
        # https://mariadb.com/kb/en/supported-character-sets-and-collations/
        # CREATE DATABASE sentenceful
        #     CHARACTER SET = 'utf8mb4'
        #     COLLATE = 'utf8mb4_bin'
        self.commit = commit

        self.conn = mariadb.connect(
            user='ghchoi',
            password='4tk4ahrfkd!!',
            host='127.0.0.1',
            port=3306,
            database='sentenceful'
        )

    def insert(self, table, columns, values):
        crsr = self.conn.cursor()
        crsr.execute(
            'INSERT INTO ' + table + ' (' +
            ', '.join(columns) + ') VALUE (' +
            ', '.join(['?'] * len(values)) + ')', values
        )
        crsr.close()

    def select(self, table, columns, where='1'):
        return database.selection(self, table, columns)(where)

    def update(self, table, columns, values, where):
        crsr = self.conn.cursor()
        crsr.execute(
            'UPDATE ' + table + ' SET ' +
            ', '.join(['{} = ?'.format(c) for c in columns]) + ' WHERE ' + where, values
        )
        crsr.close()


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
            self.db = database()
            self.trie = Trie()
    
            for row in self.db.select('phrases__chinese', ['id', 'text', 'note']):
                self.trie.insert(row['text'], row)


def get_and_post(app1):
    phrases = {
        'chinese': Phrases.Chinese()
    }
            
    @app1.post('/phrases/chinese/in_the_sentence')
    async def phrases__chinese__in_the_sentence(request: Request):
        j = await request.json()

        response = {'phrases': []}
        
        for start in range(len(j['input1'])):
            found0 = phrases['chinese'].trie.find(j['input1'][start:])
            for f in found0:
                f['start'] = start
            response['phrases'].extend(found0)

        return response

    @app1.post('/phrases/chinese/insert_or_update')
    async def phrases__chinese__insert_or_update(request: Request):
        j = await request.json()
        
        row, error = Parse.phrase(j['input2'])

        db = database(commit=True)
        if 'id' in row:
            db.update('phrases__chinese',
                ['id', 'text', 'note', 'origin'],
                [row['id'], row['text'], row['note'], j['origin']],
                'id = "{}"'.format(row['id'])
            )
        else:
            next_id = 1
            for row0 in db.select('phrases__chinese', ['id'], 'text = "{}"'.format(row['text'])):
                next_id = max(next_id, int(row0['id'][row0['id'].index('/') + 1:]) + 1)
            row['id'] = '{}/{}'.format(row['text'], next_id)

            db.insert('phrases__chinese',
                ['id', 'text', 'note', 'origin'],
                [row['id'], row['text'], row['note'], j['origin']]
            )
        
        phrases['chinese'].trie.insert(row['text'], row)

        return {}

    @app1.post('/phrases/chinese/of_the_same')
    async def phrases__chinese__of_the_same(request: Request):
        j = await request.json()

        response = {'phrases': []}

        phrases = j['input1'].split('\n')
        if not phrases:
            return response

        where = ' OR '.join(['text = "{}"'.format(p.strip()) for p in phrases])
        for row in database().select('phrases__chinese', ['id', 'text', 'note'], where):
            response['phrases'].append(row)

        return response

    @app1.post('/sentences/chinese/insert_or_update')
    async def sentences__chinese__insert_or_update(request: Request):
        j = await request.json()
        print(j)
        pass

    uvicorn.run(app1, host='0.0.0.0', port=44400)


if __name__ == '__main__':
    if sys.argv[1] == 'create':
        database.create()()
    elif sys.argv[1] == 'start':
        get_and_post(app)
