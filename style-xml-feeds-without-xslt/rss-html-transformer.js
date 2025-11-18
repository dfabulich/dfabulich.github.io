// helper function to create an xhtml element with children
function h(tagName, attributes, ...children) {
    const element = document.createElementNS("http://www.w3.org/1999/xhtml", tagName);
    for (const [name, value] of Object.entries(attributes ?? {})) {
        element.setAttribute(name, value);
    }
    element.append(...children.filter(child => child != null));
    return element;
}

// add <head>, hide everything to prevent flash of unstyled content (FOUC)
var head = h('head', {},
    h('style', {}, `rss > channel > * { display: none; }`)
);
document.documentElement.append(head);

document.addEventListener('DOMContentLoaded', function () {
    // convert elements to HTML
    document.querySelectorAll('description').forEach(element => {
        var result = h(element.tagName);
        result.innerHTML = element.textContent;
        element.replaceWith(result);
    });

    // populate <head>
    head.append(h('head', {},
        h('title', {}, document.querySelector('rss > channel > title').textContent),
        h('meta', { name: "viewport", content: "width=device-width" }),
        h('style', {}, `
            item > * {
                display: none;
            }
            rss > channel > title, rss > channel > item, item title, item pubDate, item description {
                display: block;
            }
        `)
    ));

    // convert top-level `<title>/<link>` into `<h1><a>title</a></h1>`
    var feedTitle = document.querySelector('rss > channel > title');
    var feedLink = document.querySelector('rss > channel > link:not([rel])');
    var newLink = h('h1', {}, h('a', { href: feedLink.getAttribute('href') }, ...feedTitle.childNodes))
    feedTitle.replaceChildren(newLink);

    // convert entry-level `<title>/<link>`s into `<h2><a>title</a></h2>`
    document.querySelectorAll('item').forEach(entry => {
        var title = entry.querySelector('title');
        var link = entry.querySelector('link:not([rel])');
        var newLink = h('h2', {}, h('a', { href: link.getAttribute('href') }, ...title.childNodes));
        title.replaceChildren(newLink);
    });

    // date format `<pubDate>` elements
    document.querySelectorAll('pubDate').forEach(element => {
        element.textContent = new Date(element.textContent).toLocaleString();
    });
});