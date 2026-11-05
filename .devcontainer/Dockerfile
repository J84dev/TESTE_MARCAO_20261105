FROM mcr.microsoft.com/devcontainers/python:1-3.12-bookworm

ENV DEBIAN_FRONTEND=noninteractive

# pipefail: falha no curl dentro de um pipe passa a derrubar o build
# (sem isso o erro era engolido e aparecia só no passo seguinte).
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Instalação do ODBC Driver 18 para SQL Server no Debian 12 (bookworm).
#
# Diferenças em relação à versão anterior:
#  - remove repositórios de terceiros herdados da imagem base (ex.: Yarn) cuja
#    chave expira e faz o PRIMEIRO "apt-get update" sair com erro 100;
#  - gpg --batch --yes: não pede confirmação/tty (build não é interativo);
#  - curl com --retry: tolera instabilidade de rede/proxy;
#  - a linha do repositório é escrita explicitamente (arquitetura detectada),
#    sem depender do conteúdo baixado de prod.list;
#  - odbcinst no final: o build só passa se o driver realmente ficou registrado.
RUN set -eux; \
    rm -f /etc/apt/sources.list.d/yarn.list; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
        gnupg \
        unixodbc \
        unixodbc-dev; \
    curl -fsSL --retry 5 --retry-delay 3 https://packages.microsoft.com/keys/microsoft.asc \
        | gpg --batch --yes --dearmor -o /usr/share/keyrings/microsoft-prod.gpg; \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/microsoft-prod.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" \
        > /etc/apt/sources.list.d/mssql-release.list; \
    apt-get update; \
    ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18; \
    odbcinst -q -d -n "ODBC Driver 18 for SQL Server"; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*
