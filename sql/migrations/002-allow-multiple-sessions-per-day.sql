-- Allow multiple journal sessions per day by removing the unique constraint
ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_user_id_date_key;
