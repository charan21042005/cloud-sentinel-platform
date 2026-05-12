export const PROMQL_QUERIES = {
  // --- Infrastructure Health ---
  
  // Calculate average CPU utilization across all nodes
  CPU_UTILIZATION: '100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)',
  
  // Calculate percentage of memory used
  MEMORY_UTILIZATION: '100 * (1 - ((avg(node_memory_MemFree_bytes) + avg(node_memory_Cached_bytes) + avg(node_memory_Buffers_bytes)) / avg(node_memory_MemTotal_bytes)))',
  
  // --- API Performance ---
  
  // Total requests per second
  REQUEST_THROUGHPUT: 'sum(rate(http_requests_total[1m]))',
  
  // Average latency in milliseconds
  // Using the sum of duration / count of requests (converted from seconds to ms)
  API_LATENCY: '(sum(rate(http_request_duration_seconds_sum[1m])) / sum(rate(http_request_duration_seconds_count[1m]))) * 1000',
  
  // --- Historical Area Charts (Range Queries) ---
  CPU_HISTORY: '100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)',
  MEMORY_HISTORY: '100 * (1 - ((avg(node_memory_MemFree_bytes) + avg(node_memory_Cached_bytes) + avg(node_memory_Buffers_bytes)) / avg(node_memory_MemTotal_bytes)))',
};
