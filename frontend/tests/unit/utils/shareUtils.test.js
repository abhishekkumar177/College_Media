/**
 * Unit Tests - Share Utilities
 * Tests clipboard and URL generation functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  copyToClipboard,
  generatePostUrl,
  copyPostLink,
  isClipboardSupported,
  fallbackCopyToClipboard,
} from '../../../src/utils/shareUtils';

// Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn(),
};

Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});

describe('Share Utilities', () => {
  const mockPost = {
    id: '123',
    user: { username: 'testuser' },
    caption: 'Test post',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset clipboard mock
    mockClipboard.writeText.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isClipboardSupported', () => {
    it('should return true when clipboard is supported', () => {
      expect(isClipboardSupported()).toBe(true);
    });

    it('should return false when navigator is undefined', () => {
      const originalNavigator = global.navigator;
      delete global.navigator;
      expect(isClipboardSupported()).toBe(false);
      global.navigator = originalNavigator;
    });

    it('should return false when clipboard is not available', () => {
      delete navigator.clipboard;
      expect(isClipboardSupported()).toBe(false);
      // Restore clipboard
      navigator.clipboard = mockClipboard;
    });
  });

  describe('generatePostUrl', () => {
    it('should generate correct post URL', () => {
      const url = generatePostUrl(mockPost);
      expect(url).toBe('http://localhost:5173/post/123');
    });

    it('should handle different origins', () => {
      // Mock window.location.origin
      const originalOrigin = window.location.origin;
      Object.defineProperty(window.location, 'origin', {
        value: 'https://example.com',
        writable: true,
      });

      const url = generatePostUrl(mockPost);
      expect(url).toBe('https://example.com/post/123');
      // Restore original origin
      Object.defineProperty(window.location, 'origin', {
        value: originalOrigin,
        writable: true,
      });
    });
  });

  describe('copyToClipboard', () => {
    it('should copy text to clipboard successfully', async () => {
      mockClipboard.writeText.mockResolvedValue();
      const result = await copyToClipboard('test text');
      expect(mockClipboard.writeText).toHaveBeenCalledWith('test text');
      expect(result).toBe(true);
    });

    it('should handle clipboard errors', async () => {
      const error = new Error('Clipboard not allowed');
      mockClipboard.writeText.mockRejectedValue(error);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await copyToClipboard('test text');
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to copy to clipboard:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('copyPostLink', () => {
    it('should copy post link successfully', async () => {
      mockClipboard.writeText.mockResolvedValue();
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const result = await copyPostLink(mockPost, onSuccess, onError);
      expect(mockClipboard.writeText).toHaveBeenCalledWith('http://localhost:5173/post/123');
      expect(onSuccess).toHaveBeenCalledWith('123');
      expect(onError).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle clipboard errors', async () => {
      const error = new Error('Clipboard denied');
      mockClipboard.writeText.mockRejectedValue(error);
      const onSuccess = vi.fn();
      const onError = vi.fn();
      const result = await copyPostLink(mockPost, onSuccess, onError);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('fallbackCopyToClipboard', () => {
    // Mock document methods
    const mockTextArea = {
      value: '',
      style: {},
      focus: vi.fn(),
      select: vi.fn(),
      setAttribute: vi.fn(),
    };
    const originalCreateElement = document.createElement;
    const originalBody = document.body;
    beforeEach(() => {
      document.createElement = vi.fn(() => mockTextArea);
      document.body = {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      };
      document.execCommand = vi.fn(() => true);
    });
    afterEach(() => {
      document.createElement = originalCreateElement;
      document.body = originalBody;
    });

    it('should use fallback method when clipboard API fails', () => {
      const result = fallbackCopyToClipboard('test text');
      expect(document.createElement).toHaveBeenCalledWith('textarea');
      expect(mockTextArea.value).toBe('test text');
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(document.body.appendChild).toHaveBeenCalledWith(mockTextArea);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockTextArea);
      expect(result).toBe(true);
    });
    it('should handle fallback errors', () => {
      document.execCommand = vi.fn(() => false);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = fallbackCopyToClipboard('test text');
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});