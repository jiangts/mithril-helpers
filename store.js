/**
 * Use this if you want the ease of use you'd get with v0.2's `m.prop()`, but
 * you don't want to pull in an entire stream library just to have it.
 *
 * It's also safe against recursive modifications when observing - they instead
 * don't notify like they would normally, avoiding a quick stack overflow.
 */

;(function () {
    "use strict"

    if (typeof exports === "object" && exports) {
        module.exports = makeStore
    } else if (typeof m !== "function") {
        throw new Error("Mithril must be loaded first!")
    } else {
        (m.helpers || (m.helpers = {})).makeStore = makeStore
    }

    // So engines don't think to "optimize" the memory layout by making a shared
    // closure for both objects.
    //
    // Note: this uses `onchange` itself as the lock, so it doesn't require an
    // extra variable.
    function makeObserved(store, onchange) {
        return function () {
            if (!arguments.length) return store
            var old = store
            var func = onchange
            var value = (store = arguments[0])

            if (func) {
                onchange = null
                try {
                    func(value, old)
                } finally {
                    onchange = func
                }
            }

            return value
        }
    }

    function makeStore(store, onchange) {
        if (typeof onchange === "function") {
            // Attribute used here for whenever Terser finally implements this
            // https://github.com/terser/terser/issues/350
            return /*@__NOINLINE__*/ makeObserved(store, onchange)
        } else {
            return function () {
                return arguments.length ? (store = arguments[0]) : store
            }
        }
    }
})()
