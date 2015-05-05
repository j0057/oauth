from . import base
from . import config

__all__ = [
    'GithubInit',
    'GithubCode',
    'GithubApi'
]

class Github(object):
    key_fmt       = 'github_{0}'

    client_id     = config.GITHUB_CLIENT_ID
    client_secret = config.GITHUB_CLIENT_SECRET

    authorize_uri = 'https://github.com/login/oauth/authorize'
    token_uri     = 'https://github.com/login/oauth/access_token'
    api_base_uri  = 'https://api.github.com/'

    callback_uri  = 'https://{0}/oauth/github/code/'.format(config.SERVER_HOSTNAME)
    redirect_uri  = 'https://{0}/oauth/index.xhtml'.format(config.SERVER_HOSTNAME)

class GithubInit(base.OauthInit, Github):
    pass

class GithubCode(base.OauthCode, Github):
    pass

class GithubApi(base.OauthApi, Github):
    pass
