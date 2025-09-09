import { useState, useEffect, useCallback } from 'react';
import { ProcessResult } from './repoFlattenerService';
import { FileInfo } from './repoFlattenerService';

interface UseIncrementalRenderingProps {
  result: ProcessResult | null;
}

export const useIncrementalRendering = ({ result }: UseIncrementalRenderingProps) => {
  const [visibleRendered, setVisibleRendered] = useState<FileInfo[]>([]);
  const [loadIndex, setLoadIndex] = useState(0);
  const batchSize = 8;

  const enqueueBatch = useCallback(() => {
    if (!result) return;

    const next = result.rendered.slice(0, loadIndex + batchSize);
    setLoadIndex(next.length);
    setVisibleRendered(next);

    if (next.length < result.rendered.length) {
      requestAnimationFrame(() => enqueueBatch());
    }
  }, [result, loadIndex, batchSize]);

  useEffect(() => {
    if (!result) {
      setVisibleRendered([]);
      setLoadIndex(0);
    } else {
      setLoadIndex(0);
      enqueueBatch();
    }
  }, [result, enqueueBatch]);

  const loadMore = useCallback(() => {
    enqueueBatch();
  }, [enqueueBatch]);

  const getVisibleCount = useCallback(() => {
    return visibleRendered.length;
  }, [visibleRendered]);

  const getTotalCount = useCallback(() => {
    return result ? result.rendered.length : 0;
  }, [result]);

  return {
    visibleRendered,
    loadMore,
    getVisibleCount,
    getTotalCount
  };
};
