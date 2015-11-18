import json
import urllib

try:
    import urlparse as urlparse
except ImportError:
    import urllib.parse as urlparse

import requests

import xhttp

from .utils import *

__all__ = [
    'OauthInit',
    'OauthCode',
    'OauthApi'
]

#
# session store: a dict
#

SESSIONS = {}

#
# OauthInit
#

class OauthInit(xhttp.Resource):
    def get_scope(self, request):
        return request['x-get']['scope'] or ''

    def get_params(self, scope, nonce):
        return {
            'client_id': self.client_id,
            'redirect_uri': self.callback_uri,
            'scope': scope,
            'state': nonce,
            'response_type': 'code' }

    @xhttp.cookie({ 'session_id': '^(.+)$' })
    @xhttp.session('session_id', SESSIONS)
    @xhttp.get({
        'scope?'     : '.+',
        'session_id*': '.*'
    })
    def GET(self, request):
        request['x-session'][self.key_fmt.format('nonce')] = nonce = random()
        scope = self.get_scope(request)
        params = self.get_params(scope, nonce)
        authorize_uri = self.authorize_uri + '?' + urllib.urlencode(params)
        return {
            'x-status': xhttp.status.SEE_OTHER,
            'location': authorize_uri }

#
# OauthCode
#

class OauthCode(xhttp.Resource):
    def get_form(self, code):
        return {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'redirect_uri': self.callback_uri,
            'code': code,
            'grant_type': 'authorization_code' }

    def get_headers(self):
        headers = {
            'accept': 'application/json, application/x-www-form-urlencoded;q=0.9, text/plain;q=0.1',
            'content-type': 'application/x-www-form-urlencoded' }
        headers.update(self.get_authorization())
        return headers

    def get_authorization(self):
        return {}

    def parse_token(self, response, content_type):
        if content_type == 'application/json':
            json = response.json()
            return json['access_token']

    def request_token(self, code):
        # post request for getting access token
        response = requests.post(self.token_uri, data=self.get_form(code), headers=self.get_headers())
        print_exchange(response)
        if response.status_code != 200:
            raise xhttp.HTTPException(xhttp.status.BAD_REQUEST, { 'x-detail': response.text.encode('utf8') })

        # get access code from response
        content_type, _ = split_mime_header(response.headers['content-type'])
        access_token = self.parse_token(response, content_type)
        if not access_token:
            raise xhttp.HTTPException(xhttp.status.NOT_IMPLEMENTED, {
                'x-detail': "Don't know how to handle content type {0}".format(content_type) })
        return access_token

    @xhttp.get({
        'code'          : r'^.+$',
        'state'         : r'^[-_0-9a-zA-Z]+$',
        'authuser?'     : '.*',
        'prompt?'       : '.*',
        'session_state?': '.*',
        'num_sessions?' : '.*',
        'admin_consent?': r'True|False' # XXX: for office365, this should be extensible somehow
    })
    @xhttp.cookie({ 'session_id': '^(.+)$' })
    @xhttp.session('session_id', SESSIONS)
    def GET(self, request):
        if request['x-get']['state'] != request['x-session'].pop(self.key_fmt.format('nonce')):
            raise xhttp.HTTPException(xhttp.BAD_REQUEST, { 'x-detail': 'Bad state {0}'.format(state) })
        request['x-session'][self.key_fmt.format('token')] = self.request_token(request['x-get']['code'])
        return {
            'x-status': xhttp.status.SEE_OTHER,
            'location': self.redirect_uri
        }

#
# OauthApi
#

class OauthApi(xhttp.Resource):
    def set_token(self, headers, params, token):
        headers.update({ 'authorization': 'Bearer {0}'.format(token) })

    @xhttp.cookie({ 'session_id': '^(.+)$' })
    @xhttp.session('session_id', SESSIONS)
    def GET(self, request, path):
        token = request['x-session'].get(self.key_fmt.format('token'), '')
        params = { k: v[0] for (k, v) in urlparse.parse_qs(request['x-query-string']).items() }
        headers = { 'accept': 'application/json' }
        self.set_token(headers, params, token)
        response = requests.get(self.api_base_uri + path, params=params, headers=headers)
        print_exchange(response)
        return {
            'x-status': response.status_code,
            'content-type': response.headers['content-type'],
            'x-content': response.content }
