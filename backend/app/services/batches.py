"""
Batch processing service with isolated bounded concurrency.
Section 15: ThreadPoolExecutor, BATCH_CONCURRENCY limit, failure isolation.
"""
from typing import List, Dict, Any, Callable
from concurrent.futures import ThreadPoolExecutor, as_completed
import uuid
from app.core.config import settings

_batch_store: Dict[str, Dict[str, Any]] = {}


class BatchService:
    """Manages multi-document batches and tracks per-item completion status."""

    @classmethod
    def create_batch(cls, total_files: int) -> str:
        batch_id = str(uuid.uuid4())
        _batch_store[batch_id] = {
            "batch_id": batch_id,
            "total_files": total_files,
            "processed": 0,
            "succeeded": 0,
            "failed": 0,
            "needs_review": 0,
            "status": "processing",
            "items": []
        }
        return batch_id

    @classmethod
    def get_batch(cls, batch_id: str) -> Dict[str, Any]:
        return _batch_store.get(batch_id, {
            "batch_id": batch_id,
            "status": "not_found",
            "total_files": 0,
            "processed": 0
        })

    @classmethod
    def list_batches(cls) -> List[Dict[str, Any]]:
        return list(_batch_store.values())

    @classmethod
    def process_batch_items(
        cls,
        batch_id: str,
        items: List[Any],
        process_func: Callable[[Any], Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Process items with bounded concurrency (BATCH_CONCURRENCY).
        Guarantees that a single item failure never crashes the batch.
        """
        max_workers = max(1, getattr(settings, "BATCH_CONCURRENCY", 3))
        batch = _batch_store.get(batch_id)
        if not batch:
            batch_id = cls.create_batch(len(items))
            batch = _batch_store[batch_id]

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_item = {executor.submit(process_func, it): it for it in items}

            for future in as_completed(future_to_item):
                batch["processed"] += 1
                try:
                    res = future.result()
                    batch["items"].append(res)
                    if res.get("status") == "failed":
                        batch["failed"] += 1
                    elif res.get("review_status") == "needs_review":
                        batch["needs_review"] += 1
                        batch["succeeded"] += 1
                    else:
                        batch["succeeded"] += 1
                except Exception as exc:
                    batch["failed"] += 1
                    batch["items"].append({"error": str(exc), "status": "failed"})

        batch["status"] = "completed"
        return batch
