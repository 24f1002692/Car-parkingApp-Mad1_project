import redis
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, decode_responses=True)
redis_client_2 = redis.StrictRedis(host='localhost', port=6379, db=1, decode_responses=True)

