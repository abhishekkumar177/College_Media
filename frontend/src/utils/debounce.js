/**
 * Debounce utility function
 * Delays the execution of a function until after 'delay' milliseconds have elapsed
 * since the last time the debounced function was invoked.
 * 
 * @param {Function} func - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @param {Object} options - Options object
 * @param {boolean} options.leading - If true, execute immediately on first call
 * @param {boolean} options.trailing - If true, execute after delay (default: true)
 * @param {number} options.maxWait - Maximum time to wait before forcing execution
 * @returns {Function} - The debounced function
 */
export const debounce = (func, delay, options = {}) => {
    let timerId;
    let lastArgs;
    let lastThis;
    let maxWaitTimerId;
    let lastCallTime;
    let lastInvokeTime = 0;

    const {
        leading = false,
        trailing = true,
        maxWait
    } = options;

    const maxing = 'maxWait' in options;

    const invokeFunc = (time) => {
        const args = lastArgs;
        const thisArg = lastThis;

        lastArgs = undefined;
        lastThis = undefined;
        lastInvokeTime = time;

        return func.apply(thisArg, args);
    };

    const trailingEdge = (time) => {
        timerId = undefined;

        if (trailing && lastArgs) {
            return invokeFunc(time);
        }
        lastArgs = undefined;
        lastThis = undefined;
        return undefined;
    };

    const remainingWait = (time) => {
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;
        const timeWaiting = delay - timeSinceLastCall;

        return maxing
            ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
            : timeWaiting;
    };

    const shouldInvoke = (time) => {
        const timeSinceLastCall = time - lastCallTime;
        const timeSinceLastInvoke = time - lastInvokeTime;

        return (
            lastCallTime === undefined ||
            timeSinceLastCall >= delay ||
            timeSinceLastCall < 0 ||
            (maxing && timeSinceLastInvoke >= maxWait)
        );
    };

    const timerExpired = () => {
        const time = Date.now();
        if (shouldInvoke(time)) {
            return trailingEdge(time);
        }
        timerId = setTimeout(timerExpired, remainingWait(time));
    };

    const leadingEdge = (time) => {
        lastInvokeTime = time;
        timerId = setTimeout(timerExpired, delay);
        return leading ? invokeFunc(time) : undefined;
    };

    const debounced = function (...args) {
        const time = Date.now();
        lastArgs = args;
        lastThis = this;
        lastCallTime = time;

        if (shouldInvoke(time)) {
            if (timerId === undefined) {
                return leadingEdge(time);
            }
            if (maxing) {
                // Handle tight loop
                clearTimeout(timerId);
                timerId = setTimeout(timerExpired, delay);
                return invokeFunc(time);
            }
        }
        if (timerId === undefined) {
            timerId = setTimeout(timerExpired, delay);
        }
        return undefined;
    };

    debounced.cancel = () => {
        if (timerId !== undefined) {
            clearTimeout(timerId);
        }
        if (maxWaitTimerId !== undefined) {
            clearTimeout(maxWaitTimerId);
        }
        lastInvokeTime = 0;
        lastArgs = undefined;
        lastCallTime = undefined;
        lastThis = undefined;
        timerId = undefined;
        maxWaitTimerId = undefined;
    };

    debounced.flush = () => {
        return timerId === undefined ? undefined : trailingEdge(Date.now());
    };

    return debounced;
};
