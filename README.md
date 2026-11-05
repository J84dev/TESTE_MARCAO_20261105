# TESTE MARCAO 20261105

<img alt="IMG_20261104_182730" width="200" src="https://github.com/user-attachments/assets/f2876a26-baa6-4b0d-a36b-9d10095c03c4" />

## Itens 1 e 2:

O projeto comitado abrange os itens 1 e 2 do teste requerido.<br >
Tentei deixar o código o mais simples possível.<br >
Ambiente de desenvolvimento: dev container (docker).<br >
Algumas funcionalidades podem melhorar (indiquei em comentários).<br >


## Item 3:

**Situação 1 (falhas na execução são aceitáveis):<br >**

Dois Workers concorrendo para pegar agendamentos na tabela:<br >

```sql
CREATE TABLE dbo.agendamentos (
    id                INT IDENTITY PRIMARY KEY,
    nome              NVARCHAR(100) NOT NULL,
    intervalo_min     INT           NOT NULL,
    proxima_execucao  DATETIME2(3)  NOT NULL
);

INSERT dbo.agendamentos (nome, intervalo_min, proxima_execucao)
VALUES (N'Sincroniza estoque', 15, '2026-11-05 10:00:00.000');
```

Os dois leem a mesma linha:

```sql
SELECT id, proxima_execucao, intervalo_min FROM dbo.agendamentos;
-- ambos veem: id=1, proxima_execucao = 10:00
```

Worker A tenta o claim:

```sql
UPDATE dbo.agendamentos
   SET proxima_execucao = DATEADD(MINUTE, 15, '2026-11-05 10:00:00.000')
 WHERE id = 1
   AND proxima_execucao = '2026-11-05 10:00:00.000';
-- (1 row affected)  → A GANHOU, executa a tarefa
```

Worker B tenta o mesmo claim, depois:

```sql
-- mesmo comando
-- (0 rows affected) → B PERDEU, pula
```

O B perde porque a linha agora vale 10:15 e o WHERE procurava 10:00. Nenhuma linha bate.

Problema: Se o A travar, a execução se perde.

**Situação 2 (falhas na execução não são aceitáveis):<br >**

Criar um campo pra reservar:

```sql
ALTER TABLE dbo.agendamentos ADD reservado_ate DATETIME2(3) NULL;
```

O claim não altera mais a data da próxima execução, mas sim o reservado_ate.

```sql
-- Claim: só pega se vencido E não reservado (ou reserva expirada)
UPDATE dbo.agendamentos
   SET reservado_ate = DATEADD(MINUTE, 5, SYSUTCDATETIME())
 WHERE id = 1
   AND proxima_execucao = @valor_lido
   AND (reservado_ate IS NULL OR reservado_ate < SYSUTCDATETIME());
-- rowcount = 1 → ganhou
```

Só depois que terminar a execução o worker ganhador altera a próxima execução.<br >
Se travar, o outro worker tenta pegar após o período da reserva. O agenda mento não se perde mais.<br >

## Item 4:




## Item 5:




