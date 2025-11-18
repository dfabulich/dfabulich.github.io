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
    h('style', {}, `feed > * { display: none; }`)
);
document.documentElement.append(head);

document.addEventListener('DOMContentLoaded', function () {
    // convert atom text constructs to HTML
    document.querySelectorAll('content, rights, subtitle, summary, title').forEach(element => {
        var type = element.getAttribute("type");
        if (type === "html" || type === "xhtml") {
            var result = h(element.tagName);
            result.innerHTML = element.textContent;
            element.replaceWith(result);
        }
    });

    // populate <head>
    head.append(h('head', {},
        h('title', {}, document.querySelector('feed > title').textContent),
        h('meta', { name: "viewport", content: "width=device-width" }),
        h('style', {}, `
            entry > * {
                display: none;
            }
            feed > title, entry, entry title, entry updated, entry content {
                display: block;
            }
            entry summary:not(:has(~ content)) {
                display: block;
            }
        `)
    ));

    // convert top-level `<title>/<link>` into `<h1><a>title</a></h1>`
    var feedTitle = document.querySelector('feed > title');
    var feedLink = document.querySelector('feed > link:not([rel])');
    var newLink = h('h1', {}, h('a', { href: feedLink.getAttribute('href') }, ...feedTitle.childNodes))
    feedTitle.replaceChildren(newLink);

    // convert entry-level `<title>/<link>`s into `<h2><a>title</a></h2>`
    document.querySelectorAll('entry').forEach(entry => {
        var title = entry.querySelector('title');
        var link = entry.querySelector('link:not([rel])');
        var newLink = h('h2', {}, h('a', { href: link.getAttribute('href') }, ...title.childNodes));
        title.replaceChildren(newLink);
    });

    // date format `<updated>`/`<published>` elements
    document.querySelectorAll('updated, published').forEach(element => {
        element.textContent = new Date(element.textContent).toLocaleString();
    });
});