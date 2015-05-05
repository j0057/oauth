from . import base
from . import config

__all__ = [
    'LiveInit',
    'LiveCode',
    'LiveApi'
]

class Live(object):
    key_fmt       = 'live_{0}'
    
    client_id     = config.LIVE_CLIENT_ID
    client_secret = config.LIVE_CLIENT_SECRET
    
    authorize_uri = 'https://login.live.com/oauth20_authorize.srf'
    token_uri     = 'https://login.live.com/oauth20_token.srf'
    api_base_uri  = 'https://apis.live.net/v5.0/'

    callback_uri  = 'https://{0}/oauth/live/code/'.format(config.SERVER_HOSTNAME)
    redirect_uri  = 'https://{0}/oauth/index.xhtml'.format(config.SERVER_HOSTNAME)

class LiveInit(base.OauthInit, Live):
    pass

class LiveCode(base.OauthCode, Live):
    pass

class LiveApi(base.OauthApi, Live):
    pass
