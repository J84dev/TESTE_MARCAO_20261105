
CREATE DATABASE TesteMarcao;

USE TesteMarcao;
GO

CREATE TABLE dbo.Solicitacao
(
    id BIGINT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_Solicitacao PRIMARY KEY,

    codigo VARCHAR(32) NOT NULL,
    assunto NVARCHAR(160) NOT NULL,
    email NVARCHAR(254) NOT NULL,
    descricao NVARCHAR(5000) NOT NULL,
    prioridade NVARCHAR(10) NOT NULL,
    dados_json NVARCHAR(MAX) NOT NULL,

    status NVARCHAR(20) NOT NULL
        CONSTRAINT DF_Solicitacao_Status DEFAULT N'ABERTA',

    criada_em DATETIME2(3) NOT NULL
        CONSTRAINT DF_Solicitacao_CriadaEm DEFAULT SYSUTCDATETIME(),

    CONSTRAINT UQ_Solicitacao_Codigo UNIQUE (codigo),
    CONSTRAINT CK_Solicitacao_Prioridade
        CHECK (prioridade IN (N'Baixa', N'Normal', N'Alta')),
    CONSTRAINT CK_Solicitacao_Status
        CHECK (status IN (N'ABERTA', N'EM_ANALISE', N'CONCLUIDA', N'CANCELADA')),
    CONSTRAINT CK_Solicitacao_JSON
        CHECK (ISJSON(dados_json) = 1)
);

CREATE INDEX IX_Solicitacao_CriadaEm
    ON dbo.Solicitacao (criada_em DESC, id DESC);

/*
  gera números únicos sob concorrência.
  comecei pelo 2 por causa do insert abaixo para a listagem não começar vazia.
*/
IF OBJECT_ID(N'dbo.SeqSolicitacao', N'SO') IS NULL
BEGIN
    EXEC(N'
        CREATE SEQUENCE dbo.SeqSolicitacao
        AS BIGINT
        START WITH 2
        INCREMENT BY 1
        CACHE 50;
    ');
END;
GO


IF NOT EXISTS (SELECT 1 FROM dbo.Solicitacao)
BEGIN
    INSERT INTO dbo.Solicitacao
        (codigo, assunto, email, descricao, prioridade, dados_json, status)
    VALUES
    (
        'SOL-2026-0001',
        N'Problema no acesso',
        N'teste@example.com',
        N'Não consigo acessar o sistema.',
        N'Alta',
        N'{"assunto":"Problema no acesso","email":"teste@example.com","descricao":"Não consigo acessar o sistema.","prioridade":"Alta"}',
        N'ABERTA'
    );
END;
GO
