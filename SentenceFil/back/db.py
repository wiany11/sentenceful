import json
import mariadb


class Selection:
    def __call__(self, where):
        self.crsr.execute(
            'SELECT ' + ', '.join(self.columns) +
            ' FROM ' + self.table +
            ' WHERE ' + where
        )

        return self

    def __del__(self):
        self.crsr.close()

    def __init__(self, dbc, table, columns):
        self.dbc = dbc
        self.table = table
        self.columns = columns

        self.crsr = self.dbc.conn.cursor()

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


class Connection:
    # https://mariadb.com/kb/en/setting-character-sets-and-collations/
    # https://mariadb.com/kb/en/supported-character-sets-and-collations/
    # CREATE DATABASE sentenceful
    #     CHARACTER SET = 'utf8mb4'
    #     COLLATE = 'utf8mb4_bin'

    def __del__(self):
        if self.commit:
            self.conn.commit()

        self.conn.close()

    def __init__(self, database, commit=False):
        self.commit = commit

        self.conn = mariadb.connect(
            user='ghchoi',
            password='4tk4ahrfkd!!',
            host='127.0.0.1',
            port=3306,
            database=database
        )

    def insert(self, table, columns, values):
        crsr = self.conn.cursor()
        crsr.execute(
            'INSERT INTO ' + table + ' (' + ', '.join(columns) +
            ') VALUE (' + ', '.join(['?'] * len(values)) + ')', values
        )
        crsr.close()

    def select(self, table, columns, where='1'):
        return Selection(self, table, columns)(where)

    def update(self, table, columns, values, where):
        crsr = self.conn.cursor()
        crsr.execute(
            'UPDATE ' + table + ' SET ' +
            ', '.join(['{} = ?'.format(c) for c in columns]) + ' WHERE ' + where, values
        )
        crsr.close()


class Chinese(Connection):
    def _create__phrases(self, crsr):
        crsr.execute('DROP TABLE IF EXISTS phrases')
        crsr.execute(
            'CREATE TABLE phrases ('
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
            crsr.execute("INSERT INTO phrases (id, text, note, origin) VALUES (?, ?, ?, ?)", (
                j['id'].encode('utf-8'),
                j['text'].encode('utf-8'),
                j['note'].encode('utf-8'),
                j['origin'].encode('utf-8')
            ))

    def _create__sentences(self, crsr):
        crsr.execute('DROP TABLE IF EXISTS sentences')
        crsr.execute(
            'CREATE TABLE sentences ('
            '    `key`       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,'
            '    source_lang TEXT NOT NULL,'
            '    target_lang TEXT NOT NULL,'
            '    phrase_id   TEXT NOT NULL, FULLTEXT(phrase_id),'
            '    phrase_text TEXT NOT NULL, FULLTEXT(phrase_text)'
            ') ENGINE=MyISAM'
        )

    def __init__(self, commit=False):
        super().__init__('chinese', commit)

    def create(self):
        crsr = self.conn.cursor()

        self._create__phrases(crsr)
        self._create__sentences(crsr)

        self.conn.commit()

