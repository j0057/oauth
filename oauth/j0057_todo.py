from . import base
from . import config

__all__ = [
    'J0057TodoInit',
    'J0057TodoCode',
    'J0057TodoApi'
]

class J0057Todo(object):
    key_fmt       = 'j0057_todo_{0}'

    client_id     = config.J0057_TODO_CLIENT_ID
    client_secret = config.J0057_TODO_CLIENT_SECRET

    authorize_uri = 'http://dev2.j0057.nl/todo/authorize/'
    token_uri     = 'http://dev2.j0057.nl/todo/access_token/'
    api_base_uri  = 'http://dev2.j0057.nl/todo/'

    callback_uri  = 'https://{0}/oauth/j0057-todo/code/'.format(config.SERVER_HOSTNAME)
    redirect_uri  = 'https://{0}/oauth/index.xhtml'.format(config.SERVER_HOSTNAME)

class J0057TodoInit(base.OauthInit, J0057Todo):
    pass

class J0057TodoCode(base.OauthCode, J0057Todo):
    pass


class J0057TodoApi(base.OauthApi, J0057Todo):
    pass

