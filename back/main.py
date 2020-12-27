from __init__ import app
from fastapi import Request
from google.oauth2 import id_token
from google.auth.transport import requests

import mariadb
import sys
import uvicorn


class database:
    class create:
        def __call__(self):
            self.users()
            self.phrases()
            self.pools()

            self.db.conn.commit()

        def __del__(self):
            self.crsr.close()

        def __init__(self):
            self.db = database()
            self.crsr = self.db.conn.cursor()

        def users(self):
            self.crsr.execute(
                'CREATE TABLE users ('
                '    `key` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,'
                '    email VARCHAR(128) NOT NULL UNIQUE'
                ')'
            )

            self.crsr.execute("INSERT INTO users (email) VALUES ('wiany11@gmail.com')")

        def phrases(self):
            self.crsr.execute(
                'CREATE TABLE phrases ('
                '    `key` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,'
                '    email VARCHAR(128) NOT NULL,'
                '    pool  VARCHAR(64)  NOT NULL,'
                '    INDEX (email, pool)'
                ')'
            )

        def pools(self):
            self.crsr.execute(
                'CREATE TABLE pools ('
                '    `key` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,'
                '    email VARCHAR(128) NOT NULL,'
                '    pool  VARCHAR(64)  NOT NULL,'
                '    INDEX (email)'
                ')'
            )

            self.crsr.execute("INSERT INTO pools (email, pool) VALUES ('wiany11@gmail.com', 'Chinese')")
            self.crsr.execute("INSERT INTO pools (email, pool) VALUES ('wiany11@gmail.com', 'English')")
            self.crsr.execute("INSERT INTO pools (email, pool) VALUES ('wiany11@gmail.com', 'Japanese')")

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
        self.conn = mariadb.connect(
            user='ghchoi',
            password='4tk4ahrfkd!!',
            host='127.0.0.1',
            port=3306,
            database='sentenceful'
        )

    def select(self, table, columns, where):
        return database.selection(self, table, columns)(where)


class verify_account:
    class at_google:
        '''
        https://developers.google.com/identity/sign-in/web/backend-auth
        '''

        client_id = {
            'android': '759868072746-81dos3od0712gkjlntbghet4l026gvgv.apps.googleusercontent.com'
        }

        def from_android(token):
            try:
                idinfo = id_token.verify_oauth2_token(token, requests.Request(), verify_account.at_google.client_id['android'])
                return idinfo['email']
            except ValueError as e:
                return ''

    def again(signed_in):
        if 'google' in signed_in:
            #print(signed_in['google']['idToken'])
            return verify_account.at_google.from_android(signed_in['google']['idToken'])
        else:
            return ''


@app.post('/pools')
async def pools(request: Request):
    j = await request.json()

    email = verify_account.again(j['signed_in'])

    response = {
        'pools': []
    }

    for row in database().select('pools', ['`key`', 'pool'], "email = '" + email + "'"):
        response['pools'].append({
            'key': row['`key`'],
            'name': row['pool']
        })

    return response


@app.post('/users')
async def users(request: Request):
    j = await request.json()

    email = verify_account.again(j['signed_in'])

    row = database().select('users', ['count(*)'], "email = '" + email + "'").fetchone()
    print(row['count(*)'], row['count(*)'] == 1)

    if row['count(*)'] == 1:
        return {'email': email}
    else:
        return {'error': 'Not verifiable...'}


if __name__ == '__main__':
    if sys.argv[1] == 'create':
        database.create()()
    elif sys.argv[1] == 'start':
        uvicorn.run('__init__:app', host='0.0.0.0', port=44400, reload=True)

