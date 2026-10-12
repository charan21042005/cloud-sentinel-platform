import { describe, expect, it } from 'vitest';
import { mergeMetricHistory } from './useMetrics';

describe('mergeMetricHistory', () => {
  it('deduplicates overlapping polls and retains prior samples when a poll is empty', () => {
    const previous = [
      { timestamp: '2026-10-12T10:00:00.000Z', value: 10 },
      { timestamp: '2026-10-12T10:00:15.000Z', value: 11 },
    ];
    const current = [
      { timestamp: '2026-10-12T10:00:15.000Z', value: 12 },
      { timestamp: '2026-10-12T10:00:30.000Z', value: 13 },
    ];

    expect(mergeMetricHistory(previous, [])).toEqual(previous);
    expect(mergeMetricHistory(previous, current)).toEqual([
      previous[0],
      current[0],
      current[1],
    ]);
  });
});
