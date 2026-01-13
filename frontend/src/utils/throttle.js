/**
 * Throttle utility function
 * Ensures that a function is executed at most once every 'limit' milliseconds.
 * 
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @param {Object} options - Options object
 * @param {boolean} options.leading - If true, execute on first call (default: true)
 * @param {boolean} options.trailing - If true, execute after limit expires (default: true)
 * @returns {Function} - The throttled function
 */
export const throttle = (func, limit, options = {}) => {
    let leading = true;
    let trailing = true;

    if (typeof func !== 'function') {
        throw new TypeError('Expected a function');
    }

    if (options) {
        leading = 'leading' in options ? !!options.leading : leading;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    let context, args, result;
    let timeout = null;
    let previous = 0;

    const later = function () {
        previous = leading === false ? 0 : Date.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };

    const throttled = function () {
        const now = Date.now();
        if (!previous && leading === false) previous = now;
        const remaining = limit - (now - previous);
        context = this;
        args = arguments;

        if (remaining <= 0 || remaining > limit) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        return result;
    };

    throttled.cancel = function () {
        clearTimeout(timeout);
        previous = 0;
        timeout = context = args = null;
    };

    return throttled;
};
