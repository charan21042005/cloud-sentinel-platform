from datetime import datetime, timezone
from typing import List, Any
from app.schemas.telemetry import TimeSeriesPoint


class TelemetryTransformer:
    """
    Data normalization layer. Transforms complex TSDB structures into pristine
    JSON/Pydantic models expected by frontend charting libraries.
    """

    @staticmethod
    def normalize_time_series(raw_values: List[List[Any]]) -> List[TimeSeriesPoint]:
        """
        Converts Prometheus [[unix_time, "value"], ...] into strict Pydantic objects.
        Ensures floating point conversion and strict ISO8601 formatting.
        """
        normalized = []
        for point in raw_values:
            if len(point) != 2:
                continue

            unix_time, string_val = point
            try:
                # Prometheus timestamp is in seconds
                dt = datetime.fromtimestamp(unix_time, tz=timezone.utc)
                iso_time = dt.isoformat()

                # Format to 1 decimal place to prevent React re-render thrashing
                val = round(float(string_val), 1)

                normalized.append(TimeSeriesPoint(timestamp=iso_time, value=val))
            except (ValueError, TypeError):
                continue

        return normalized
