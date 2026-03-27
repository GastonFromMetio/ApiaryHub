import { useMemo, useState } from "react";
import { ClipboardPlus, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, FieldBlock, NativeSelect, SectionCard, StatusBadge } from "@/components/app/app-ui";

const RECENT_ACTIVITY_PAGE_SIZE = 5;

function formatDate(value) {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleString();
}

export function FieldTab({
    apiaries,
    recentActivity,
    actionForm,
    setActionForm,
    selectedActionsApiaryFilter,
    setSelectedActionsApiaryFilter,
    actionsHives,
    createAction,
    busy,
    onOpenApiaries,
    onOpenCompliance,
}) {
    const [recentActivityPage, setRecentActivityPage] = useState(1);

    const hasActionHives = actionsHives.length > 0;
    const totalRecentActivityPages = Math.max(1, Math.ceil(recentActivity.length / RECENT_ACTIVITY_PAGE_SIZE));
    const currentRecentActivityPage = Math.min(recentActivityPage, totalRecentActivityPages);
    const paginatedRecentActivity = useMemo(() => {
        const startIndex = (currentRecentActivityPage - 1) * RECENT_ACTIVITY_PAGE_SIZE;

        return recentActivity.slice(startIndex, startIndex + RECENT_ACTIVITY_PAGE_SIZE);
    }, [currentRecentActivityPage, recentActivity]);
    const currentRangeStart = recentActivity.length === 0 ? 0 : ((currentRecentActivityPage - 1) * RECENT_ACTIVITY_PAGE_SIZE) + 1;
    const currentRangeEnd = recentActivity.length === 0
        ? 0
        : Math.min(currentRecentActivityPage * RECENT_ACTIVITY_PAGE_SIZE, recentActivity.length);

    return (
        <section className="grid gap-6">
            <SectionCard
                title="Action terrain"
                description="Intervention et note associée."
                action={<StatusBadge className="bg-accent/20 text-accent-foreground">Traçabilité</StatusBadge>}
            >
                <form className="grid gap-4" onSubmit={createAction}>
                    <div className="grid gap-4 md:grid-cols-2">
                        <FieldBlock label="Rucher">
                            <NativeSelect
                                value={selectedActionsApiaryFilter}
                                onChange={(event) => setSelectedActionsApiaryFilter(event.target.value)}
                            >
                                <option value="all">Tous les ruchers</option>
                                {apiaries.map((apiary) => (
                                    <option key={apiary.id} value={apiary.id}>
                                        {apiary.name}
                                    </option>
                                ))}
                            </NativeSelect>
                        </FieldBlock>
                        <FieldBlock label="Ruche">
                            <NativeSelect
                                value={actionForm.hive_id}
                                onChange={(event) => setActionForm({ ...actionForm, hive_id: event.target.value })}
                                required
                            >
                                <option value="">Choisir une ruche</option>
                                {actionsHives.map((hive) => (
                                    <option key={hive.id} value={hive.id}>
                                        {hive.name}
                                    </option>
                                ))}
                            </NativeSelect>
                        </FieldBlock>
                    </div>

                    <FieldBlock label="Type d action">
                        <Input
                            value={actionForm.type}
                            onChange={(event) => setActionForm({ ...actionForm, type: event.target.value })}
                            placeholder="Visite, traitement, nourrissement, récolte"
                            className="h-11 rounded-xl"
                            required
                        />
                    </FieldBlock>

                    <FieldBlock label="Notes utiles">
                        <Textarea
                            rows={5}
                            value={actionForm.description}
                            onChange={(event) => setActionForm({ ...actionForm, description: event.target.value })}
                            placeholder="Ce qui a été fait, observé ou devra être repris au prochain passage."
                            className="min-h-32 rounded-2xl"
                        />
                    </FieldBlock>

                    <FieldBlock label="Date d’intervention">
                        <Input
                            type="datetime-local"
                            value={actionForm.performed_at}
                            onChange={(event) => setActionForm({ ...actionForm, performed_at: event.target.value })}
                            className="h-11 rounded-xl"
                            required
                        />
                    </FieldBlock>

                    {!hasActionHives ? (
                        <EmptyState
                            title="Aucune ruche disponible pour l’action"
                            description="Ajuste le filtre rucher ou ajoute une ruche avant de journaliser l’intervention."
                            className="min-h-0"
                        />
                    ) : null}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button className="rounded-xl" type="submit" disabled={busy || !hasActionHives}>
                            <ClipboardPlus className="size-4" />
                            Consigner l’action
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            Cette entrée alimente directement le journal terrain.
                        </p>
                    </div>
                </form>
            </SectionCard>

            <SectionCard
                title="Derniers passages"
                description="Dernières entrées."
                action={
                    <Button type="button" variant="outline" className="rounded-xl" onClick={onOpenCompliance}>
                        <ShieldCheck className="size-4" />
                        Voir les documents
                    </Button>
                }
                contentClassName="grid gap-4"
            >
                {recentActivity.length === 0 ? (
                    <EmptyState
                        title="Aucune intervention enregistrée"
                        description="Démarre avec une première intervention pour lancer le rythme de suivi."
                        action={
                            <Button type="button" className="rounded-xl" onClick={onOpenApiaries}>
                                Préparer la base d’exploitation
                            </Button>
                        }
                    />
                ) : (
                    <>
                        <div className="overflow-hidden rounded-[24px] border border-border/70 bg-background/84 shadow-[0_18px_48px_-38px_rgba(40,31,21,0.35)]">
                            <ul className="divide-y divide-border/55">
                                {paginatedRecentActivity.map((entry) => (
                                    <li key={entry.id} className="px-5 py-4">
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <StatusBadge className={entry.kind === "Action" ? "bg-accent/20 text-accent-foreground" : "bg-primary/10 text-primary"}>
                                                        {entry.kind}
                                                    </StatusBadge>
                                                    <p className="truncate text-base font-medium text-foreground">{entry.title}</p>
                                                </div>
                                                <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.subtitle}</p>
                                            </div>
                                            <p className="shrink-0 text-sm text-muted-foreground">{formatDate(entry.timestamp)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                Affichage {currentRangeStart}-{currentRangeEnd} sur {recentActivity.length}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl"
                                    onClick={() => setRecentActivityPage((page) => Math.max(1, page - 1))}
                                    disabled={currentRecentActivityPage === 1}
                                >
                                    Précédent
                                </Button>
                                <StatusBadge variant="secondary">
                                    Page {currentRecentActivityPage} / {totalRecentActivityPages}
                                </StatusBadge>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl"
                                    onClick={() => setRecentActivityPage((page) => Math.min(totalRecentActivityPages, page + 1))}
                                    disabled={currentRecentActivityPage === totalRecentActivityPages}
                                >
                                    Suivant
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </SectionCard>
        </section>
    );
}
