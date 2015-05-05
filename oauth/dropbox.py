from . import base
from . import config

__all__ = [
    'DropboxInit',
    'DropboxCode',
    'DropboxApi',
    'DropboxContentApi'
]

class Dropbox(object):
    key_fmt       = 'dropbox_{0}'

    client_id     = config.DROPBOX_CLIENT_ID
    client_secret = config.DROPBOX_CLIENT_SECRET

    authorize_uri = 'https://www.dropbox.com/1/oauth2/authorize'
    token_uri     = 'https://api.dropbox.com/1/oauth2/token'
    api_base_uri  = 'https://api.dropbox.com/'

    callback_uri  = 'https://{0}/oauth/dropbox/code/'.format(config.SERVER_HOSTNAME)
    redirect_uri  = 'https://{0}/oauth/index.xhtml'.format(config.SERVER_HOSTNAME)

class DropboxInit(base.OauthInit, Dropbox):
    pass

class DropboxCode(base.OauthCode, Dropbox):
    pass

class DropboxApi(base.OauthApi, Dropbox):
    def GET(self, request, path): 
        path = '/'.join(urllib.quote(part) for part in path.split('/'))
        return super(DropboxApi, self).GET(request, path)
        
class DropboxContentApi(base.OauthApi, Dropbox):
    api_base_uri = 'https://api-content.dropbox.com'
