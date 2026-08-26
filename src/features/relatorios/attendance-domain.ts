import type { Row } from "@/lib/database.types";

export type AttendanceStatus = "presente" | "faltou";
export type AttendanceOrigin = "matricula" | "avulsa";

export interface AttendancePerson {
  key: string;
  presencaId: string | null;
  contatoId: string | null;
  nome: string;
  origem: AttendanceOrigin;
  matriculaId: string | null;
  avulsaId: string | null;
  status: AttendanceStatus | null;
}

export interface AttendanceClass {
  key: string;
  aulaId: string | null;
  turmaId: string | null;
  turmaNome: string;
  hora: string | null;
  pessoas: AttendancePerson[];
}

export interface AttendanceDay {
  data: string;
  turmas: AttendanceClass[];
}

export interface AttendanceDayInput {
  data: string;
  turmas: Row<"turmas">[];
  matriculas: Row<"matriculas">[];
  avulsas: Row<"avulsas">[];
  contatos: Row<"contatos">[];
  aulas: Row<"aulas">[];
  presencas: Row<"presencas">[];
}

interface ClassCandidate {
  key: string;
  aula: Row<"aulas"> | null;
  turma: Row<"turmas"> | null;
}

const portugueseComparison = { sensitivity: "base" } as const;

function attendanceWeekday(value: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    throw new RangeError(`Invalid attendance date: ${value}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new RangeError(`Invalid attendance date: ${value}`);
  }

  return date.getUTCDay();
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, "pt-BR", portugueseComparison);
}

function comparePeople(
  left: AttendancePerson,
  right: AttendancePerson,
): number {
  return compareText(left.nome, right.nome) || left.key.localeCompare(right.key);
}

function compareClasses(
  left: AttendanceClass,
  right: AttendanceClass,
): number {
  if (left.hora === null && right.hora !== null) return 1;
  if (left.hora !== null && right.hora === null) return -1;

  if (left.hora !== null && right.hora !== null) {
    const timeComparison = left.hora.localeCompare(right.hora);
    if (timeComparison !== 0) return timeComparison;
  }

  return (
    compareText(left.turmaNome, right.turmaNome) ||
    left.key.localeCompare(right.key)
  );
}

function addCurrentSources(
  candidate: ClassCandidate,
  input: AttendanceDayInput,
  contactsById: Map<string, Row<"contatos">>,
): Map<string, AttendancePerson> {
  const people = new Map<string, AttendancePerson>();
  const turmaId = candidate.turma?.id;

  if (!turmaId) return people;

  input.matriculas
    .filter(
      (enrollment) =>
        enrollment.turma_id === turmaId &&
        (enrollment.status === "Ativa" || enrollment.status === "Nova"),
    )
    .sort((left, right) => left.id.localeCompare(right.id))
    .forEach((enrollment) => {
      const contact = contactsById.get(enrollment.contato_id);
      const personKey = contact ? `contato:${contact.id}` : null;
      if (!contact || !personKey || people.has(personKey)) return;

      people.set(personKey, {
        key: personKey,
        presencaId: null,
        contatoId: contact.id,
        nome: contact.nome,
        origem: "matricula",
        matriculaId: enrollment.id,
        avulsaId: null,
        status: null,
      });
    });

  input.avulsas
    .filter(
      (booking) =>
        booking.turma_id === turmaId &&
        booking.data === input.data &&
        booking.status === "Confirmada",
    )
    .sort((left, right) => left.id.localeCompare(right.id))
    .forEach((booking) => {
      const contact = contactsById.get(booking.contato_id);
      const personKey = contact ? `contato:${contact.id}` : null;
      if (!contact || !personKey || people.has(personKey)) return;

      people.set(personKey, {
        key: personKey,
        presencaId: null,
        contatoId: contact.id,
        nome: contact.nome,
        origem: "avulsa",
        matriculaId: null,
        avulsaId: booking.id,
        status: null,
      });
    });

  return people;
}

function mergeSavedAttendance(
  people: Map<string, AttendancePerson>,
  savedAttendance: Row<"presencas">[],
): void {
  savedAttendance
    .slice()
    .sort((left, right) => left.id.localeCompare(right.id))
    .forEach((saved) => {
      const personKey = saved.contato_id
        ? `contato:${saved.contato_id}`
        : `presenca:${saved.id}`;
      const current = people.get(personKey);

      if (current) {
        people.set(personKey, {
          ...current,
          presencaId: saved.id,
          nome: saved.contato_nome,
          status: saved.status,
          ...(current.origem === "matricula"
            ? {}
            : {
                origem: saved.origem,
                matriculaId: saved.matricula_id,
                avulsaId: saved.avulsa_id,
              }),
        });
        return;
      }

      people.set(personKey, {
        key: personKey,
        presencaId: saved.id,
        contatoId: saved.contato_id,
        nome: saved.contato_nome,
        origem: saved.origem,
        matriculaId: saved.matricula_id,
        avulsaId: saved.avulsa_id,
        status: saved.status,
      });
    });
}

function classFromCandidate(
  candidate: ClassCandidate,
  input: AttendanceDayInput,
  contactsById: Map<string, Row<"contatos">>,
  savedByAulaId: Map<string, Row<"presencas">[]>,
): AttendanceClass {
  const people = addCurrentSources(candidate, input, contactsById);
  const savedAttendance = candidate.aula
    ? (savedByAulaId.get(candidate.aula.id) ?? [])
    : [];

  mergeSavedAttendance(people, savedAttendance);

  return {
    key: candidate.key,
    aulaId: candidate.aula?.id ?? null,
    turmaId: candidate.turma?.id ?? null,
    turmaNome:
      candidate.aula?.turma_nome ?? candidate.turma?.nome ?? "",
    hora: candidate.turma?.hora ?? null,
    pessoas: [...people.values()].sort(comparePeople),
  };
}

export function deriveAttendanceDay(input: AttendanceDayInput): AttendanceDay {
  const weekday = attendanceWeekday(input.data);
  const contactsById = new Map(
    input.contatos.map((contact) => [contact.id, contact]),
  );
  const turmasById = new Map(
    input.turmas.map((currentClass) => [currentClass.id, currentClass]),
  );
  const savedByAulaId = new Map<string, Row<"presencas">[]>();

  input.presencas.forEach((saved) => {
    const rows = savedByAulaId.get(saved.aula_id) ?? [];
    rows.push(saved);
    savedByAulaId.set(saved.aula_id, rows);
  });

  const candidates = new Map<string, ClassCandidate>();

  input.turmas
    .filter((currentClass) => currentClass.dia === weekday)
    .forEach((currentClass) => {
      const key = `turma:${currentClass.id}`;
      candidates.set(key, { key, aula: null, turma: currentClass });
    });

  input.avulsas
    .filter(
      (booking) =>
        booking.data === input.data &&
        booking.status === "Confirmada" &&
        booking.turma_id !== null,
    )
    .forEach((booking) => {
      if (!booking.turma_id) return;

      const currentClass = turmasById.get(booking.turma_id);
      if (!currentClass) return;

      const key = `turma:${currentClass.id}`;
      candidates.set(key, {
        key,
        aula: candidates.get(key)?.aula ?? null,
        turma: currentClass,
      });
    });

  input.aulas
    .filter((savedClass) => savedClass.data === input.data)
    .sort((left, right) => left.id.localeCompare(right.id))
    .forEach((savedClass) => {
      const savedAttendance = savedByAulaId.get(savedClass.id) ?? [];
      const currentClass = savedClass.turma_id
        ? turmasById.get(savedClass.turma_id)
        : undefined;

      if (currentClass) {
        const key = `turma:${currentClass.id}`;
        if (!candidates.has(key) && savedAttendance.length === 0) return;

        candidates.set(key, { key, aula: savedClass, turma: currentClass });
        return;
      }

      if (savedAttendance.length === 0) return;

      const key = `aula:${savedClass.id}`;
      candidates.set(key, { key, aula: savedClass, turma: null });
    });

  return {
    data: input.data,
    turmas: [...candidates.values()]
      .map((candidate) =>
        classFromCandidate(candidate, input, contactsById, savedByAulaId),
      )
      .sort(compareClasses),
  };
}

export function isAttendanceDayReady(day: AttendanceDay): boolean {
  return day.turmas.every((attendanceClass) =>
    attendanceClass.pessoas.every((person) => person.status !== null),
  );
}
