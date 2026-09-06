-- Spark - Initial schema
-- Tables: users, wallets_ledger, saved_connections

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gives us gen_random_uuid()

-- =========================================================
-- users
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(24) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);

-- =========================================================
-- wallets_ledger
-- Append-only ledger of coin movements. A user's balance is the
-- SUM(amount) of their rows (see the view below) rather than a
-- mutable counter, so the full history is always auditable.
-- =========================================================
DO $$ BEGIN
    CREATE TYPE wallet_ledger_type AS ENUM (
        'purchase',
        'reward_ad',
        'chat_global_spend',
        'multichat_spend'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS wallets_ledger (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    amount     INTEGER NOT NULL CHECK (amount <> 0),
    type       wallet_ledger_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallets_ledger_user_id ON wallets_ledger (user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_ledger_user_id_created_at ON wallets_ledger (user_id, created_at DESC);

-- Convenience view: current coin balance per user.
CREATE OR REPLACE VIEW user_wallet_balances AS
SELECT user_id, COALESCE(SUM(amount), 0) AS balance
FROM wallets_ledger
GROUP BY user_id;

-- =========================================================
-- saved_connections
-- A "saved as friend with local alias" link between two users.
-- Stored once per unordered pair; user_a_id is always the smaller
-- UUID so (user_a_id, user_b_id) can be uniquely constrained.
-- =========================================================
DO $$ BEGIN
    CREATE TYPE connection_status AS ENUM ('active', 'deleted');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS saved_connections (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a_id      UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    user_b_id      UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    alias_a_for_b  VARCHAR(50),
    alias_b_for_a  VARCHAR(50),
    status         connection_status NOT NULL DEFAULT 'active',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_saved_connections_distinct_users CHECK (user_a_id <> user_b_id),
    CONSTRAINT chk_saved_connections_ordered_pair CHECK (user_a_id < user_b_id),
    CONSTRAINT uq_saved_connections_pair UNIQUE (user_a_id, user_b_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_connections_user_a_id ON saved_connections (user_a_id);
CREATE INDEX IF NOT EXISTS idx_saved_connections_user_b_id ON saved_connections (user_b_id);
