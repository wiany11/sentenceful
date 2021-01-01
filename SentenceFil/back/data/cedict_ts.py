# https://github.com/rubber-duck-dragon/rubber-duck-dragon.github.io/blob/master/cc-cedict_parser/parser.py


import json


with open('cedict_ts.u8') as file:
    text = file.read()
    lines = text.split('\n')
    dict_lines = list(lines)

    def parse_line(line):
        parsed = {}
        if line == '':
            dict_lines.remove(line)
            return 0
        line = line.rstrip('/')
        line = line.split('/')
        if len(line) <= 1:
            return 0
        english = line[1]
        char_and_pinyin = line[0].split('[')
        characters = char_and_pinyin[0]
        characters = characters.split()
        traditional = characters[0]
        simplified = characters[1]
        pinyin = char_and_pinyin[1]
        pinyin = pinyin.rstrip()
        pinyin = pinyin.rstrip("]")
        parsed['traditional'] = traditional
        parsed['simplified'] = simplified
        parsed['pinyin'] = pinyin
        parsed['english'] = english
        list_of_dicts.append(parsed)

    def remove_surnames():
        for x in range(len(list_of_dicts)-1, -1, -1):
            if "surname " in list_of_dicts[x]['english']:
                if list_of_dicts[x]['traditional'] == list_of_dicts[x+1]['traditional']:
                    list_of_dicts.pop(x)
            
    def main():
        #make each line into a dictionary
        print("Parsing dictionary . . .")
        for line in dict_lines:
            if line.startswith('#'):
                continue
            parse_line(line)
        
        #remove entries for surnames from the data (optional):
        print("Removing Surnames . . .")
        remove_surnames()

        return list_of_dicts

list_of_dicts = []
parsed_dict = main()

p2i = {}
with open('cedict_ts.jsonl', 'wt') as o:
    for d in list_of_dicts:
        ks = ['traditional']
        note = {}
        if d['traditional'] != d['simplified']:
            ks.append('simplified')
            note['traditional'] = ' = {} (simplified)'.format(d['simplified'])
            note['simplified'] = ' = {} (traditional)'.format(d['traditional'])


        for k in ks:
            p = d[k]
            if p not in p2i:
                p2i[p] = 1

            o.write(json.dumps({
                'id': '{}/{}'.format(p, p2i[p]),
                'phrase': p,
                'note': '[{}]{}\n{}\n'.format(d['pinyin'], (note[k] if note else ''), d['english'])
            }) + '\n')
            p2i[p] = p2i[p] + 1


id_set = set()
with open('cedict_ts.jsonl') as o:
    for l in o:
        j = json.loads(l)
        if j['id'] in id_set:
            raise RuntimeError
        id_set.add(j['id'])