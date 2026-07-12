-- Migration number: 0002
UPDATE store_settings 
SET daily_hours_json = json_array(
  json_object('day', 1, 'open', open_hour, 'close', close_hour, 'isClosed', 0),
  json_object('day', 2, 'open', open_hour, 'close', close_hour, 'isClosed', 0),
  json_object('day', 3, 'open', open_hour, 'close', close_hour, 'isClosed', 0),
  json_object('day', 4, 'open', open_hour, 'close', close_hour, 'isClosed', 0),
  json_object('day', 5, 'open', open_hour, 'close', close_hour, 'isClosed', 0),
  json_object('day', 6, 'open', open_hour, 'close', close_hour, 'isClosed', 0),
  json_object('day', 0, 'open', open_hour, 'close', close_hour, 'isClosed', 0)
)
WHERE id = 1 AND daily_hours_json IS NULL;
