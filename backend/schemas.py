"""Modelos de entrada e saída e schema do formulário dinâmico."""

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

TipoCampo = Literal["text", "email", "textarea", "select"]


class CampoFormulario(BaseModel):
    model_config = ConfigDict(extra="forbid")

    nome: str = Field(min_length=1, max_length=60,
                      pattern=r"^[a-z][a-z0-9_]*$")
    rotulo: str = Field(min_length=1, max_length=100)
    tipo: TipoCampo
    obrigatorio: bool = False
    placeholder: str | None = Field(default=None, max_length=160)
    opcoes: list[str] | None = None
    # poderia haver validação dos campos aqui (@model_validator)
    # (Ex: Campos select precisam ter opções.)


class SchemaFormulario(BaseModel):
    model_config = ConfigDict(extra="forbid")

    titulo: str
    descricao: str
    campos: list[CampoFormulario]


SCHEMA_SOLICITACAO = SchemaFormulario(
    titulo="Nova solicitação",
    descricao="Preencha os campos abaixo para registrar uma solicitação.",
    campos=[
        CampoFormulario(
            nome="assunto", rotulo="Assunto", tipo="text", obrigatorio=True,
            placeholder="Ex.: Problema no acesso"
        ),
        CampoFormulario(
            nome="email", rotulo="E-mail para contato", tipo="email",
            obrigatorio=True, placeholder="voce@exemplo.com"
        ),
        CampoFormulario(
            nome="descricao", rotulo="Descrição", tipo="textarea",
            obrigatorio=True, placeholder="Descreva sua solicitação"
        ),
        CampoFormulario(
            nome="prioridade", rotulo="Prioridade", tipo="select",
            obrigatorio=True, opcoes=["Baixa", "Normal", "Alta"]
        ),
    ],
)


class CriarSolicitacao(BaseModel):
    model_config = ConfigDict(extra="forbid")

    assunto: str = Field(min_length=3, max_length=160)
    email: EmailStr
    descricao: str = Field(min_length=5, max_length=5000)
    prioridade: Literal["Baixa", "Normal", "Alta"]

    @field_validator("assunto", "descricao")
    @classmethod
    def remover_espacos_externos(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError("O campo não pode ficar vazio.")
        return valor


class SolicitacaoResposta(BaseModel):
    id: int
    codigo: str
    assunto: str
    email: str
    descricao: str
    prioridade: str
    status: str
    criada_em: datetime


class SolicitacaoResumo(BaseModel):
    id: int
    codigo: str
    assunto: str
    prioridade: str
    status: str
    criada_em: datetime
