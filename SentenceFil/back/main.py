from __init__ import app
from fastapi import Request

import json
import mariadb
import sys
import uvicorn


class trie:
    class node:
        def __init__(self, k):
            self.k = k
            self.next_for = {}
            self.vals = []

    def __init__(self):
        self.root = trie.node('')

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
                node.next_for[key[i]] = trie.node(key[i])
            node = node.next_for[key[i]]
        node.vals.append(val)


class database:
    class create:
        def __call__(self):
            self.pools()

            self.db.conn.commit()

        def __del__(self):
            self.crsr.close()

        def __init__(self):
            self.db = database()
            self.crsr = self.db.conn.cursor()

        def pools(self):
            self.crsr.execute('DROP TABLE IF EXISTS phrases')
            self.crsr.execute(
                'CREATE TABLE phrases ('
                '    `key`  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,'
                '    id     VARCHAR(32) NOT NULL UNIQUE,'
                '    phrase VARCHAR(32) NOT NULL,'
                '    note   TEXT,'
                '    INDEX (phrase)'
                ')'
            )

            for l in open('rsc/cedict_ts.jsonl'):
                j = json.loads(l)
                self.crsr.execute("INSERT INTO phrases (id, phrase, note) VALUES (?, ?, ?)", (
                    j['id'].encode('utf-8'),
                    j['phrase'].encode('utf-8'),
                    j['note'].encode('utf-8')
                ))

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
        self.conn.close()

    def __init__(self):
        # https://mariadb.com/kb/en/setting-character-sets-and-collations/
        # https://mariadb.com/kb/en/supported-character-sets-and-collations/
        # CREATE DATABASE sentencefil
        #     CHARACTER SET = 'utf8mb4'
        #     COLLATE = 'utf8mb4_bin'

        self.conn = mariadb.connect(
            user='ghchoi',
            password='4tk4ahrfkd!!',
            host='127.0.0.1',
            port=3306,
            database='sentencefil'
        )

    def insert(self, table, columns, values):
        crsr = self.conn.cursor()
        crsr.execute(
            'INSERT INTO ' + table + ' ('
            ', '.join(columns) + ') VALUE ('
            ', '.join(['?'] * len(values)) + ')', values
        )
        crsr.close()

    def select(self, table, columns, where='1'):
        return database.selection(self, table, columns)(where)


class chinese:
    def __init__(self):
        self.db = database()
        self.t = trie()

    def load(self):
        for row in self.db.select('phrases', ['id', 'phrase', 'note']):
            self.t.insert(row['phrase'], row)


def get_and_post(app1):
    c = chinese()
    c.load()
            
    @app1.post('/phrases/in_the_sentence')
    async def phrases(request: Request):
        j = await request.json()

        response = {'phrases': []}
        
        for start in range(len(j['sentence'])):
            found0 = c.t.find(j['sentence'][start:])
            for f in found0:
                f['start'] = start
            response['phrases'].extend(found0)

        return response

    @app1.post('/phrases/insert')
    async def phrases__insert(request: Request):
        j = await request.json()
        print(j)

        database().insert('phrases', ['id', 'phrase', 'note'], ['{}/{}'.format(phrase, j['id'] + 1), phrase, note])

        return {}

    @app1.post('/phrases/of_the_same')
    async def phrases__of_the_same(request: Request):
        j = await request.json()

        response = {'lastId': -1, 'phrases': []}

        phrase = j['phrase'].strip()
        if not phrase:
            return response

        response['lastId'] = 0
        for row in database().select('phrases', ['id', 'phrase', 'note'], 'phrase = "{}"'.format(phrase)):
            lastId = int(row['id'][len(row['phrase']) + 1:])
            response['lastId'] = max(response['lastId'], lastId)
            response['phrases'].append(row)

        return response

    uvicorn.run(app1, host='0.0.0.0', port=44400)


if __name__ == '__main__':
    if sys.argv[1] == 'create':
        database.create()()
    elif sys.argv[1] == 'start':
        get_and_post(app)
