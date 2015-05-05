import xhttp

from . import session

from . import github
from . import facebook
from . import live
from . import google
from . import dropbox
from . import linkedin
from . import reddit
from . import j0057_todo

class OauthRouter(xhttp.Router):
    def __init__(self):
        super(OauthRouter, self).__init__(
            (r'^/$',                            xhttp.Redirector('/oauth/')),
            (r'^/oauth/$',                      xhttp.Redirector('index.xhtml')),
            (r'^/oauth/pizza/$',                xhttp.Redirector('index.xhtml')),
            
            (r'^/oauth/(.*\.xhtml)$',           xhttp.FileServer('static', 'application/xhtml+xml; charset=UTF-8')),
            (r'^/oauth/(.*\.js)$',              xhttp.FileServer('static', 'application/javascript')),
            (r'^/oauth/(.*\.png)$',             xhttp.FileServer('static', 'image/png')),
            (r'^/oauth/(.*\.css)$',             xhttp.FileServer('static', 'text/css')),
            
            (r'^/oauth/google/init/$',          google.GoogleInit()),
            (r'^/oauth/google/code/$',          google.GoogleCode()),
            (r'^/oauth/google/api/(.*)$',       google.GoogleApi()),
            
            (r'^/oauth/live/init/$',            live.LiveInit()),
            (r'^/oauth/live/code/$',            live.LiveCode()),
            (r'^/oauth/live/api/(.*)$',         live.LiveApi()),
            
            (r'^/oauth/facebook/init/$',        facebook.FacebookInit()),
            (r'^/oauth/facebook/code/$',        facebook.FacebookCode()),
            (r'^/oauth/facebook/api/(.*)$',     facebook.FacebookApi()),
            
            (r'^/oauth/github/init/$',          github.GithubInit()),
            (r'^/oauth/github/code/$',          github.GithubCode()),
            (r'^/oauth/github/api/(.*)$',       github.GithubApi()),

            (r'^/oauth/dropbox/init/$',         dropbox.DropboxInit()),
            (r'^/oauth/dropbox/code/$',         dropbox.DropboxCode()),
            (r'^/oauth/dropbox/api/(.*)$',      dropbox.DropboxApi()),
            (r'^/oauth/dropbox/content/(.*)$',  dropbox.DropboxContentApi()),

            (r'^/oauth/dropbox/(.*\.gif)$',     xhttp.FileServer('static/dropbox/16x16', 'image/gif')),
            
            (r'^/oauth/linkedin/init/$',        linkedin.LinkedinInit()),
            (r'^/oauth/linkedin/code/$',        linkedin.LinkedinCode()),
            (r'^/oauth/linkedin/api/(.*)$',     linkedin.LinkedinApi()),
            
            (r'^/oauth/reddit/init/$',          reddit.RedditInit()),
            (r'^/oauth/reddit/code/$',          reddit.RedditCode()),
            (r'^/oauth/reddit/api/(.*)$',       reddit.RedditApi()),

            (r'^/oauth/j0057-todo/init/$',      j0057_todo.J0057TodoInit()),
            (r'^/oauth/j0057-todo/code/$',      j0057_todo.J0057TodoCode()),
            (r'^/oauth/j0057-todo/api/(.*)$',   j0057_todo.J0057TodoApi()),
            
            (r'^/oauth/session/start/$',        session.SessionStart()),
            (r'^/oauth/session/delete/$',       session.SessionDelete()),
            (r'^/oauth/session/check/$',        session.SessionCheck())
        )

app = OauthRouter()
app = xhttp.catcher(app)
app = xhttp.xhttp_app(app)

if __name__ == '__main__':
    xhttp.run_server(app)
