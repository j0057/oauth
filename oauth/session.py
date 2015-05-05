import json

import xhttp

from . import base

__all__ = [
    'SessionStart',
    'SessionDelete',
    'SessionCheck'
]

class SessionStart(xhttp.Resource):
    def GET(self, request):
        session_id = random()
        base.SESSIONS[session_id] = {}
        return {
            'x-status': xhttp.status.SEE_OTHER,
            'location': '/oauth/index.xhtml',
            'set-cookie': 'session_id={0}; Path=/oauth/'.format(session_id)
        }

class SessionDelete(xhttp.Resource):
    @xhttp.cookie({ 'session_id?': '^(.+)$' })
    def GET(self, request):
        session_id = request['x-cookie'].get('session_id', '')
        if session_id and session_id in base.SESSIONS:
            del base.SESSIONS[session_id]
        return {
            'x-status': xhttp.status.SEE_OTHER,
            'location': '/oauth/index.xhtml',
            'set-cookie': 'session_id=; Path=/oauth/; Expires=Sat, 01 Jan 2000 00:00:00 GMT'
        }

class SessionCheck(xhttp.Resource):
    @xhttp.cookie({ 'session_id?': '^(.+)$' })
    def GET(self, request):
        session_id = request['x-cookie'].get('session_id', None)
        if session_id and (session_id not in base.SESSIONS):
            return {
                'x-status': xhttp.status.OK,
                'x-content': json.dumps({
                    'session': False,
                    'tokens': {}
                }),
                'content-type': 'application/json',
                'set-cookie': 'session_id=; Path=/oauth/; Expires=Sat, 01 Jan 2000 00:00:00 GMT',
            }
        else:
            session = base.SESSIONS.get(session_id, {})
            return {
                'x-status': xhttp.status.OK,
                'x-content': json.dumps({
                    'session': session_id in base.SESSIONS,
                    'tokens': {
                        'github': 'github_token' in session,
                        'facebook': 'facebook_token' in session,
                        'live': 'live_token' in session,
                        'google': 'google_token' in session,
                        'dropbox': 'dropbox_token' in session,
                        'linkedin': 'linkedin_token' in session,
                        'reddit': 'reddit_token' in session,
                    },
                    'request': { k: str(v) for (k, v) in request.items() }
                }),
                'content-type': 'application/json'
            }

