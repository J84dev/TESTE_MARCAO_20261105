import json
import logging
from datetime import datetime, timezone

import pyodbc
from fastapi import FastAPI, HTTPException, Path, status
from fastapi.middleware.cors import CORSMiddleware

from backend.connect import get_connection
from backend.schemas import (
    SCHEMA_SOLICITACAO,
    CriarSolicitacao,
    SchemaFormulario,  # <- classe do schema
    SolicitacaoResposta,
    SolicitacaoResumo,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("solicitacoes")

app = FastAPI(
    title="API de Solicitações",
    description="API teste Marcão.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/api/health", tags=["Sistema"])
def health():
    return {"status": "ok"}


@app.get(
    "/api/schema",
    response_model=SchemaFormulario,
    response_model_exclude_none=True,
    tags=["Formulário"],
)
def obter_schema() -> SchemaFormulario:
    return SCHEMA_SOLICITACAO


@app.post(
    "/api/solicitacoes",
    response_model=SolicitacaoResposta,
    status_code=status.HTTP_201_CREATED,
    tags=["Solicitações"],
)
def criar_solicitacao(payload: CriarSolicitacao):
    try:
        with get_connection() as conn:
            cursor = conn.cursor()

            # essa parte da sequencia pode melhorar, mas supre a questão da concorrência
            cursor.execute("SELECT NEXT VALUE FOR dbo.SeqSolicitacao")
            numero = int(cursor.fetchone()[0])
            ano = datetime.now(timezone.utc).year
            codigo = f"SOL-{ano}-{numero:04d}"

            cursor.execute(
                """
                INSERT INTO dbo.Solicitacao
                    (codigo, assunto, email, descricao, prioridade, dados_json)
                OUTPUT
                    inserted.id,
                    inserted.codigo,
                    inserted.assunto,
                    inserted.email,
                    inserted.descricao,
                    inserted.prioridade,
                    inserted.status,
                    inserted.criada_em
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    codigo,
                    payload.assunto,
                    str(payload.email),
                    payload.descricao,
                    payload.prioridade,
                    json.dumps(payload.model_dump(
                        mode="json"), ensure_ascii=False),
                ),
            )
            row = cursor.fetchone()
            cursor.close()

            return {
                "id": row.id,
                "codigo": row.codigo,
                "assunto": row.assunto,
                "email": row.email,
                "descricao": row.descricao,
                "prioridade": row.prioridade,
                "status": row.status,
                "criada_em": row.criada_em,
            }

    except (pyodbc.Error, RuntimeError):
        logger.exception("Falha ao criar solicitação")
        raise HTTPException(
            status_code=503,
            detail="Não foi possível salvar a solicitação. Verifique a conexão com o banco.",
        )


@app.get(
    "/api/solicitacoes",
    response_model=list[SolicitacaoResumo],
    tags=["Solicitações"],
)
def listar_solicitacoes():
    """Lista solicitações mais recentes primeiro."""
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, codigo, assunto, prioridade, status, criada_em
                FROM dbo.Solicitacao
                ORDER BY criada_em DESC, id DESC
                """
            )
            rows = cursor.fetchall()
            cursor.close()
            return [
                {
                    "id": row.id,
                    "codigo": row.codigo,
                    "assunto": row.assunto,
                    "prioridade": row.prioridade,
                    "status": row.status,
                    "criada_em": row.criada_em,
                }
                for row in rows
            ]
    except (pyodbc.Error, RuntimeError):
        logger.exception("Falha ao listar solicitações")
        raise HTTPException(
            status_code=503, detail="Banco de dados indisponível.")


@app.get(
    "/api/solicitacoes/{solicitacao_id}",
    response_model=SolicitacaoResposta,
    tags=["Solicitações"],
)
def obter_solicitacao(
    solicitacao_id: int = Path(gt=0),
):
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, codigo, assunto, email, descricao,
                       prioridade, status, criada_em
                FROM dbo.Solicitacao
                WHERE id = ?
                """,
                (solicitacao_id,),
            )
            row = cursor.fetchone()
            cursor.close()

            if row is None:
                raise HTTPException(
                    status_code=404, detail="Solicitação não encontrada.")

            return {
                "id": row.id,
                "codigo": row.codigo,
                "assunto": row.assunto,
                "email": row.email,
                "descricao": row.descricao,
                "prioridade": row.prioridade,
                "status": row.status,
                "criada_em": row.criada_em,
            }
    except HTTPException:
        raise
    except (pyodbc.Error, RuntimeError):
        logger.exception("Falha ao consultar solicitação")
        raise HTTPException(
            status_code=503, detail="Banco de dados indisponível.")
