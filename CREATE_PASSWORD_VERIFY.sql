-- Create simple password verification function
CREATE OR REPLACE FUNCTION verify_password_match(
    stored_hash TEXT,
    input_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN stored_hash = crypt(input_password, stored_hash);
END;
$$;

-- Test it
SELECT verify_password_match(
    (SELECT password_hash FROM users WHERE email = 'admin@sck.com'),
    'scq2025'
) as password_matches;
