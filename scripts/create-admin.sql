-- Create super admin user (admin/admin)
DO $$
DECLARE
  v_user_id UUID;
  v_agent_id TEXT;
BEGIN
  -- Check if user already exists
  SELECT id INTO v_user_id FROM users WHERE email = 'admin';

  IF v_user_id IS NOT NULL THEN
    -- Update existing user
    UPDATE users SET
      status = 'ACTIVE',
      email_verified = true,
      email_verified_at = NOW(),
      updated_at = NOW()
    WHERE id = v_user_id;

    UPDATE user_credentials SET
      password_hash = '$2b$12$6gRWMmNfJhqhYS23jAgGPuA9NKl0xarxy0aqERvCVxBw6we6STiU2',
      hash_algorithm = 'BCRYPT',
      failed_attempts = 0,
      locked_until = NULL,
      updated_at = NOW()
    WHERE user_id = v_user_id;

    RAISE NOTICE 'Super admin updated: %', v_user_id;
  ELSE
    -- Create new user
    v_user_id := gen_random_uuid();
    v_agent_id := 'cm' || encode(gen_random_bytes(12), 'hex');

    INSERT INTO users (id, email, first_name, last_name, display_name, status, email_verified, email_verified_at, created_at, updated_at)
    VALUES (v_user_id, 'admin', 'Super', 'Admin', 'Super Admin', 'ACTIVE', true, NOW(), NOW(), NOW());

    INSERT INTO user_credentials (id, user_id, password_hash, hash_algorithm, password_changed_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_user_id, '$2b$12$6gRWMmNfJhqhYS23jAgGPuA9NKl0xarxy0aqERvCVxBw6we6STiU2', 'BCRYPT', NOW(), NOW(), NOW());

    -- Create default agent (table "Agent" with camelCase columns)
    INSERT INTO "Agent" (id, "userId", name, "systemPrompt", model, "isDefault", "createdAt", "updatedAt")
    VALUES (v_agent_id, v_user_id, 'Suporte Geral', 'Voce e um assistente de suporte tecnico de TI. Responda de forma clara e tecnica em portugues brasileiro.', 'gemini-flash', true, NOW(), NOW());

    -- Create default preferences
    INSERT INTO user_preferences (id, user_id, created_at, updated_at)
    VALUES (gen_random_uuid(), v_user_id, NOW(), NOW());

    RAISE NOTICE 'Super admin created: %', v_user_id;
  END IF;
END $$;
