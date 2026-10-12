"""
Centralized PromQL Registry.
Decouples mathematical logic from the execution engine and the frontend.
"""


class PromQLRegistry:
    # --- Instant Queries (Gauges & Counters) ---
    CPU_UTILIZATION = '100 - (avg(rate(node_cpu_seconds_total{job="node-exporter",mode="idle"}[1m])) * 100)'
    MEMORY_UTILIZATION = '100 * (1 - ((avg(node_memory_MemFree_bytes{job="node-exporter"}) + avg(node_memory_Cached_bytes{job="node-exporter"}) + avg(node_memory_Buffers_bytes{job="node-exporter"})) / avg(node_memory_MemTotal_bytes{job="node-exporter"})))'
    REQUEST_THROUGHPUT = 'sum(rate(http_requests_total{job="sentinel-api"}[1m]))'
    API_LATENCY = '(sum(rate(http_request_duration_seconds_sum{job="sentinel-api"}[1m])) / sum(rate(http_request_duration_seconds_count{job="sentinel-api"}[1m]))) * 1000'

    # timestamp() preserves source scrape time rather than query evaluation time.
    CPU_SAMPLE_TIMESTAMP = 'max(timestamp(node_cpu_seconds_total{job="node-exporter",mode="idle"}))'
    MEMORY_SAMPLE_TIMESTAMP = 'max(timestamp(node_memory_MemTotal_bytes{job="node-exporter"}))'
    REQUEST_SAMPLE_TIMESTAMP = 'max(timestamp(http_requests_total{job="sentinel-api"}))'
    LATENCY_SAMPLE_TIMESTAMP = 'max(timestamp(http_request_duration_seconds_count{job="sentinel-api"}))'

    # --- Range Queries (Time-Series Area Charts) ---
    CPU_HISTORY = CPU_UTILIZATION
    MEMORY_HISTORY = MEMORY_UTILIZATION
