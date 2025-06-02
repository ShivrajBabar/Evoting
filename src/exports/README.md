
# Database Exports

This directory contains database exports for the Election Management System.

## Files

- `election_db.sql`: SQLite schema export (SQL format)
- `election_db.sqlite`: SQLite database file (binary format)
- `election_db_mysql.sql`: MySQL compatible schema export (SQL format)

## How to Import

### SQLite

You can directly use the `election_db.sqlite` file with any SQLite client.

### MySQL/phpMyAdmin

1. Open your phpMyAdmin interface
2. Create a new database or select an existing one
3. Go to the "Import" tab
4. Browse and select the `election_db_mysql.sql` file
5. Click "Go" to import the database structure

## Generating Database Files

Run the following commands to generate/update these files:

```
# From the project root directory
node src/package-scripts.js setup-db
```

This will create all necessary database files in this directory.
