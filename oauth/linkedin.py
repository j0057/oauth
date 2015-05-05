from . import base
from . import config

__all__ = [
    'LinkedinInit',
    'LinkedinCode',
    'LinkedinApi'
]

class Linkedin(object):
    key_fmt       = 'linkedin_{0}'

    client_id     = config.LINKEDIN_CLIENT_ID
    client_secret = config.LINKEDIN_CLIENT_SECRET

    authorize_uri = 'https://www.linkedin.com/uas/oauth2/authorization'
    token_uri     = 'https://www.linkedin.com/uas/oauth2/accessToken'
    api_base_uri  = 'https://api.linkedin.com/'

    callback_uri  = 'https://{0}/oauth/linkedin/code/'.format(config.SERVER_HOSTNAME)
    redirect_uri  = 'https://{0}/oauth/index.xhtml'.format(config.SERVER_HOSTNAME)

class LinkedinInit(base.OauthInit, Linkedin):
    pass

class LinkedinCode(base.OauthCode, Linkedin):
    pass

class LinkedinApi(base.OauthApi, Linkedin):
    def set_token(self, headers, params, token):
        params.update({ 'oauth2_access_token': token })
