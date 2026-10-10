"""
Monitoring service for collecting and reporting application metrics.
"""
import time
import threading
from typing import Dict, Any, List
from collections import defaultdict, deque
from datetime import datetime, timedelta
from app.core.errors import ProcessingException


class MonitoringService:
    """Service for collecting application metrics."""

    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(MonitoringService, cls).__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        # Request metrics
        self.request_count = defaultdict(int)
        self.request_duration = defaultdict(list)
        self.request_errors = defaultdict(int)

        # Processing metrics
        self.processing_count = defaultdict(int)
        self.processing_duration = defaultdict(list)
        self.processing_errors = defaultdict(int)

        # Error tracking
        self.recent_errors = deque(maxlen=100)  # Keep last 100 errors

        # Health checks
        self.health_checks = {
            "database": True,
            "storage": True,
            "queue": True
        }

        self._initialized = True

    def record_request(self, method: str, endpoint: str, status_code: int, duration: float):
        """Record metrics for an HTTP request."""
        key = f"{method} {endpoint}"
        self.request_count[key] += 1
        self.request_duration[key].append(duration)

        # Keep only last 1000 durations to prevent memory growth
        if len(self.request_duration[key]) > 1000:
            self.request_duration[key] = self.request_duration[key][-1000:]

        if status_code >= 400:
            self.request_errors[key] += 1

    def record_processing(self, pipeline: str, stage: str, duration: float, success: bool = True):
        """Record metrics for a processing stage."""
        key = f"{pipeline}:{stage}"
        self.processing_count[key] += 1
        self.processing_duration[key].append(duration)

        # Keep only last 1000 durations
        if len(self.processing_duration[key]) > 1000:
            self.processing_duration[key] = self.processing_duration[key][-1000:]

        if not success:
            self.processing_errors[key] += 1

    def record_error(self, error: Exception, context: str = ""):
        """Record an error occurrence."""
        error_info = {
            "timestamp": datetime.utcnow().isoformat(),
            "error_type": type(error).__name__,
            "error_message": str(error),
            "context": context
        }
        self.recent_errors.append(error_info)

    def update_health_check(self, component: str, status: bool):
        """Update the health status of a component."""
        if component in self.health_checks:
            self.health_checks[component] = status

    def get_metrics(self) -> Dict[str, Any]:
        """Get current metrics."""
        # Calculate averages for request durations
        request_metrics = {}
        for key, durations in self.request_duration.items():
            if durations:
                request_metrics[key] = {
                    "count": self.request_count[key],
                    "avg_duration": sum(durations) / len(durations),
                    "error_count": self.request_errors[key],
                    "error_rate": self.request_errors[key] / max(1, self.request_count[key])
                }
            else:
                request_metrics[key] = {
                    "count": self.request_count[key],
                    "avg_duration": 0,
                    "error_count": self.request_errors[key],
                    "error_rate": 0
                }

        # Calculate averages for processing durations
        processing_metrics = {}
        for key, durations in self.processing_duration.items():
            if durations:
                processing_metrics[key] = {
                    "count": self.processing_count[key],
                    "avg_duration": sum(durations) / len(durations),
                    "error_count": self.processing_errors[key],
                    "error_rate": self.processing_errors[key] / max(1, self.processing_count[key])
                }
            else:
                processing_metrics[key] = {
                    "count": self.processing_count[key],
                    "avg_duration": 0,
                    "error_count": self.processing_errors[key],
                    "error_rate": 0
                }

        # Calculate overall health
        health_status = all(self.health_checks.values())

        return {
            "timestamp": datetime.utcnow().isoformat(),
            "health": {
                "status": "healthy" if health_status else "unhealthy",
                "checks": self.health_checks
            },
            "requests": request_metrics,
            "processing": processing_metrics,
            "recent_errors": list(self.recent_errors)[-10:],  # Last 10 errors
            "summary": {
                "total_requests": sum(self.request_count.values()),
                "total_errors": sum(self.request_errors.values()),
                "total_processing_operations": sum(self.processing_count.values()),
                "total_processing_errors": sum(self.processing_errors.values())
            }
        }

    def reset_metrics(self):
        """Reset all metrics (useful for testing)."""
        self.request_count.clear()
        self.request_duration.clear()
        self.request_errors.clear()
        self.processing_count.clear()
        self.processing_duration.clear()
        self.processing_errors.clear()
        self.recent_errors.clear()
        # Don't reset health checks


# Global instance
monitoring_service = MonitoringService()


def record_request_metrics(method: str, endpoint: str, status_code: int, duration: float):
    """Convenience function to record request metrics."""
    monitoring_service.record_request(method, endpoint, status_code, duration)


def record_processing_metrics(pipeline: str, stage: str, duration: float, success: bool = True):
    """Convenience function to record processing metrics."""
    monitoring_service.record_processing(pipeline, stage, duration, success)


def record_error_metrics(error: Exception, context: str = ""):
    """Convenience function to record errors."""
    monitoring_service.record_error(error, context)


def get_current_metrics() -> Dict[str, Any]:
    """Convenience function to get current metrics."""
    return monitoring_service.get_metrics()