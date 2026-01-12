import { useState, useCallback } from 'react';
import { analyzeContent } from '../utils/contentModerator';

const useContentModeration = () => {
    const [warnings, setWarnings] = useState([]);
    const [isClean, setIsClean] = useState(true);
    const [bypassMode, setBypassMode] = useState(false);

    const analyze = useCallback((content) => {
        // If we have already confirmed/bypassed, don't block
        if (bypassMode) {
            return { isClean: true, warnings: [] };
        }

        const result = analyzeContent(content);

        setIsClean(!result.isFlagged);
        setWarnings(result.suggestions);

        return {
            isClean: !result.isFlagged,
            warnings: result.suggestions
        };
    }, [bypassMode]);

    const resetModeration = useCallback(() => {
        setWarnings([]);
        setIsClean(true);
        setBypassMode(false);
    }, []);

    const bypass = useCallback(() => {
        setBypassMode(true);
        setIsClean(true);
        setWarnings([]);
    }, []);

    return {
        isClean,
        warnings,
        analyze,
        bypass,
        resetModeration
    };
};

export default useContentModeration;
