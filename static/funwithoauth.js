NodeList.prototype.toArray = function() { return Array.prototype.slice.call(this); };

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
        for (var i = 1; i < this.length; i++)
            if (typeof this[i] == 'object' && !(this[i] instanceof Array))
                for (var a in this[i])
                    result.setAttribute(a, this[i][a]);
            else
                result.appendChild(Array.prototype.toXML.call(this[i]));
        return result;
    }
    else
        return document.createTextNode(this.toString());
};

var empty = function(node) {
    while (node.lastChild) {
        node.removeChild(node.lastChild);
    }
}

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

    var githubUserImageLink = function(user) {
        return ['a', {'href': 'https://github.com/' + user.login},
            ['img', {'src': user.avatar_url, 'title': user.login, 'class': 'small'}]
        ].toXML();
    };

    var githubRepo = function(repo) {
        return ['div',
            ['a', {'href': repo.html_url}, repo.name],
            ': ',
            repo.watchers, ' stars, ',
            repo.forks, ' forks, ',
            repo.open_issues, ' issues'
        ].toXML();
    };

    document.querySelector('#github_user').addEventListener('click', function(e) {
        e.preventDefault();
        request('GET', e.target.href)
            .then(function(xhr) { return JSON.parse(xhr.response); })
            .then(githubUserImageLink)
            .then(function(e) { document.querySelector('#github_user_result').appendChild(e); })
            .catch(console.error);
    });

    document.querySelector('#github_following').addEventListener('click', function(e) {
        e.preventDefault();
        request('GET', e.target.href)
            .then(function(xhr) { return JSON.parse(xhr.response); })
            .then(function(following) { following
                .map(githubUserImageLink)
                .map(function(e) { document.querySelector('#github_following_result').appendChild(e); });
            })
            .catch(console.error);
    });

    document.querySelector('#github_followers').addEventListener('click', function(e) {
        e.preventDefault();
        request('GET', e.target.href)
            .then(function(xhr) { return JSON.parse(xhr.response); })
            .then(function(followers) { followers
                .map(githubUserImageLink)
                .map(function(e) { document.querySelector('#github_followers_result').appendChild(e); });
            })
            .catch(console.error);
    });

    document.querySelector('#github_repos').addEventListener('click', function(e) {
        e.preventDefault();
        request('GET', e.target.href)
            .then(function(xhr) { return JSON.parse(xhr.response); })
            .then(function(repos) { console.log(repos); return repos; })
            .then(function(repos) { repos
                .map(githubRepo)
                .map(function(e) { document.querySelector('#github_repos_result').appendChild(e); });
            })
            .catch(console.error);
    });

    var facebookUserLink = function(user) {
        return ['img',
            {'src': 'https://graph.facebook.com/' + user.id + '/picture', 'title': user.name }].toXML();
    };

    document.querySelector('#facebook_me').addEventListener('click', function(e) {
        e.preventDefault();
        request('GET', e.target.href)
            .then(function(xhr) { return JSON.parse(xhr.response); })
            .then(function(me) { me.friends.data
                    .map(facebookUserLink)
                    .map(function(e) { document.querySelector('#facebook_me_result').appendChild(e); });
            });
    });

    document.querySelector("#live_me").addEventListener("click", function(e) {
        e.preventDefault();
        request('GET', e.target.href)
            .then(function(xhr) { return JSON.parse(xhr.response); })
            .then(function(me) { document.querySelector("#live_me_result").textContent = me.name; })
            .catch(console.error);
    });

    document.querySelector("#live_skydrive_browser").addEventListener("click", function(e) {
        var isFolder = function(item) { return item.type == "folder" || item.type == "album"; }
        var isDocument = function(item) { return item.type == "file" || item.type == "photo"; }
        var listItem = function(item) {
            return ["li",
                isFolder(item) ? ["a", {"href": "/oauth/live/api/" + item.id + "/files", "class": "folder"}, item.name] : "",
                isDocument(item) ? ["a", {"href": item.link, "class": "document"}, item.name] : "",
                isFolder(item) ? ["ul"] : ""
            ].toXML();
        };
        e.preventDefault();
        if (e.target.className == "folder") {
            var ul = e.target.parentNode.querySelector('ul');
            empty(ul);
            request('GET', e.target.href)
                .then(function(xhr) { return JSON.parse(xhr.response); })
                .then(function(items) { items.data
                    .map(listItem)
                    .map(function(li) { ul.appendChild(li); });
                });
        }
        else if (e.target.className = "document") {
            window.open(e.target.href)
        }
    });
    
    document.querySelector("#google_userinfo").addEventListener("click", function(e) {
        e.preventDefault();
        request('GET', e.target.href)
            .then(function(xhr) { return JSON.parse(xhr.response); })
            .then(function(me) { document.querySelector("#google_userinfo_result").textContent = me.email;
        });
    });

    document.querySelector("#google_drive_browser").addEventListener("click", function(e) {
        e.preventDefault();
        var driveItem = function(item) {
            return ["li",
                ["img", {src: item.iconLink}],
                " ",
                item.mimeType != "application/vnd.google-apps.folder" ? ["a", {href: item.alternateLink, "class": "document"}, item.title] : "",
                item.mimeType == "application/vnd.google-apps.folder" ? ["a", {href: "/oauth/google/api/drive/v2/files?q=\"" + item.id + "\"+in+parents&fields=items(alternateLink,defaultOpenWithLink,iconLink,id,mimeType,thumbnailLink,title,downloadUrl,exportLinks,webContentLink)", "class": "folder"}, item.title] : "",
                item.mimeType == "application/vnd.google-apps.folder" ? ["ul"] : ""
            ].toXML();
        };
        if (e.target.className == "folder") { 
            var ul = e.target.parentNode.querySelector('ul');
            empty(ul);
            request("GET", e.target.href)
                .then(function(xhr) { return JSON.parse(xhr.response); })
                .then(function(items) { items
                    .map(driveItem)
                    .forEach(function(e) { ul.appendChild(e); });
                })
                .catch(console.error);
        }
        else if (e.target.className == "document") {
            window.open(e.target.href)
        }
    });

    document.querySelector("#dropbox_me").addEventListener("click", function(e) {
        e.preventDefault();
        request("GET", e.target.href)
            .then(function(xhr) { return JSON.parse(xhr.response); })
            .then(function(me) { document.querySelector("#dropbox_me_result").textContent = me.display_name
                + " <"
                + me.email
                + ">";
            })
            .catch(console.error);
    });

    document.querySelector("#dropbox_browser").addEventListener("click", function(e) {
        e.preventDefault();
        var dropboxItem = function(item) {
            var path = item.path.split("/").map(encodeURIComponent).join("/");
            var name = item.path.split("/").pop();
            return [ "li",
                ["img", {src: "/oauth/dropbox/" + item.icon + ".gif"}],
                " ",
                item.is_dir
                    ? ["a", {"href": "/oauth/dropbox/api/1/metadata/dropbox" + path, "class": "folder"}, name]
                    : ["a", {"href": "/oauth/dropbox/api/1/media/dropbox" + path, "class": "document"}, name],
                item.is_dir ? ["ul"] : ""
            ].toXML();
        };
        if (e.target.className == "folder") {
            var ul = e.target.parentNode.querySelector("ul");
            empty(ul);
            request("GET", e.target.href)
                .then(function(xhr) { return JSON.parse(xhr.response); })
                .then(function(items) { items.contents
                    .map(dropboxItem)
                    .forEach(function(e) { ul.appendChild(e); });
                })
                .catch(console.error);
        }
        else if (e.target.className == "document") {
            request("GET", e.target.href)
                .then(function(xhr) { return JSON.parse(xhr.response); })
                .then(function(media) { window.open(media.url); })
                .catch(console.error);
        }
    });
    
    document.querySelector("#linkedin_me").addEventListener("click", function(e) {
        e.preventDefault();
        request("GET", e.target.href)
            .then(function(xhr) {
                document.querySelector("#linkedin_me_result").textContent
                    = xhr.responseXML.querySelector("person first-name").textContent
                    + " " + xhr.responseXML.querySelector("person last-name").textContent
                    + ", " + xhr.responseXML.querySelector("person headline").textContent;
            })
            .catch(console.error);
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
        var div = document.querySelector("#linkedin_friends_result");
        empty(div);
        request("GET", e.target.href)
            .then(function(xhr) { xhr.responseXML
                .querySelectorAll("connections person")
                .toArray()
                .map(linkedinConnection)
                .filter(function(e) { return e != null; })
                .forEach(function(e) { div.appendChild(e); })
            });
    });

    document.querySelector("#reddit_me").addEventListener("click", function(e) {
        e.preventDefault();
        request("GET", e.target.href)
            .then(function(xhr) { return JSON.parse(xhr.response); })
            .then(function(me) {
                document.querySelector("#reddit_me_result").textContent
                    = me.name + " ("
                    + me.link_karma + " link karma, "
                    + me.comment_karma + " comment karma)";
            });
    });

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

    document.querySelector("#linkbag").addEventListener("click", function(e) {
        e.preventDefault();
        if (e.target.href) { 
            window.open(e.target.href);
        }
    });
});
