import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminPage() {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Área administrativa</CardTitle>
        <CardDescription>Acesso de superadmin</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
        <p>
          Este espaço está reservado para configurações administrativas do
          Studio Parla.
        </p>
        <p>Nenhuma ferramenta administrativa disponível ainda.</p>
      </CardContent>
    </Card>
  );
}
