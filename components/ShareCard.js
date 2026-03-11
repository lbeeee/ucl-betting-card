'use client';

import { useCallback, useRef, useState } from 'react';

/**
 * Share button that exports a DOM element as a downloadable PNG.
 * Uses html-to-image library.
 */
export default function ShareCard({ targetRef, filename = 'ucl-bet-card' }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!targetRef?.current) return;
    setIsExporting(true);

    try {
      // Dynamic import to avoid SSR issues
      const { toPng } = await import('html-to-image');

      const dataUrl = await toPng(targetRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#05080e',
        style: {
          borderRadius: '0',
        },
      });

      // Trigger download
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [targetRef, filename]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!targetRef?.current) return;
    setIsExporting(true);

    try {
      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(targetRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#05080e',
      });

      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        // Brief flash of "Copied!"
        setIsExporting('copied');
        setTimeout(() => setIsExporting(false), 1500);
        return;
      }
    } catch (err) {
      console.error('Copy failed:', err);
    }
    setIsExporting(false);
  }, [targetRef]);

  return (
    <div className="share-buttons">
      <button
        className="share-btn share-btn--download"
        onClick={handleExport}
        disabled={isExporting === true}
      >
        {isExporting === true ? '⏳' : '📥'} Save as Image
      </button>
      <button
        className="share-btn share-btn--copy"
        onClick={handleCopyToClipboard}
        disabled={isExporting === true}
      >
        {isExporting === 'copied' ? '✓ Copied!' : '📋 Copy to Clipboard'}
      </button>
    </div>
  );
}
