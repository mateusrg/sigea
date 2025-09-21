import { auth, db } from './firebase';
import { Timestamp } from 'firebase/firestore';

export async function login(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const uid = userCredential.user.uid;
    const token = await userCredential.user.getIdToken();
    const profileDoc = await db.collection('users').doc(uid).get();
    const profile = profileDoc.data();
    return { uid, profile, token };
  } catch (error) {
    throw error;
  }
}

export async function criarTurma(nome, turno) {
  try {
    const turmaRef = await db.collection('turmas').add({
      nome: nome,
      turno: turno
    });

    return { id: turmaRef.id };
  } catch (error) {
    console.error('Erro ao criar turma:', error);
    throw error;
  }
}

export async function getTurmas() {
  const turmasSnapshot = await db.collection('turmas').get();

  const turmas = await Promise.all(
    turmasSnapshot.docs.map(async (doc) => {
      const turmaData = doc.data();

      const alunosSnapshot = await db
        .collection('turmas')
        .doc(doc.id)
        .collection('alunos')
        .get();

      const profsSub = await db
        .collection('turmas')
        .doc(doc.id)
        .collection('professores')
        .get();

      return {
        id: doc.id,
        nome: turmaData.nome,
        turno: turmaData.turno,
        students: alunosSnapshot.size,
        professores: profsSub.docs.map(p => p.data().idProfessor)
      };
    })
  );

  return turmas;
}

export async function editarTurma(idTurma, novosDados) {
  try {
    await db.collection('turmas').doc(idTurma).update(novosDados);
    return true;
  } catch (error) {
    console.error('Erro ao editar turma:', error);
    throw error;
  }
}

export async function excluirTurma(idTurma) {
  try {
    const turmaRef = db.collection('turmas').doc(idTurma);

    const subcolecoes = ['alunos', 'professores', 'chamadas', 'notas'];

    for (const sub of subcolecoes) {
      const snapshot = await turmaRef.collection(sub).get();
      const batch = db.batch();
      snapshot.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

    await turmaRef.delete();
    return true;
  } catch (error) {
    console.error('Erro ao excluir turma:', error);
    throw error;
  }
}

export async function getProfessores() {
  try {
    const usersSnap = await db.collection('users').where('papel', '==', 2).get();
    const professores = usersSnap.docs.map(doc => ({
      id: doc.id,
      nome: doc.data().nome || '',
      email: doc.data().email || '',
      turmas: 0
    }));

    const turmasSnap = await db.collection('turmas').get();

    for (const turmaDoc of turmasSnap.docs) {
      const profsSub = await turmaDoc.ref.collection('professores').get();
      profsSub.docs.forEach(pdoc => {
        const idProfessor = pdoc.data().idProfessor;
        const profId = idProfessor?.includes('/')
          ? idProfessor.split('/').pop()
          : idProfessor;

        const prof = professores.find(p => p.id === profId);
        if (prof) {
          prof.turmas += 1;
        }
      });
    }

    return professores.map(p => ({
      id: p.id,
      nome: p.nome,
      email: p.email,
      turmas: p.turmas
    }));
  } catch (error) {
    console.error('Erro ao buscar professores:', error);
    throw error;
  }
}

export async function criarProfessor(nome, email, senha) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
    const uid = userCredential.user.uid;

    await db.collection('users').doc(uid).set({
      nome: nome,
      papel: 2
    });

    return { id: uid, nome };
  } catch (error) {
    console.error('Erro ao criar professor:', error);
    throw error;
  }
}

export async function nomeProfessorExiste(nome) {
  const snapshot = await db
    .collection('users')
    .where('papel', '==', 2)
    .where('nome', '==', nome)
    .get();

  return !snapshot.empty;
}

const editarProfessor = async (idProfessor, novoNome) => {
  try {
    const professorRef = doc(db, "professores", idProfessor);
    await updateDoc(professorRef, { nome: novoNome });
    console.log("Professor atualizado com sucesso!");
  } catch (error) {
    console.error("Erro ao atualizar professor:", error);
    throw error;
  }
};

export async function excluirProfessor(idProfessor) {
  try {
    const turmasSnap = await db.collection('turmas').get();

    for (const turmaDoc of turmasSnap.docs) {
      const profRef = turmaDoc.ref.collection('professores').doc(idProfessor);
      const profDoc = await profRef.get();
      if (profDoc.exists) {
        await profRef.delete();
      }
    }

    await db.collection('users').doc(idProfessor).delete();

    return true;
  } catch (error) {
    console.error('Erro ao excluir professor:', error);
    throw error;
  }
}

export async function adicionarProfessorNaTurma(idTurma, idProfessor) {
  try {
    await db
      .collection('turmas')
      .doc(idTurma)
      .collection('professores')
      .doc(idProfessor)
      .set({
        idProfessor: idProfessor
      });
    return true;
  } catch (error) {
    console.error('Erro ao adicionar professor na turma:', error);
    throw error;
  }
}

export async function removerProfessorDaTurma(idTurma, idProfessor) {
  try {
    const profRef = db.collection('turmas')
      .doc(idTurma)
      .collection('professores')
      .doc(idProfessor);

    const profDoc = await profRef.get();
    if (!profDoc.exists) {
      console.log('Professor não encontrado nesta turma.');
      return false;
    }

    await profRef.delete();
    console.log('Professor removido da turma com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao remover professor da turma:', error);
    throw error;
  }
}

export async function getAlunos() {
  const usersSnap = await db.collection('users').where('papel', '==', 3).get();
  const turmasSnap = await db.collection('turmas').get();

  const alunos = [];

  for (const userDoc of usersSnap.docs) {
    const alunoData = userDoc.data();
    let turmaNome = null;

    for (const turmaDoc of turmasSnap.docs) {
      const alunosSnap = await turmaDoc.ref
        .collection("alunos")
        .where("idAluno", "==", userDoc.id)
        .get();

      if (!alunosSnap.empty) {
        turmaNome = turmaDoc.data().nome;
        break;
      }
    }

    alunos.push({
      id: userDoc.id,
      nome: alunoData.nome,
      papel: alunoData.papel,
      turma: turmaNome,
    });
  }

  return alunos;
}

export async function criarAluno(nome, email, senha) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
    const uid = userCredential.user.uid;

    await db.collection('users').doc(uid).set({
      nome: nome,
      papel: 3
    });

    return { id: uid, nome };
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    throw error;
  }
}

export async function nomeAlunoExiste(nome) {
  const snapshot = await db
    .collection('users')
    .where('papel', '==', 3)
    .where('nome', '==', nome)
    .get();

  return !snapshot.empty;
}

export async function editarAluno(idAluno, novosDados) {
  try {
    await db.collection('users').doc(idAluno).update(novosDados);
    return true;
  } catch (error) {
    console.error('Erro ao editar aluno:', error);
    throw error;
  }
}

export async function excluirAluno(idAluno) {
  try {
    const turmasSnap = await db.collection('turmas').get();
    for (const turmaDoc of turmasSnap.docs) {
      const alunoRef = turmaDoc.ref.collection('alunos').doc(idAluno);
      const alunoDoc = await alunoRef.get();
      if (alunoDoc.exists) {
        await alunoRef.delete();
      }
    }

    await db.collection('users').doc(idAluno).delete();

    return true;
  } catch (error) {
    console.error('Erro ao excluir aluno:', error);
    throw error;
  }
}

export async function adicionarAlunoNaTurma(idTurma, idAluno) {
  try {
    const turmasSnap = await db.collection('turmas').get();
    for (const turmaDoc of turmasSnap.docs) {
      const alunosSnap = await turmaDoc.ref
        .collection('alunos')
        .where('idAluno', '==', idAluno)
        .get();

      alunosSnap.forEach(async (doc) => {
        await doc.ref.delete();
      });
    }

    await db.collection('turmas').doc(idTurma).collection('alunos').doc(idAluno).set({
      idAluno: idAluno
    });

    return true;
  } catch (error) {
    console.error('Erro ao adicionar aluno na turma:', error);
    throw error;
  }
}

export async function removerAlunoDeTurmas(idAluno) {
  try {
    const turmasSnap = await db.collection('turmas').get();
    for (const turmaDoc of turmasSnap.docs) {
      const alunoRef = turmaDoc.ref.collection('alunos').doc(idAluno);
      const alunoDoc = await alunoRef.get();
      if (alunoDoc.exists) {
        await alunoRef.delete();
      }
    }
    return true;
  } catch (error) {
    console.error('Erro ao remover aluno das turmas:', error);
    throw error;
  }
}

export async function getDashboardCounts() {
  const turmasSnap = await db.collection('turmas').get();
  const totalTurmas = turmasSnap.size;

  const professoresSnap = await db.collection('users').where('papel', '==', 2).get();
  const totalProfessores = professoresSnap.size;

  const alunosSnap = await db.collection('users').where('papel', '==', 3).get();
  const totalAlunos = alunosSnap.size;

  return { totalTurmas, totalProfessores, totalAlunos };
}

export async function getTurmaComMaisAlunos() {
  const turmasSnap = await db.collection('turmas').get();

  let maxAlunos = 0;
  let turmaMaisAlunos = null;

  for (const turmaDoc of turmasSnap.docs) {
    const alunosSnap = await turmaDoc.ref.collection('alunos').get();
    if (alunosSnap.size > maxAlunos) {
      maxAlunos = alunosSnap.size;
      turmaMaisAlunos = { id: turmaDoc.id, nome: turmaDoc.data().nome, alunos: maxAlunos };
    }
  }

  return turmaMaisAlunos;
}

export async function getAlunosAtivosHoje() {
  const turmasSnap = await db.collection('turmas').get();
  const hoje = new Date().toISOString().split('T')[0];
  let totalAtivos = 0;

  for (const turmaDoc of turmasSnap.docs) {
    const chamadasSnap = await turmaDoc.ref
      .collection('chamadas')
      .where('data', '==', hoje)
      .get();

    chamadasSnap.forEach(chamadaDoc => {
      const presencas = chamadaDoc.data().presencas || {};
      const ativos = Object.values(presencas).filter(v => v === true).length;
      totalAtivos += ativos;
    });
  }

  return totalAtivos;
}

export async function getAlunoIdPorNome(nome) {
  const snapshot = await db.collection('users')
    .where('nome', '==', nome)
    .where('papel', '==', 3)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].id;
}

export async function getPresencasAluno(alunoId) {
  const turmasSnap = await db.collection('turmas').get();

  const presencas = [];

  for (const turmaDoc of turmasSnap.docs) {
    const turmaData = turmaDoc.data();

    const alunosSnap = await turmaDoc.ref
      .collection('alunos')
      .where('idAluno', '==', alunoId)
      .get();

    if (alunosSnap.empty) continue;

    const chamadasSnap = await turmaDoc.ref.collection('chamadas').get();

    chamadasSnap.forEach(chamadaDoc => {
      const chamada = chamadaDoc.data();
      const presencaAluno = chamada.presencas?.[alunoId];

      presencas.push({
        data: chamada.data,
        status: presencaAluno === true ? 'Presente' :
          presencaAluno === false ? 'Falta' : null,
        turma: turmaData.nome,
        obs: null,
        professor: chamada.professorNome || null
      });
    });
  }

  presencas.sort((a, b) => new Date(b.data) - new Date(a.data));

  return presencas;
}

export async function getNotasAluno(idAluno) {
  const turmasSnap = await db.collection('turmas').get();
  const notas = [];

  for (const turmaDoc of turmasSnap.docs) {
    const notasSnap = await turmaDoc.ref
      .collection('notas')
      .where('idAluno', '==', idAluno)
      .get();

    notasSnap.forEach(doc => {
      const data = doc.data();
      notas.push({
        id: doc.id,
        nota: data.nota,
        valor: data.valor === undefined ? null : data.valor,
        turma: turmaDoc.data().nome
      });
    });
  }

  notas.sort((a, b) => (a.nota || 0) - (b.nota || 0));
  return notas.slice(0, 8);
}

export function logout() {
  return auth.signOut();
}
