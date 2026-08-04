import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface ModalProps { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; children: ReactNode }

export function Modal({ open, onOpenChange, title, description, children }: ModalProps) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-foreground/40" />
      <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[88vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border bg-background p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1"><Dialog.Title className="font-semibold">{title}</Dialog.Title>{description && <Dialog.Description className="text-sm text-muted-foreground">{description}</Dialog.Description>}</div>
          <Dialog.Close aria-label="Fechar" className="rounded-md p-1 text-muted-foreground hover:bg-accent"><X /></Dialog.Close>
        </div>
        <div className="mt-5">{children}</div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
