"""
Monitoring middleware for collecting request metrics.
"""
import time
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.services.monitoring_service import record_request_metrics


class MonitoringMiddleware(BaseHTTPMiddleware):
    """Middleware to collect HTTP request metrics."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Record start time
        start_time = time.time()

        # Process the request
        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            # If there's an exception, we still want to record the request
            status_code = 500
            raise e
        finally:
            # Calculate duration
            duration = time.time() - start_time

            # Record metrics
            record_request_metrics(
                method=request.method,
                endpoint=request.url.path,
                status_code=status_code,
                duration=duration
            )

        return response