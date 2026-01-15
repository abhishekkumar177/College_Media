/**
 * Redis Lua Scripts for Rate Limiting
 */

const slidingWindowScript = `
  local key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local window = tonumber(ARGV[2]) -- in milliseconds
  local now = tonumber(ARGV[3])
  
  -- Clear logs older than window
  local clearBefore = now - window
  redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
  
  -- Count requests in current window
  local count = redis.call('ZCARD', key)
  
  if count < limit then
    -- Allowed
    redis.call('ZADD', key, now, now .. ":" .. math.random()) -- Unique member
    redis.call('PEXPIRE', key, window) -- Auto-expire key
    return {1, limit - count - 1} -- Allowed, Remaining
  else
    -- Blocked
    return {0, 0} -- Blocked, Remaining
  end
`;

const bruteForceBlockScript = `
  local key = KEYS[1]
  local blockKey = KEYS[2]
  local limit = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local blockDuration = tonumber(ARGV[3])
  
  -- Check if already blocked
  if redis.call('EXISTS', blockKey) == 1 then
    return -1 -- Still Blocked
  end
  
  -- Increment attempts
  local current = redis.call('INCR', key)
  if current == 1 then
    redis.call('PEXPIRE', key, window)
  end
  
  if current > limit then
    -- Trigger Block
    redis.call('SET', blockKey, 1, 'PX', blockDuration)
    redis.call('DEL', key) -- Reset counter
    return -1 -- Newly Blocked
  end
  
  return limit - current -- Remaining attempts
`;

module.exports = {
    slidingWindowScript,
    bruteForceBlockScript
};
