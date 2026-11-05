CREATE TABLE notes (
 id TEXT PRIMARY KEY, text TEXT NOT NULL, name TEXT NOT NULL, x REAL NOT NULL CHECK(x BETWEEN 0 AND 1), y REAL NOT NULL CHECK(y BETWEEN 0 AND 1),
 owner TEXT NOT NULL, submission TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('pending','published','rejected')),
 created TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, published TEXT, sequence INTEGER, reason TEXT, policy TEXT NOT NULL DEFAULT 'positive-v1',
 UNIQUE(owner,submission)
);
CREATE TABLE publication_counter (id INTEGER PRIMARY KEY CHECK(id=1), value INTEGER NOT NULL);
INSERT INTO publication_counter VALUES(1,0);
CREATE TRIGGER publish_note AFTER UPDATE OF status ON notes WHEN NEW.status='published' AND OLD.status!='published'
BEGIN
 UPDATE publication_counter SET value=value+1 WHERE id=1;
 UPDATE notes SET sequence=(SELECT value FROM publication_counter WHERE id=1), published=CURRENT_TIMESTAMP WHERE id=NEW.id;
END;
CREATE INDEX notes_board ON notes(status,sequence DESC);
CREATE TABLE actions (id INTEGER PRIMARY KEY, note_id TEXT, actor TEXT, action TEXT, created TEXT DEFAULT CURRENT_TIMESTAMP);
