from . import base
from . import config

__all__ = [
    'Office365Init',
    'Office365Code',
    'Office365Api'
]

class Office365(object):
    key_fmt       = 'office365_{0}'
    
    client_id     = config.OFFICE365_CLIENT_ID
    client_secret = config.OFFICE365_CLIENT_SECRET
    
    authorize_uri = 'https://login.microsoftonline.com/common/oauth2/authorize'
    token_uri     = 'https://login.microsoftonline.com/common/oauth2/token'
    api_base_uri  = ''

    callback_uri  = 'https://{0}/oauth/office365/code/'.format(config.SERVER_HOSTNAME)
    redirect_uri  = 'https://{0}/oauth/index.xhtml'.format(config.SERVER_HOSTNAME)

class Office365Init(base.OauthInit, Office365):
    def get_params(self, scope, nonce):
        params = super(Office365Init, self).get_params(scope, nonce)
        params['prompt'] = 'consent'
        params['api_version'] = '1.0'
        return params

class Office365Code(base.OauthCode, Office365):
    def get_form(self, code):
        form = super(Office365Code, self).get_form(code)
        form['resource'] = 'https://graph.microsoft.com/'
        return form

class Office365Api(base.OauthApi, Office365):
    pass
