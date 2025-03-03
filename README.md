# TwiSource - Seu "Twitter" Open Source!

## Tutorial de Uso!
[Clique aqui](https://github.com/Hsyst/TwiSource/blob/main/how-to-use.md) para acessar o tutorial de uso!

# TwiSource - Documentação Técnica

# Índice
- Endpoints
  - /login (Login)
  - /register (Register)
  - /posts (Criar Post)
  - /posts (Listar Posts)
  - /comments (Enviar comentário)
  - /posts/ID_DO_POST/comments (Listar comentários do post)
- Websocket
- Créditos
- Licença

# Endpoints
Veja os endpoints e como eles funcionam!

## /login (Login)
- Método: POST
- Envio de dados: Corpo (BODY)
- Dados a serem enviados: Nome de usuário (nickname) e Chave Secreta (secretKey)

Exemplo de resposta:
```
{"token":"eyJhbGciOiJ*************************************************************************************************************************"}
```



## /register (Register)
- Método: POST
- Envio de dados: Corpo (BODY)
- Dados a serem enviados: Nome de usuário (nickname)

Exemplo de resposta:
```
{"secretKey":"************************************************************"}
```


## /posts (Criar Post)
- Método: POST
- Envio de dados: Corpo (BODY)
- Dados a serem enviados: Bearer (Token JWT gerado pelo login), title (Título) e content (Conteúdo do post)

Exemplo de resposta:
```
{"postId": "ID_DO_POST" }
```


## /posts (Listar Posts)
- Método: GET
- Envio de dados: Corpo (BODY)
- Dados a serem enviados: Bearer (Token JWT gerado pelo login)

Exemplo de resposta:
```
[{"id":1,"user_id":1,"title":"Primeiro Post!","content":"O Primeiro post da TwiSource, e espero ser o primeiro de muitos pela frente!","image":"1741022682264-Captura de tela de 2025-03-02 18-36-53.png","created_at":"2025-03-03 17:24:42","nickname":"op3n"}]
```


## /comments (Enviar comentários)
- Método: POST
- Envio de dados: Corpo (BODY)
- Dados a serem enviados: Bearer (Token JWT gerado pelo login), postId (ID Do post), e content (Conteúdo do comentário)

Exemplo de resposta:
```
{"commentId": "ID_DO_COMENTÁRIO"}
```

## /posts/ID_DO_POST/comments (Listar comentários do post)
- Método: POST
- Envio de dados: Corpo (BODY) e Requisição (E.x: https://idk.com/endpoint?dado=isso)
- Dados a serem enviados (Corpo - BODY): Bearer (Token JWT gerado pelo login)
- Dados a serem enviados (Requisição): postId (ID Do post)

Exemplo de resposta:
```
[{"id":1,"post_id":1,"user_id":1,"content":"#First","created_at":"2025-03-03 17:27:40","nickname":"op3n"}]
```

# Websocket
Esse projeto, utiliza WebSocket para conseguir tornar o recursos de Comentários uma realidade. Portanto, fica aí o aviso 👍

# Créditos
Esse projeto foi criado pelo [op3n/op3ny](https://github.com/op3ny).

# Licença
Esse projeto está sob a licença [Unlicense](https://github.com/Hsyst/TwiSource/blob/main/LICENSE)

# Hsyst!!
A Hsyst Project.
