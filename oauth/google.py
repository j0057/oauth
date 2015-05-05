from . import base
from . import config

__all__ = [
    'GoogleInit',
    'GoogleCode',
    'GoogleApi'
]

class Google(object):
    key_fmt       = 'google_{0}'

    client_id     = config.GOOGLE_CLIENT_ID
    client_secret = config.GOOGLE_CLIENT_SECRET

    authorize_uri = 'https://accounts.google.com/o/oauth2/auth'
    token_uri     = 'https://accounts.google.com/o/oauth2/token'
    api_base_uri  = 'https://www.googleapis.com/'

    callback_uri  = 'https://{0}/oauth/google/code/'.format(config.SERVER_HOSTNAME)
    redirect_uri  = 'https://{0}/oauth/index.xhtml'.format(config.SERVER_HOSTNAME)

class GoogleInit(base.OauthInit, Google):
    def get_scope(self, request):
        scopes = request['x-get']['scope'] or ''
        return ' '.join(scope if scope in ['openid', 'email'] else 'https://www.googleapis.com/auth/' + scope
                        for scope in scopes.split())

class GoogleCode(base.OauthCode, Google):
    pass

class GoogleApi(base.OauthApi, Google):
    pass
