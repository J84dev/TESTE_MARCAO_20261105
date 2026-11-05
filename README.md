# TESTE MARCAO 20261105

<img alt="IMG_20261104_182730" width="200" src="https://github.com/user-attachments/assets/f2876a26-baa6-4b0d-a36b-9d10095c03c4" />

## Itens 1 e 2:

O projeto comitado abrange os itens 1 e 2 do teste requerido.<br >
Tentei deixar o código o mais simples possível.<br >
Ambiente de desenvolvimento: dev container (docker).<br >
Algumas funcionalidades podem melhorar (indiquei em comentários).<br >

<br >
## Item 3:
<br >
```sql
CREATE TABLE dbo.agendamentos (
    id                INT IDENTITY PRIMARY KEY,
    nome              NVARCHAR(100) NOT NULL,
    intervalo_min     INT           NOT NULL,
    proxima_execucao  DATETIME2(3)  NOT NULL
);

INSERT dbo.agendamentos (nome, intervalo_min, proxima_execucao)
VALUES (N'Sincroniza estoque', 15, '2026-11-05 10:00:00.000');


