import json
import os

#
# keys come from configuration/environment
#

def load_keys():
    keys_json_filename = os.environ.get('OAUTH_KEYS', 'keys.json')
    with open(keys_json_filename, 'r') as keys_json:
        keys = { k.upper(): v for (k, v) in json.load(keys_json).items() }
        globals().update(keys)

load_keys()

