import os
from contextlib import contextmanager
from typing import Iterator

import pyodbc
from dotenv import load_dotenv

load_dotenv()


def _connection_string() -> str:
    server = os.getenv("SQL_SERVER", "host.docker.internal")
    port = os.getenv("SQL_PORT", "1433")
    database = os.getenv("SQL_DATABASE", "TesteSolicitacoes")
    username = os.getenv("SQL_USERNAME", "")
    password = os.getenv("SQL_PASSWORD", "")
    encrypt = os.getenv("SQL_ENCRYPT", "yes")
    trust_certificate = os.getenv("SQL_TRUST_SERVER_CERTIFICATE", "yes")

    if not username or not password:
        raise RuntimeError(
            "Configure SQL_USERNAME e SQL_PASSWORD no arquivo .env."
        )

    return (
        "DRIVER={ODBC Driver 18 for SQL Server};"
        f"SERVER={server},{port};"
        f"DATABASE={database};"
        f"UID={username};PWD={password};"
        f"Encrypt={encrypt};"
        f"TrustServerCertificate={trust_certificate};"
        "Connection Timeout=5;"
    )


@contextmanager
def get_connection() -> Iterator[pyodbc.Connection]:
    conn = pyodbc.connect(_connection_string(), autocommit=False)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
