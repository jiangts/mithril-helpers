[*Up*](./api.md)

# mithril-helpers/self-sufficient

Exposes a `SelfSufficient` component, for making self-sufficient (i.e. no dependency on `m.redraw`) object/closure and class components, respectively. It's also useful if you're using `m.render` directly, since you don't have to worry about implementing batching and all the other annoying crap.

- `m(m.helpers.SelfSufficient, {view: (state) -> vnode})` - Create a new instance to do subtree management.
    - `view` is what you want your subtree to look like. It's a function called on each redraw. Note that you *must* return an actual DOM node.
    - The returned vnode is what's used to redraw with, and is what's ultimately returned.

- `state.safe()` - Whether it's safe to invoke `redrawSync`.

- `state.redraw()` - Schedule a redraw for this subtree.

- `state.redrawSync()` - Force a synchronous redraw for this vnode.

- `state.link(handler)` - Wrap an event handler to implicitly redraw iff `e.redraw !== false`, much like how Mithril normally does implicitly when you use `m.mount`.

When you call `state.redraw(vnode)`, when it redraws, it also defines a few of Mithril's lifecycle methods (and will wrap existing handlers if necessary).

Here's a few examples of how it's used:

```js
// Objects
const Comp = {
    oninit() { this.clicked = false },
    view(vnode) {
        return m(m.helpers.SelfSufficient, {view: state => m("div", [
            m(".foo", "What is this?"),
            this.clicked
                ? m(".bar.fail", "Why did you click me?!?")
                : m(".bar", {
                    onclick: state.link(() => { this.clicked = true }),
                }, "Just kidding, nothing to see here..."),
        ])})
    }
}

// Closures
function Comp() {
    var clicked = false

    return {
        view(vnode) {
            return m(m.helpers.SelfSufficient, {view: state => m("div", [
                m(".foo", "What is this?"),
                this.clicked
                    ? m(".bar.fail", "Why did you click me?!?")
                    : m(".bar", {
                        onclick: state.link(() => { this.clicked = true }),
                    }, "Just kidding, nothing to see here..."),
            ])})
        }
    })
}

// Classes
class Comp {
    constructor() {
        this.clicked = false
    }

    view(vnode) {
        return m(m.helpers.SelfSufficient, {view: state => m("div", [
            m(".foo", "What is this?"),
            this.clicked
                ? m(".bar.fail", "Why did you click me?!?")
                : m(".bar", {
                    onclick: state.link(() => { this.clicked = true }),
                }, "Just kidding, nothing to see here..."),
        ])})
    }
}
```

Note that this requires a `Set` and `Array.from` polyfill to work.

## Usage

- `m.helpers.selfSufficient(view: (state) -> vnode) -> vnode`

    - `view` is the function used to generate the tree. It must return a DOM vnode.

- `state.safe() -> boolean`

    - Returns `true` if you are able to redraw synchronously (i.e. no other redraw is occurring), `false` otherwise.

- `state.redraw() -> void`

    - Schedules an async redraw, batching the call if necessary.
    - Returns `undefined`.

- `state.redrawSync() -> void`

    - Performs an immediate redraw, cancelling any scheduled async redraw if necessary.
    - Returns `undefined`.
    - Throws if any redraw is occurring known to the helper.

- `state.link(handler) -> handler`

    - Accepts either a function or event listener object.
    - Returns a function that when called with an event:
        - Invokes the handler with the event.
        - If `ev.redraw` (where `ev` is the event) is not `false`, schedules an async redraw, batching the call if necessary.
        - Returns `undefined`