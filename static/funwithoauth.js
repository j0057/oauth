NodeList.prototype.toArray = function() {
    return Array.prototype.slice.call(this);
};

var request = function(method, url) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() { xhr.status == 200 ? resolve(xhr) : reject(xhr); };
        xhr.onerror = function() { reject(xhr); };
        xhr.open(method, url, true);
        xhr.send();
    });
}

Array.prototype.toXML = function() {
    if (this instanceof Array) {
        var result = document.createElement(this[0]);
        for (var i = 1; i < this.length; i++) {
            if (typeof this[i] == 'object' && !(this[i] instanceof Array)) {
                for (var a in this[i]) {
                    result.setAttribute(a, this[i][a]);
                }
            }
            else {
                result.appendChild(Array.prototype.toXML.call(this[i]));
            }
        }
        return result;
    }
    else {
        return document.createTextNode(this.toString());
    }
};

Node.prototype.empty = function() {
    while (this.lastChild) {
        this.removeChild(this.lastChild);
    }
    return this;
};

Function.prototype.extend = function(attrs) {
    var ctor = attrs.constructor;
    ctor.prototype = Object.create(this.prototype);
    ctor.prototype.constructor = ctor;
    ctor.prototype.__super__ = this;
    for (var key in attrs) {
        var staticFunc = /^_static_(.*)$/.exec(key)
        if (typeof attrs[key] == "object") {
            Object.defineProperty(ctor.prototype, key, attrs[key]);
        }
        else if (staticFunc) {
            ctor[staticFunc[1]] = attrs[key];
        }
        else {
            ctor.prototype[key] = attrs[key];
        }
    }
    return ctor;
};

Link = Object.extend({
    constructor: function(id, format) {
        this.container = document.querySelector(id);
        this.link = this.container.querySelector('a');
        this.result = this.container.querySelector('div');

        this.format = format;

        this.link.addEventListener('click', this.onLinkClick.bind(this));
    },
    onLinkClick: function(e) {
        e.preventDefault();
        var self = this;
        request('GET', self.link.href)
            .then(function(xhr) { return JSON.parse(xhr.response); })
            .then(function(obj) { return self.format(obj); })
            .then(function(elem) { self.result.empty().appendChild(elem.toXML()); })
            .catch(console.error);
    },
    parse: function(xhr) {
        return JSON.parse(xhr.response);
    }
});

XMLLink = Link.extend({
    constructor: function(id, format) {
        this.__super__.prototype.constructor.call(this, id, format);
    },
    parse: function(xhr) {
        return xhr.responseXML;
    }
});

FileBrowser = Object.extend({
    constructor: function(id, view) {
        this.container = document.querySelector(id);
        this.container.addEventListener('click', this.onClick.bind(this));
        this.view = view;
    },
    onClick: function(e) {
        e.preventDefault();
        if (e.target.className == "dir") {
            var ul = e.target.parentNode.querySelector('ul').empty();
            request('GET', e.target.href)
                .then(function(xhr) {
                    var doc = JSON.parse(xhr.response);
                    var elem = this.view(doc).toXML();
                    ul.parentNode.replaceChild(elem, ul);
                }.bind(this))
                .catch(console.error);
        }
        else if (e.target.className = "doc") {
            this.edit(e.target.href);
        }
    },
    edit: function(url) {
        window.open(url);
    }
});

document.addEventListener('DOMContentLoaded', function(e) {
    request('GET', '/oauth/session/check/')
        .then(function(xhr) {
            document.querySelector('#session_id').textContent = document.cookie;

            document.querySelectorAll("a.authorize")
                .toArray()
                .forEach(function(link) {
                    link.href += link.href.indexOf("?") > -1
                        ? "&" + document.cookie
                        : "?" + document.cookie;
                    link.focus();
                    link.blur();
                });
            window.scrollTo(0,0);
        });

    //
    // github
    //

    var githubUserImageLink = function(user) {
        return ['a', {'href': 'https://github.com/' + user.login},
            ['img', {'src': user.avatar_url, 'title': user.login, 'class': 'small'}] ];
    };

    var githubUserImageLinks = function(users) {
        return ['div'].concat(users.map(githubUserImageLink));
    };

    var githubRepo = function(repos) {
        return ['div'].concat(repos.map(function(repo) {
            return ['div',
                ['a', {'href': repo.html_url}, repo.name],
                ': ',
                repo.watchers, ' stars, ',
                repo.forks, ' forks, ',
                repo.open_issues, ' issues' ];
        }));
    };

    var github_me = new Link('#github_me', githubUserImageLink);
    var github_following = new Link('#github_following', githubUserImageLinks);
    var github_followers = new Link('#github_followers', githubUserImageLinks);
    var github_repos = new Link('#github_repos', githubRepo);

    //
    // facebook
    //

    var facebook_me = new Link('#facebook_me', function(me) {
        return [ 'span', me.name, ' <', me.email, '> (', me.friends.summary.total_count, ' friends)' ];
    });

    //
    // windows live
    //

    var live_me = Link('#live_me', function(me) {
        return [ "span", me.name ];
    });
    var live_browser = FileBrowser("#live_browser", function(items) {
        return ["ul"].concat(items.map(function(item) {
            return ["li",
                item.type == "folder" || item.type == "album"
                    ? ["a", {"class": "dir", "href": "/oauth/live/api/" + item.id + "/files"}, item.name]
                    : ["a", {"class": "doc", "href": item.link}, item.name],
                item.type == "folder" || item.type == "album" ? ["ul"] : ""
            ];
        }));
    });

    //
    // google
    //
 
    var google_me = new Link('#google_me', function(me) {
        return ['span', me.name, ' <', me.email, '>'];
    });
    var google_browser = new FileBrowser('#google_browser', function(items) {
        return ["ul"].concat(items.map(function(item) {
            return ["li",
                ["img", {src: item.iconLink}],
                " ",
                item.mimeType == "application/vnd.google-apps.folder"
                    ? ["a", {"class": "dir", href: "/oauth/google/api/drive/v2/files?q=\"" + item.id + "\"+in+parents&fields=items(alternateLink,defaultOpenWithLink,iconLink,id,mimeType,thumbnailLink,title,downloadUrl,exportLinks,webContentLink)"}, item.title]
                    : ["a", {"class": "doc", href: item.alternateLink}, item.title],
                item.mimeType == "application/vnd.google-apps.folder" ? ["ul"] : ""
            ];
        }));
    });

    //
    // dropbox
    //

    var dropbox_me = new Link('#dropbox_me', function(me) {
        return ['span', me.display_name, ' <', me.email, '>']
    });
    var dropbox_browser = new FileBrowser("#dropbox_browser", function(items) {
        return ["ul"].concat(items.map(function(item) {
            var path = item.path.split("/").map(encodeURIComponent).join("/");
            var name = item.path.split("/").pop();
            return [ "li",
                ["img", {src: "/oauth/dropbox/" + item.icon + ".gif"}],
                " ",
                item.is_dir
                    ? ["a", {"href": "/oauth/dropbox/api/1/metadata/dropbox" + path, "class": "folder"}, name]
                    : ["a", {"href": "/oauth/dropbox/api/1/media/dropbox" + path, "class": "document"}, name],
                item.is_dir ? ["ul"] : ""
            ];
        }));
    });
    dropbox_browser.edit = function(url) {
        request("GET", e.target.href)
            .then(function(xhr) { return JSON.parse(xhr.response); })
            .then(function(media) { window.open(media.url); })
            .catch(console.error);
    };

    //
    // linkedin
    //
 
    var linkedin_me = new XMLLink('#linkedin_me', function(xml) {
        return [ 'span',
            xml.querySelector('person first-name').textContent,
            ' ', xml.querySelector('person last-name').textContent,
            ', ', xml.querySelector('person headline').textContent ];
    });

    document.querySelector("#linkedin_friends").addEventListener("click", function(e) {
        e.preventDefault();
        var linkedinConnection = function(person) {
            if (person.querySelector("id").textContent == "private")
                return null;
            var picture = person.querySelector("picture-url");
            if (!picture)
                return null;
            var img = ["img", {
                "src": picture.textContent,
                "title": person.querySelector("first-name").textContent
                    + " "
                    + person.querySelector("last-name").textContent
            }].toXML();
        };
        var div = document.querySelector("#linkedin_friends_result").empty();
        request("GET", e.target.href)
            .then(function(xhr) { xhr.responseXML
                .querySelectorAll("connections person")
                .toArray()
                .map(linkedinConnection)
                .filter(function(e) { return e != null; })
                .forEach(function(e) { div.appendChild(e); })
            });
    });

    //
    // reddit
    //

    var reddit_me = new Link('#reddit_me', function(me) {
        return [ 'span', me.name, ' (', me.link_karma, ' link karma, ', me.comment_karma, ' comment karma)' ];
    });

    //
    // j0057.nl/todo
    //

    document.querySelector("#j0057_todo_me").addEventListener("click", function(e) {
        e.preventDefault();
        request("GET", e.target.href)
            .then(function(xhr) { return JSON.parse(xhr.response); })
            .then(function(me) { document.querySelector('#j0057_todo_me_result').textContent
                = 'Username: ' + me.username
                + '; Tasks: ' + me.tasks.total
                + '; Done: ' + me.tasks.done
                + '; To do: ' + me.tasks.todo;
            });
    });

    //
    // random links
    //

    document.querySelector("#linkbag").addEventListener("click", function(e) {
        e.preventDefault();
        if (e.target.href) { 
            window.open(e.target.href);
        }
    });
});
