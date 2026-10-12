import { describe, expect, it } from 'vitest';
import { mergeMetricHistory, mergeSystemMetrics } from './useMetrics';

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

describe('mergeSystemMetrics', () => {
  it('does not replace newer metric or connectivity samples with an out-of-order response', () => {
    const newer = new Date('2026-10-12T10:00:10.000Z').toISOString();
    const older = new Date('2026-10-12T10:00:05.000Z').toISOString();
    const laterResponse = new Date('2026-10-12T10:00:12.000Z').toISOString();
    const base = {
      source: 'prometheus' as const,
      cpu_usage: 42,
      memory_usage: 55,
      request_rate_per_second: 1.5,
      latency_ms: 12,
      metric_timestamps: {
        cpu_usage: newer,
        memory_usage: newer,
        request_rate_per_second: newer,
        latency_ms: newer,
      },
      source_reachable: true,
      source_checked_at: newer,
      response_started_at: newer,
      history: { cpu: [{ timestamp: newer, value: 42 }], memory: [{ timestamp: newer, value: 55 }] },
    };
    const delayed = {
      ...base,
      cpu_usage: 30,
      request_rate_per_second: 0.5,
      metric_timestamps: {
        ...base.metric_timestamps,
        cpu_usage: older,
        request_rate_per_second: older,
      },
      source_reachable: false,
      source_checked_at: older,
      response_started_at: laterResponse,
      history: { cpu: [{ timestamp: older, value: 30 }], memory: [] },
    };

    const result = mergeSystemMetrics(base, delayed);

    expect(result.cpu_usage).toBe(42);
    expect(result.metric_timestamps?.cpu_usage).toBe(newer);
    expect(result.request_rate_per_second).toBe(1.5);
    expect(result.source_reachable).toBe(true);
    expect(result.source_checked_at).toBe(newer);
    expect(result.history.cpu.map((point) => point.timestamp)).toEqual([older, newer]);

    const delayedSourceFallback = {
      ...delayed,
      source: 'simulated' as const,
      response_started_at: older,
    };
    expect(mergeSystemMetrics(base, delayedSourceFallback)).toBe(base);
  });
});
