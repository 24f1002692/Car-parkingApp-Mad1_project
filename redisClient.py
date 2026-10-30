# import redis
# redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)
# redis_client_2 = redis.StrictRedis(host='localhost', port=6379, db=1, decode_responses=True)

import os
import time
import redis

class _MemoryRedis:
    """In-process stand-in for Redis (get / pipeline.incr / expire)."""
    def __init__(self):
        self._data = {}

    def _alive(self, key):
        item = self._data.get(key)
        if item and item[1] and item[1] < time.time():
            del self._data[key]
            return None
        return item

    def get(self, key):
        item = self._alive(key)
        return str(item[0]) if item else None

    def pipeline(self):
        return _MemoryPipe(self)


class _MemoryPipe:
    def __init__(self, store):
        self.store, self.ops = store, []

    def incr(self, key, amount=1):
        self.ops.append(('incr', key, amount))

    def expire(self, key, seconds):
        self.ops.append(('expire', key, seconds))

    def execute(self):
        for op, key, val in self.ops:
            item = self.store._alive(key)
            if op == 'incr':
                self.store._data[key] = [(int(item[0]) if item else 0) + val, item[1] if item else None]
            elif op == 'expire' and item:
                item[1] = time.time() + val
        self.ops = []


def _make(db):
    url = os.getenv('REDIS_URL')
    if not url:
        if os.getenv('RENDER') or os.getenv('DEPLOYED'):
            return _MemoryRedis()
        return redis.StrictRedis(host='localhost', port=6379, db=db, decode_responses=True)
    return redis.from_url(url, db=db, decode_responses=True)


redis_client = _make(0)
redis_client_2 = _make(1)