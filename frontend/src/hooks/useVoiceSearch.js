/**
 * useVoiceSearch Hook
 * Issue #408: Implement Advanced Search with Filters and Voice Search Support
 * 
 * A custom hook for implementing voice search using the Web Speech API.
 * Provides voice-to-text functionality with browser compatibility handling.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useVoiceSearch
 * 
 * @param {Object} options - Configuration options
 * @param {string} [options.lang='en-US'] - Language for speech recognition
 * @param {boolean} [options.continuous=false] - Whether to continue listening after pause
 * @param {Function} [options.onResult] - Callback when transcript is updated
 * @param {Function} [options.onEnd] - Callback when recognition ends
 * @returns {Object} { isListening, transcript, startListening, stopListening, error, isSupported }
 */
const useVoiceSearch = ({
    lang = 'en-US',
    continuous = false,
    onResult,
    onEnd
} = {}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);
    const [isSupported, setIsSupported] = useState(false);

    const recognitionRef = useRef(null);

    // Check browser compatibility
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            setIsSupported(true);
            recognitionRef.current = new SpeechRecognition();

            // Configure recognition
            recognitionRef.current.continuous = continuous;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = lang;

            // Handle results
            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcriptPiece = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcriptPiece + ' ';
                    } else {
                        interimTranscript += transcriptPiece;
                    }
                }

                const fullTranscript = (finalTranscript || interimTranscript).trim();
                setTranscript(fullTranscript);

                if (onResult) {
                    onResult(fullTranscript);
                }
            };

            // Handle errors
            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setError(event.error);
                setIsListening(false);

                // User-friendly error messages
                const errorMessages = {
                    'no-speech': 'No speech detected. Please try again.',
                    'audio-capture': 'Microphone not found. Please check your device.',
                    'not-allowed': 'Microphone access denied. Please allow microphone access.',
                    'network': 'Network error. Please check your connection.',
                    'aborted': 'Speech recognition aborted.'
                };

                setError(errorMessages[event.error] || 'An error occurred. Please try again.');
            };

            // Handle end
            recognitionRef.current.onend = () => {
                setIsListening(false);
                if (onEnd) {
                    onEnd();
                }
            };
        } else {
            setIsSupported(false);
            setError('Voice search is not supported in your browser. Please use Chrome, Edge, or Safari.');
        }

        // Cleanup
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [lang, continuous, onResult, onEnd]);

    /**
     * Start listening for voice input
     */
    const startListening = useCallback(() => {
        if (!isSupported) {
            setError('Voice search is not supported in your browser.');
            return;
        }

        if (recognitionRef.current && !isListening) {
            setError(null);
            setTranscript('');

            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (err) {
                console.error('Failed to start recognition:', err);
                setError('Failed to start voice recognition. Please try again.');
            }
        }
    }, [isSupported, isListening]);

    /**
     * Stop listening for voice input
     */
    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    /**
     * Reset transcript and error
     */
    const reset = useCallback(() => {
        setTranscript('');
        setError(null);
    }, []);

    return {
        isListening,
        transcript,
        error,
        isSupported,
        startListening,
        stopListening,
        reset
    };
};

export default useVoiceSearch;

/**
 * Example Usage:
 * 
 * const { 
 *   isListening, 
 *   transcript, 
 *   error, 
 *   isSupported,
 *   startListening, 
 *   stopListening 
 * } = useVoiceSearch({
 *   lang: 'en-US',
 *   onResult: (text) => {
 *     console.log('Voice input:', text);
 *     setSearchQuery(text);
 *   }
 * });
 * 
 * return (
 *   <button 
 *     onClick={isListening ? stopListening : startListening}
 *     disabled={!isSupported}
 *   >
 *     {isListening ? 'Stop' : 'Start'} Voice Search
 *   </button>
 * );
 */
