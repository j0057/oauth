try:
    import urlparse as urlparse
except ImportError:
    import urllib.parse as urlparse

from . import base
from . import config

__all__ = [
    'FacebookInit',
    'FacebookCode',
    'FacebookApi'
]

class Facebook(object):
    key_fmt       = 'facebook_{0}'
    
    client_id     = config.FACEBOOK_CLIENT_ID
    client_secret = config.FACEBOOK_CLIENT_SECRET
    
    authorize_uri = 'https://www.facebook.com/dialog/oauth'
    token_uri     = 'https://graph.facebook.com/oauth/access_token'
    api_base_uri  = 'https://graph.facebook.com/'

    callback_uri  = 'https://{0}/oauth/facebook/code/'.format(config.SERVER_HOSTNAME)
    redirect_uri  = 'https://{0}/oauth/index.xhtml'.format(config.SERVER_HOSTNAME)

class FacebookInit(base.OauthInit, Facebook):
    pass

class FacebookCode(base.OauthCode, Facebook):
    def parse_token(self, response, content_type):
        if content_type in ['application/x-www-form-urlencoded', 'text/plain']:
            form = urlparse.parse_qs(response.content)
            return form['access_token'][0]
        else:
            return super(FacebookCode, self).parse_token(response, content_type)

class FacebookApi(base.OauthApi, Facebook):
    pass

