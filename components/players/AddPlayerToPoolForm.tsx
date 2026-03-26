"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { AddPlayerPoolFormFields } from "@/components/players/AddPlayerPoolFormFields";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  playerCreateFormSchema,
  playerCreateSchema,
  toPlayerCreatePayload,
  type PlayerCreateFormValues,
} from "@/lib/validators/playerCreate";

interface FranchiseOption {
  _id: string;
  name: string;
  shortCode: string;
}

export const AddPlayerToPoolForm = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [franchises, setFranchises] = useState<FranchiseOption[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PlayerCreateFormValues>({
    resolver: zodResolver(playerCreateFormSchema),
    defaultValues: {
      name: "",
      franchiseId: "",
      tier: "1",
      role: "bat",
    },
  });

  useEffect(() => {
    fetch("/api/franchises")
      .then((r) => r.json())
      .then((rows: FranchiseOption[]) => setFranchises(Array.isArray(rows) ? rows : []))
      .catch(() => setFranchises([]));
  }, []);

  if (status === "loading") return null;
  if (session?.user?.role !== "admin") return null;

  const onSubmit = async (values: PlayerCreateFormValues) => {
    const payload = playerCreateSchema.parse(toPlayerCreatePayload(values));
    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      toast.error(data.error ?? "Could not add player");
      return;
    }
    toast.success(`${values.name.trim()} added to the pool`);
    reset({ name: "", franchiseId: "", tier: values.tier, role: values.role });
    router.refresh();
  };

  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="border-b border-border/60 bg-muted/25">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-background">
            <UserPlus className="size-4 text-foreground/80" aria-hidden />
          </span>
          <div>
            <CardTitle className="text-lg">Add player to pool</CardTitle>
            <CardDescription>
              Name, franchise, tier, and role are validated before saving.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <AddPlayerPoolFormFields
            register={register}
            errors={errors}
            franchises={franchises}
            isSubmitting={isSubmitting}
          />
        </form>
      </CardContent>
    </Card>
  );
};
