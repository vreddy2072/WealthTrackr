"""
Migration Manager Module

This module manages database migrations using SQL scripts.
"""
import os
import re
import sqlite3
import logging
from typing import List, Tuple

from backend.database.config.config import SQLALCHEMY_DATABASE_URL

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MigrationManager:
    """Manages database migrations using SQL scripts."""

    def __init__(self, migrations_dir: str = "backend/database/migrations/versions"):
        """
        Initialize the migration manager.

        Args:
            migrations_dir (str): Directory containing migration scripts.
        """
        self.migrations_dir = migrations_dir
        self.db_path = SQLALCHEMY_DATABASE_URL.replace("sqlite:///", "")

        # Create migrations table if it doesn't exist
        self._create_migrations_table()

    def _create_migrations_table(self):
        """Create the migrations table to track applied migrations."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            script_name TEXT NOT NULL,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)

        conn.commit()
        conn.close()

    def _get_applied_migrations(self) -> List[str]:
        """
        Get a list of already applied migrations.

        Returns:
            List[str]: List of applied migration script names.
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute("SELECT script_name FROM migrations ORDER BY id")
        applied = [row[0] for row in cursor.fetchall()]

        conn.close()
        return applied

    def _get_migration_scripts(self) -> List[Tuple[str, str]]:
        """
        Get all migration scripts sorted by sequence number.

        Returns:
            List[Tuple[str, str]]: List of tuples (script_name, script_path).
        """
        migration_files = []

        for file in os.listdir(self.migrations_dir):
            if file.endswith(".sql") and not file.endswith("_rollback.sql"):
                match = re.match(r"^(\d+)_(.+)\.sql$", file)
                if match:
                    seq_num = int(match.group(1))
                    script_path = os.path.join(self.migrations_dir, file)
                    migration_files.append((seq_num, file, script_path))

        # Sort by sequence number
        migration_files.sort(key=lambda x: x[0])
        return [(file, path) for _, file, path in migration_files]

    def _execute_script(self, script_path: str):
        """
        Execute a SQL script.

        Args:
            script_path (str): Path to the SQL script.
        """
        with open(script_path, "r") as f:
            script = f.read()

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        try:
            # For seed scripts, we'll ignore unique constraint violations
            if "_seed_" in script_path:
                # Split the script into individual statements
                statements = script.split(';')
                for statement in statements:
                    if statement.strip():
                        try:
                            cursor.execute(statement)
                        except sqlite3.IntegrityError as e:
                            if "UNIQUE constraint failed" in str(e):
                                logger.warning(f"Ignoring duplicate entry in {script_path}")
                            else:
                                raise
                conn.commit()
            else:
                cursor.executescript(script)
                conn.commit()
        except Exception as e:
            conn.rollback()
            logger.error(f"Error executing script {script_path}: {e}")
            raise
        finally:
            conn.close()

    def _record_migration(self, script_name: str):
        """
        Record that a migration has been applied.

        Args:
            script_name (str): Name of the applied script.
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO migrations (script_name) VALUES (?)",
            (script_name,)
        )

        conn.commit()
        conn.close()

    def apply_migrations(self):
        """Apply all pending migrations."""
        applied = self._get_applied_migrations()
        migrations = self._get_migration_scripts()

        for script_name, script_path in migrations:
            if script_name not in applied:
                logger.info(f"Applying migration: {script_name}")
                self._execute_script(script_path)
                self._record_migration(script_name)
                logger.info(f"Migration applied: {script_name}")

    def rollback_migration(self, script_name: str):
        """
        Rollback a specific migration.

        Args:
            script_name (str): Name of the migration to rollback.
        """
        applied = self._get_applied_migrations()

        if script_name not in applied:
            logger.warning(f"Migration {script_name} has not been applied, cannot rollback")
            return

        # Get the rollback script path
        rollback_script_name = script_name.replace(".sql", "_rollback.sql")
        rollback_script_path = os.path.join(self.migrations_dir, rollback_script_name)

        if not os.path.exists(rollback_script_path):
            logger.error(f"Rollback script {rollback_script_name} not found")
            return

        logger.info(f"Rolling back migration: {script_name}")
        self._execute_script(rollback_script_path)

        # Remove from migrations table
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute(
            "DELETE FROM migrations WHERE script_name = ?",
            (script_name,)
        )

        conn.commit()
        conn.close()

        logger.info(f"Migration rolled back: {script_name}")

    def rollback_all(self):
        """Rollback all migrations in reverse order."""
        applied = self._get_applied_migrations()

        # Rollback in reverse order
        for script_name in reversed(applied):
            self.rollback_migration(script_name)


def run_migrations():
    """Run all pending migrations."""
    manager = MigrationManager()
    manager.apply_migrations()


if __name__ == "__main__":
    run_migrations()
