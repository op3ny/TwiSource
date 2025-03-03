# Tutorial de Uso - TwiSource

## Passo 1
Realize o [download do TwiSource](https://github.com/Hsyst/TwiSource/releases)

## Passo 2
Nesse tutorial, estamos considerando que você já tenha instalado o [NodeJS e NPM](https://nodejs.org/en/download) em sua máquina.

## Passo 3
Abra na pasta do TwiSource (onde contém os arquivos ".js" e ".json". E execute o seguinte comando em seu CMD/Terminal aberto nessa pasta:
```
npm install
```

# Passo 4
Siga o tutorial de acordo com o que te interessa.


# Hsyst TwiSource - Versão HTTP
## Passo 1
Altere as seguintes linhas do `api.js`:

- Linha 11 (Porta onde o servidor rodará)

## Passo 2
Pronto! Agora basta executar:
```
npm run main
```

## Passo 3
Abra em seu navegador: `http://localhost:PORTA_DEFINIDA_NA_LINHA_11`



# Hsyst TwiSource - Verção HTTPS (SSL)
## Passo 1
Altere as seguintes linhas do `api-ssl.js`

- Linha 12 (Porta do servidor)
- Linha 19/20 (Chaves SSL)

## Passo 2
Pronto! Agora  basta executar:
```
npm run main-ssl
```

## Passo 3
Abra em seu navegador: `https://DOMINIO_DO_SEU_SITE`
