/**
 * Keyboard Shortcuts Definitions
 * Issue #422: Implement Global Keyboard Shortcuts System
 * 
 * Centralized configuration for all keyboard shortcuts in the application.
 */

export const SHORTCUT_CATEGORIES = {
    NAVIGATION: 'Navigation',
    ACTIONS: 'Actions',
    MODALS: 'Modals & Dialogs',
    GENERAL: 'General'
};

export const SHORTCUTS = {
    // Navigation
    GO_HOME: {
        keys: ['g', 'h'],
        description: 'Go to Home',
        category: SHORTCUT_CATEGORIES.NAVIGATION,
        sequence: true
    },
    GO_PROFILE: {
        keys: ['g', 'p'],
        description: 'Go to Profile',
        category: SHORTCUT_CATEGORIES.NAVIGATION,
        sequence: true
    },
    GO_MESSAGES: {
        keys: ['g', 'm'],
        description: 'Go to Messages',
        category: SHORTCUT_CATEGORIES.NAVIGATION,
        sequence: true
    },
    GO_NOTIFICATIONS: {
        keys: ['g', 'n'],
        description: 'Go to Notifications',
        category: SHORTCUT_CATEGORIES.NAVIGATION,
        sequence: true
    },
    NEXT_POST: {
        keys: ['j'],
        description: 'Next Post',
        category: SHORTCUT_CATEGORIES.NAVIGATION
    },
    PREV_POST: {
        keys: ['k'],
        description: 'Previous Post',
        category: SHORTCUT_CATEGORIES.NAVIGATION
    },

    // Actions
    LIKE_POST: {
        keys: ['l'],
        description: 'Like Current Post',
        category: SHORTCUT_CATEGORIES.ACTIONS
    },
    COMMENT: {
        keys: ['c'],
        description: 'Comment on Post',
        category: SHORTCUT_CATEGORIES.ACTIONS
    },
    SHARE: {
        keys: ['s'],
        description: 'Share Post',
        category: SHORTCUT_CATEGORIES.ACTIONS
    },
    BOOKMARK: {
        keys: ['b'],
        description: 'Bookmark Post',
        category: SHORTCUT_CATEGORIES.ACTIONS
    },
    NEW_POST: {
        keys: ['n'],
        description: 'Create New Post',
        category: SHORTCUT_CATEGORIES.ACTIONS
    },

    // Modals & Dialogs
    CLOSE_MODAL: {
        keys: ['Escape'],
        description: 'Close Modal/Dialog',
        category: SHORTCUT_CATEGORIES.MODALS
    },
    SEARCH: {
        keys: ['/', 'Control+k', 'Meta+k'],
        description: 'Focus Search',
        category: SHORTCUT_CATEGORIES.GENERAL,
        preventDefault: true
    },

    // General
    SHOW_HELP: {
        keys: ['?'],
        description: 'Show Keyboard Shortcuts',
        category: SHORTCUT_CATEGORIES.GENERAL
    },
    TOGGLE_THEME: {
        keys: ['t'],
        description: 'Toggle Dark/Light Theme',
        category: SHORTCUT_CATEGORIES.GENERAL
    }
};

/**
 * Check if a key event matches a shortcut
 */
export const matchesShortcut = (event, shortcut) => {
    const { keys, sequence } = SHORTCUTS[shortcut];

    if (!keys) return false;

    // For single key shortcuts
    if (!sequence && keys.length === 1) {
        const key = keys[0];

        // Handle modifier keys
        if (key.includes('+')) {
            const parts = key.split('+');
            const modifier = parts[0];
            const mainKey = parts[1];

            if (modifier === 'Control' && !event.ctrlKey) return false;
            if (modifier === 'Meta' && !event.metaKey) return false;
            if (modifier === 'Alt' && !event.altKey) return false;
            if (modifier === 'Shift' && !event.shiftKey) return false;

            return event.key.toLowerCase() === mainKey.toLowerCase();
        }

        return event.key === key || event.key.toLowerCase() === key.toLowerCase();
    }

    return false;
};

/**
 * Format shortcut keys for display
 */
export const formatShortcutKeys = (keys, sequence = false) => {
    if (sequence) {
        return keys.map(k => k.toUpperCase()).join(' then ');
    }

    return keys.map(key => {
        if (key.includes('+')) {
            return key.split('+').map(k => {
                if (k === 'Control') return 'Ctrl';
                if (k === 'Meta') return '⌘';
                return k;
            }).join('+');
        }
        return key === '?' ? 'Shift+/' : key.toUpperCase();
    }).join(' or ');
};

/**
 * Get shortcuts grouped by category
 */
export const getShortcutsByCategory = () => {
    const grouped = {};

    Object.entries(SHORTCUTS).forEach(([key, value]) => {
        const category = value.category;
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push({ id: key, ...value });
    });

    return grouped;
};
