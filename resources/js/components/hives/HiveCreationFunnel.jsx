import { useMemo } from "react";
import { Hexagon, MapPinned } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, FieldBlock, NativeSelect, SectionCard, StatusBadge } from "@/components/app/app-ui";
import { HIVE_STATUSES } from "@/constants";

export function HiveCreationFunnel({
    hiveForm,
    setHiveForm,
    createHive,
    busy,
    apiaries,
    setError,
    handleHiveApiaryChange,
}) {
    const selectedApiary = useMemo(
        () => apiaries.find((apiary) => String(apiary.id) === String(hiveForm.apiary_id)) || null,
        [apiaries, hiveForm.apiary_id]
    );

    const submitHive = async (event) => {
        event.preventDefault();

        if (!hiveForm.name.trim()) {
            setError("Renseigne le nom de la ruche.");
            return;
        }

        if (!hiveForm.apiary_id) {
            setError("Selectionne un rucher.");
            return;
        }

        setError("");
        await createHive(event);
    };

    return (
        <SectionCard
            title="Ajouter une ruche"
            description="Ajoute un support de suivi."
            action={<StatusBadge className="bg-primary/10 text-primary">Nouveau support</StatusBadge>}
        >
            {apiaries.length === 0 ? (
                <EmptyState
                    title="Aucun rucher disponible"
                    description="Cree d abord un rucher."
                />
            ) : (
                <form className="grid gap-5" onSubmit={submitHive}>
                    <div className="grid gap-4 md:grid-cols-2">
                        <FieldBlock label="Nom de la ruche">
                            <Input
                                value={hiveForm.name}
                                onChange={(event) => setHiveForm({ ...hiveForm, name: event.target.value })}
                                placeholder="Ex: Ruche Violette"
                                className="h-11 rounded-xl"
                                required
                            />
                        </FieldBlock>
                        <FieldBlock label="Rucher">
                            <NativeSelect
                                value={hiveForm.apiary_id}
                                onChange={(event) => handleHiveApiaryChange(event.target.value)}
                                required
                            >
                                <option value="">Choisir un rucher</option>
                                {apiaries.map((apiary) => (
                                    <option key={apiary.id} value={apiary.id}>
                                        {apiary.name}
                                    </option>
                                ))}
                            </NativeSelect>
                        </FieldBlock>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[minmax(0,0.65fr)_minmax(0,0.35fr)]">
                        <FieldBlock label="Notes de contexte">
                            <Textarea
                                rows={5}
                                value={hiveForm.notes}
                                onChange={(event) => setHiveForm({ ...hiveForm, notes: event.target.value })}
                                placeholder="Observations utiles pour le suivi, comportement, repere physique..."
                                className="min-h-32 rounded-2xl"
                            />
                        </FieldBlock>

                        <div className="space-y-4 rounded-[24px] border border-border/70 bg-secondary/35 p-4">
                            <FieldBlock label="Statut initial">
                                <NativeSelect
                                    value={hiveForm.status}
                                    onChange={(event) => setHiveForm({ ...hiveForm, status: event.target.value })}
                                >
                                    {HIVE_STATUSES.map((status) => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </FieldBlock>

                            {selectedApiary ? (
                                <div className="rounded-[20px] border border-border/70 bg-background/80 p-4">
                                    <div className="flex items-center gap-2">
                                        <MapPinned className="size-4 text-primary" />
                                        <p className="text-sm font-medium text-foreground">{selectedApiary.name}</p>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                        Lat {selectedApiary.latitude ?? "-"} / Lon {selectedApiary.longitude ?? "-"}
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button className="rounded-xl" type="submit" disabled={busy}>
                            <Hexagon className="size-4" />
                            Enregistrer la ruche
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            Le journal terrain utilisera ensuite directement cette ruche dans les formulaires rapides.
                        </p>
                    </div>
                </form>
            )}
        </SectionCard>
    );
}
