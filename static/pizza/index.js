            (function($q, $qa, $hash) {
                document.addEventListener("DOMContentLoaded", function(e) {
                    var slides = $qa(".slide");
                    var slideCount = slides.length;
                    var slideMaxState;
                    var hash = {};

                    var findSlide = function(id) {
                        for (var i = 0; i < slides.length; i++) {
                            if (slides[i].id == id) {
                                return i;
                            }
                        }
                        return -1;
                    }

                    var states = {
                        "slide-title": function(slide, state) {
                            $q("#title-pizza").className = state == 1 ? "revealed" : "hidden";
                        },
                        "slide-wie-wat": function(slide, state) {
                            $qa("li", slides[slide]).map(function(li, i) {
                                li.style.display = i < state ? "" : "none";
                            });
                        },
                        "slide-rollen": function(slide, state) {
                            $qa("li", slides[slide]).map(function(li, i) {
                                li.style.display = i < state ? "" : "none";
                            });
                        },
                        "slide-flows": function(slide, state) {
                            $qa("li", slides[slide]).map(function(li, i) {
                                li.style.display = i < state ? "" : "none";
                            });
                        },
                        "slide-tokens": function(slide, state) {
                            $qa("li", slides[slide]).map(function(li, i) {
                                li.style.display = i < state ? "" : "none";
                            });
                        },
                        "slide-controversieel": function(slide, state) {
                            $qa("li", slides[slide]).map(function(li, i) {
                                li.style.display = i < state ? "" : "none";
                            });
                        },
                        "slide-abstract-flow": function(slide, state) {
                            $qa("li", slides[slide]).map(function(li, i) {
                                li.style.display = i < state ? "" : "none";
                            });
                        },
                        "slide-flowchart": function(slide, state) {
                            var popups = [4, 8, 12, 18, 21, 24, 27, 31, 34, 37, 40];
                            $qa("img, g", $qa(".slide")[slide]).map(function(elem, i) {
                                var elemState = Number(elem.getAttribute("data-state"));
                                if (popups.indexOf(elemState) >= 0) {
                                    elem.className = elemState == state ? "revealed popup" : "hidden popup";
                                }
                                else {
                                    elem.style.display = elemState <= state ? "block" : "none";
                                }
                            });
                        },
                        "slide-pocs": function(slide, state) {
                            $qa("li", slides[slide]).map(function(li, i) {
                                li.style.display = i < state ? "" : "none";
                            });
                        },
                        "slide-python": function(slide, state) {
                            var h1s = $qa("h1", slides[slide]);
                            h1s[0].className = state == 0 ? "revealed" : "hidden";
                            h1s[1].className = state >= 1 ? "revealed" : "hidden";
                            $qa("li", slides[slide]).map(function(li, i) {
                                li.style.display = i < (state-1) ? null : "none";
                            });
                        },
                        "slide-schoolmaster": function(slide, state) {
                            $qa("li", slides[slide]).map(function(li, i) {
                                li.style.display = i < state ? "" : "none";
                            });
                        }
                    };
                    console && console.log && console.log(states);

                    var next = function(ignoreState) {
                        if ((hash.state < slideMaxState) && !ignoreState) {
                            $hash.set({ slide: hash.slide, state: hash.state + 1 });
                        }
                        else if (hash.slide < (slides.length - 1)) {
                            $hash.set({ slide: hash.slide + 1, state: 0 });
                        }
                    };

                    var prev = function(ignoreState) {
                        if ((hash.state > 0) && !ignoreState) { 
                            $hash.set({ slide: hash.slide, state: hash.state - 1 }); 
                        }
                        else if (hash.slide > 0) { 
                            $hash.set({ slide: hash.slide - 1, state: 0 }); 
                        }
                    };

                    var processHash = function(e) {
                        var newHash = $hash.get();
                        newHash.slide = Number(newHash.slide);
                        newHash.state = Number(newHash.state);
                        if (hash.slide != newHash.slide) {
                            slides.map(function(slide) { slide.style.display = 'none'; });
                            slides[newHash.slide].style.display = 'block';
                            slideMaxState = Number(slides[newHash.slide].getAttribute("data-states"));
                        };
                        hash = newHash;
                        if (states[slides[hash.slide].id]) { 
                            states[slides[hash.slide].id](hash.slide, hash.state);
                        }
                    };

                    var handleKeyDown = function(e) {
                        console && console.log && console.log(e, e.keyIdentifier, e.keyCode);
                        switch (e.keyIdentifier || e.keyCode) {
                            case "Left":
                            case 37:
                                prev();
                                break;
                            case "Right":
                            case 39:
                                next();
                                break;
                            case "PageUp":
                            case 33:
                                prev(true);
                                break;
                            case "PageDown":
                            case 34:
                                next(true);
                                break;
                        }
                    };

                    var handleMouseDown = function(e) {
                        console && console.log && console.log(e, e.button, e.target);
                        if (e.target.tagName != "a") {
                            switch (e.button) {
                                case 2:
                                    prev();
                                    e.preventDefault();
                                    break;
                                case 0:
                                    next();
                                    break;
                            }
                        }
                    };

                    var openLinkInNewWindow = function(e) {
                        e.preventDefault();
                        window.open(e.target.href);
                    };

                    $qa('a.new-window').map(function(a) { 
                        a.addEventListener('click', openLinkInNewWindow); 
                    });

                    window.addEventListener("keydown", handleKeyDown);
                    window.addEventListener("mousedown", handleMouseDown);
                    window.addEventListener("contextmenu", function(e) { e.preventDefault(); });
                    window.addEventListener("hashchange", processHash);

                    if (!location.hash) { 
                        $hash.set({ slide: 0, state: 0 });
                    } else {
                        processHash();
                    }
            });
            })( function(s, ctx) {
                    ctx = ctx || document;
                    return ctx.querySelector(s);
                },
                function(s, ctx) {
                    ctx = ctx || document;
                    return Array.prototype.slice.call(ctx.querySelectorAll(s));
                },
                {
                    get: function() {
                        var result = {};
                        location.hash
                            .substr(1)
                            .split("&")
                            .map(function(kv) { return kv.split("=", 2); })
                            .map(function(kv) { result[kv[0]] = decodeURI(kv[1]); });
                        return result;
                    },
                    set: function(values) {
                        var hash = "";
                        for (var k in values) {
                            if (hash) hash += "&";
                            hash += k + "=" + encodeURI(values[k]);
                        }
                        location.hash = hash;
                    }
                });
