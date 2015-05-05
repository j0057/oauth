from . import base
from . import config

__all__ = [
    'RedditInit',
    'RedditCode',
    'RedditApi'
]

class Reddit(object):
    key_fmt       = 'reddit_{0}'

    client_id     = config.REDDIT_CLIENT_ID
    client_secret = config.REDDIT_CLIENT_SECRET

    authorize_uri = 'https://ssl.reddit.com/api/v1/authorize'
    token_uri     = 'https://ssl.reddit.com/api/v1/access_token'
    api_base_uri  = 'https://oauth.reddit.com/'

    callback_uri  = 'https://{0}/oauth/reddit/code/'.format(config.SERVER_HOSTNAME)
    redirect_uri  = 'https://{0}/oauth/index.xhtml'.format(config.SERVER_HOSTNAME)

class RedditInit(base.OauthInit, Reddit):
    pass

class RedditCode(base.OauthCode, Reddit):
    def get_authorization(self):
        auth = 'Basic ' + '{0}:{1}'.format(self.client_id, self.client_secret).encode('base64')[:-1]
        return { 'authorization': auth }

class RedditApi(base.OauthApi, Reddit):
    pass
