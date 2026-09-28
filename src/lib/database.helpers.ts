import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/database.types";

export type TableName = keyof Database["public"]["Tables"];

type Refine<Base, Extra> = Omit<Base, keyof Extra> & Extra;
type AttendanceStatus = "presente" | "faltou";
type AttendanceOrigin = "matricula" | "avulsa";
type TaskStatus = "a_fazer" | "em_andamento" | "concluida";

type InsertOverrides = {
  presencas: { status: AttendanceStatus; origem: AttendanceOrigin };
  tarefas: { status?: TaskStatus };
};

type UpdateOverrides = {
  presencas: { status?: AttendanceStatus; origem?: AttendanceOrigin };
  tarefas: { status?: TaskStatus };
};

type OverrideFor<Map, T extends TableName> = T extends keyof Map ? Map[T] : object;

export type Row<T extends TableName> = Tables<T>;
export type Insert<T extends TableName> = Refine<TablesInsert<T>, OverrideFor<InsertOverrides, T>>;
export type Update<T extends TableName> = Refine<TablesUpdate<T>, OverrideFor<UpdateOverrides, T>>;
