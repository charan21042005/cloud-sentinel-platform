"""
Centralized PromQL Registry.
Decouples mathematical logic from the execution engine and the frontend.
"""

class PromQLRegistry:
    # --- Instant Queries (Gauges & Counters) ---
    CPU_UTILIZATION = '100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)'
    MEMORY_UTILIZATION = '100 * (1 - ((avg(node_memory_MemFree_bytes) + avg(node_memory_Cached_bytes) + avg(node_memory_Buffers_bytes)) / avg(node_memory_MemTotal_bytes)))'
    REQUEST_THROUGHPUT = 'sum(rate(http_requests_total[1m]))'
    API_LATENCY = '(sum(rate(http_request_duration_seconds_sum[1m])) / sum(rate(http_request_duration_seconds_count[1m]))) * 1000'

    # --- Range Queries (Time-Series Area Charts) ---
    CPU_HISTORY = CPU_UTILIZATION
    MEMORY_HISTORY = MEMORY_UTILIZATION
