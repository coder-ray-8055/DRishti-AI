"""In-memory screening history storage."""

from __future__ import annotations

import threading
from typing import Any


class ScreeningStore:
    """Thread-safe in-memory store for screening records."""

    def __init__(self) -> None:
        self._records: dict[str, dict[str, Any]] = {}
        self._lock = threading.Lock()

    def add(self, screening_id: str, record: dict[str, Any]) -> None:
        with self._lock:
            self._records[screening_id] = record

    def list_all(self) -> list[dict[str, Any]]:
        with self._lock:
            # Return newest first
            return sorted(
                self._records.values(),
                key=lambda r: r.get("timestamp", ""),
                reverse=True,
            )

    def get(self, screening_id: str) -> dict[str, Any] | None:
        with self._lock:
            return self._records.get(screening_id)

    def delete(self, screening_id: str) -> bool:
        with self._lock:
            if screening_id in self._records:
                del self._records[screening_id]
                return True
            return False

    def clear(self) -> None:
        with self._lock:
            self._records.clear()

    def count(self) -> int:
        with self._lock:
            return len(self._records)

