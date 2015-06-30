from . import base
from . import config

__all__ = [
    'Office365Init',
    'Office365Code',
    'Office365Api'
]

class Office365(object):
    key_fmt       = 'live_{0}'
    
    client_id     = config.OFFICE365_CLIENT_ID
    client_secret = config.OFFICE365_CLIENT_SECRET
    
    authorize_uri = 'https://login.microsoftonline.com/common/oauth2/authorize?api-version=1.0'
    token_uri     = 'https://login.microsoftonline.com/common/oauth2/token?api-version=1.0'
    api_base_uri  = ''

    callback_uri  = 'https://{0}/oauth/office365/code/'.format(config.SERVER_HOSTNAME)
    redirect_uri  = 'https://{0}/oauth/index.xhtml'.format(config.SERVER_HOSTNAME)

class Office365Init(base.OauthInit, Office365):
    pass

class Office365Code(base.OauthCode, Office365):
    pass

class Office365Api(base.OauthApi, Office365):
    pass
