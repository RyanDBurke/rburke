-- Thanksgiving Feud questions: one row holding every round as JSON. The rows themselves are
-- entered from the site's editor (or a local seed file), never committed to this public repo.
CREATE TABLE IF NOT EXISTS feud (id INTEGER PRIMARY KEY CHECK(id=1), rounds TEXT NOT NULL, updated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
