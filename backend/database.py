import sqlite3

def init_db():
    conn = sqlite3.connect("codelens.db")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            language TEXT,
            code TEXT,
            review TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def save_review(language, code, review):
    conn = sqlite3.connect("codelens.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO reviews (language, code, review) VALUES (?, ?, ?)",
        (language, code, review)
    )
    conn.commit()
    conn.close()

def get_history():
    conn = sqlite3.connect("codelens.db")
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, language, created_at, review FROM reviews ORDER BY created_at DESC LIMIT 10"
    )
    rows = cursor.fetchall()
    conn.close()
    return rows
