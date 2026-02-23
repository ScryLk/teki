-- Custom indexes and triggers for KnowledgeBaseArticle

-- GIN index on search_vector for full-text search
CREATE INDEX IF NOT EXISTS idx_kb_search_vector ON "KnowledgeBaseArticle" USING GIN("searchVector");

-- GIN index on tags array
CREATE INDEX IF NOT EXISTS idx_kb_tags ON "KnowledgeBaseArticle" USING GIN("tags");

-- Function to auto-update search_vector on insert/update
CREATE OR REPLACE FUNCTION kb_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('portuguese', coalesce(NEW."title", '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(NEW."problemDescription", '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(NEW."solutionSteps", '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(array_to_string(NEW."tags", ' '), '')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search_vector
DROP TRIGGER IF EXISTS kb_search_vector_trigger ON "KnowledgeBaseArticle";
CREATE TRIGGER kb_search_vector_trigger
  BEFORE INSERT OR UPDATE OF "title", "problemDescription", "solutionSteps", "tags"
  ON "KnowledgeBaseArticle"
  FOR EACH ROW
  EXECUTE FUNCTION kb_search_vector_update();
