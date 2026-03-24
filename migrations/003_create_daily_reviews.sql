-- Crear tabla para revisiones diarias
CREATE TABLE IF NOT EXISTS daily_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    
    -- Tareas del día
    total_tasks INTEGER NOT NULL DEFAULT 0,
    completed_tasks INTEGER NOT NULL DEFAULT 0,
    failed_tasks INTEGER NOT NULL DEFAULT 0,
    
    -- Contenido de la revisión
    what_completed TEXT,
    what_failed TEXT,
    why_failed TEXT,
    lessons_learned TEXT,
    tomorrow_plan TEXT,
    
    -- Métricas
    total_time_spent INTEGER DEFAULT 0, -- minutos
    discipline_score INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Relaciones y restricciones
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, date) -- Solo una revisión por usuario por día
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_daily_reviews_user_date ON daily_reviews(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_reviews_user_id ON daily_reviews(user_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER IF NOT EXISTS update_daily_reviews_updated_at
    AFTER UPDATE ON daily_reviews
    FOR EACH ROW
BEGIN
    UPDATE daily_reviews SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
