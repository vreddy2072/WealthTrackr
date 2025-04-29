"""
ORM Package

NOTE: This package is currently not in use. The ORM models are implemented in the
`backend/database/models/` directory instead. This folder is kept for potential
future use or for compatibility with existing test files.

The project follows a layered architecture:
UI → API → Service → Repository → Database Models → SQLite

Where the Repository layer provides an abstraction over the ORM models,
allowing the Service layer to work with a consistent interface regardless
of the underlying data storage mechanism.
"""
