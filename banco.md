# Estrutura do Banco de Dados - Firestore

---

## Coleção: `users`

Cada documento representa um usuário.

**Exemplo de documento (`users/{id}`):**

```json
{
  "nome": "Maria Silva",
  "papel": 2 // 1 = Admin, 2 = Professor, 3 = Estudante
}
```

Todos os usuários estão nesta coleção. A autenticação dos usuários com email e senha é gerida pelo Firebase Authentication e sincronizada com a tabela de usuários através do UID, que é o ID do usuário no autenticador e o ID do documento na coleção.

---

## Coleção: `turmas`

Cada documento representa uma turma.

**Exemplo de documento (`turmas/{id}`):**

```json
{
  "nome": "3AM",
  "turno": "Manhã"
}
```

Contém apenas dados básicos da turma. Relacionamentos são feitos com referências de IDs.

---

## Subcoleção: `professores` dentro de `turmas`

Cada turma terá uma subcoleção `professores` com documentos apontando para `users` com `papel = 2`.

**Exemplo (`turmas/{idTurma}/professores/{idProfessor}`):**

```json
{
  "idProfessor": "abc123"
}
```

Relaciona professores à turma.

---

## Subcoleção: `alunos` dentro de `turmas`

Cada turma terá uma subcoleção `alunos` com documentos apontando para `users` com `papel = 3`.

**Exemplo (`turmas/{idTurma}/alunos/{idAluno}`):**

```json
{
  "idAluno": "xyz456"
}
```

Relaciona alunos à turma.

---

## Subcoleção: `chamadas` dentro de `turmas`

Cada turma terá suas chamadas registradas.

**Exemplo (`turmas/{idTurma}/chamadas/{idChamada}`):**

```json
{
  "data": "2025-09-15",
  "professorId": "abc123" // ID do professor que fez a chamada
}
```
Data é um Timestamp no Cloud Firestore.
O campo `professorId` é opcional e indica qual professor registrou a chamada.

---

### Subcoleção: `alunos` dentro da chamada

Cada chamada terá uma subcoleção `alunos` com o status de cada aluno.

**Exemplo (`turmas/{idTurma}/chamadas/{idChamada}/alunos/{idAluno}`):**

```json
{
  "idAluno": "users/xyz456",
  "status": "presente" // "presente", "ausente" ou "falta justificada"
}
```

---

## Subcoleção: `notas` dentro de `turmas`

Cada turma terá uma subcoleção `notas`.
Cada documento representa uma nota de um aluno em uma avaliação.

**Exemplo (`turmas/{idTurma}/notas/{idNota}`):**

```json
{
  "idAluno": "xyz456",
  "nota": 1,
  "valor": 7.5
}
```

Cada aluno pode ter várias notas em uma mesma turma (até 8). "Nota" indica qual a avaliação (se é a "Nota 1", "Nota 2", "Nota 3" etc.), enquanto o valor indica quanto o aluno tirou naquela avaliação.
A média é calculada com `aggregate queries` no Firestore.

---

# Estrutura Hierárquica

```
users/{userId}
   nome, papel

turmas/{id}
   nome, turno
   ├── professores/{id} → ref user
   ├── alunos/{id} → ref user
   ├── chamadas/{id}
   │      data
   │      └── alunos/{id} → status
   └── notas/{id}
          idAluno, nota, valor
```


* Subcoleções ajudam a manter os dados de chamadas e notas organizados dentro das turmas.
* Estrutura pensada para consultas rápidas (ex: "todas as notas de um aluno em uma turma", "presenças de um aluno", etc.).