import os
import re

__all__ = [
    'print_exchange',
    'split_mime_header',
    'random'
]

def print_exchange(r):
    print
    print '>', r.request.method, r.request.url
    for k in sorted(k.title() for k in r.request.headers.keys()):
        print '>', k.title(), ':', r.request.headers[k]
    print '>'
    print '>', r.request.body
    print
    print '<', r.status_code, r.reason
    for k in sorted(k.title() for k in r.headers.keys()):
        print '<', k.title(), ':', r.headers[k]
    print '<'
    for line in re.split(r'[\r\n]+', r.text):
        print '<', line
    print

def split_mime_header(header_val):
    parts = re.split(r';\s*', header_val)
    value = parts[0]
    attrs = dict(attr.split('=', 1) for attr in parts[1:])
    return value, attrs

def random(n=57):
    return os.urandom(n).encode('base64')[:-1].replace('+','_').replace('/','-')
