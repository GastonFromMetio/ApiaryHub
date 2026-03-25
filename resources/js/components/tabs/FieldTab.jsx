import { useMemo } from "react";
import { ArrowRight, ClipboardPlus, ShieldCheck, WavesLadder } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, FieldBlock, NativeSelect, SectionCard, StatusBadge } from "@/components/app/app-ui";

function formatDate(value) {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleString();
}

export function FieldTab({
    apiaries,
    hives,
    recentActivity,
    readingForm,
    setReadingForm,
    selectedReadingsApiaryFilter,
    setSelectedReadingsApiaryFilter,
    readingsHives,
    createReading,
    actionForm,
    setActionForm,
    selectedActionsApiaryFilter,
    setSelectedActionsApiaryFilter,
    actionsHives,
    createAction,
    busy,
    userNeedsEmailVerification,
    onOpenApiaries,
    onOpenJournal,
    onOpenCompliance,
}) {
    const priorities = useMemo(() => {
        const items = [];

        if (apiaries.length === 0) {
            items.push({
                id: "create-apiary",
                title: "Creer ton premier rucher",
                detail: "Commence par le site.",
                actionLabel: "Ouvrir les ruchers",
                onAction: onOpenApiaries,
            });
        }

        if (apiaries.length > 0 && hives.length === 0) {
            items.push({
                id: "create-hive",
                title: "Ajouter au moins une ruche",
                detail: "Ajoute un support de suivi.",
                actionLabel: "Configurer les ruches",
                onAction: onOpenApiaries,
            });
        }

        if (hives.length > 0 && recentActivity.length === 0) {
            items.push({
                id: "start-journal",
                title: "Lancer le journal terrain",
                detail: "Enregistre la premiere entree.",
            });
        }

        if (userNeedsEmailVerification) {
            items.push({
                id: "verify-email",
                title: "Confirmer l email du compte",
                detail: "La validation reste requise.",
            });
        }

        if (recentActivity.length > 0) {
            items.push({
                id: "review-journal",
                title: "Relire les derniers passages",
                detail: "Verifie les dernieres entrees.",
                actionLabel: "Ouvrir le journal",
                onAction: onOpenJournal,
            });
        }

        items.push({
            id: "traceability",
            title: "Structurer la tracabilite",
            detail: "Controle le suivi par ruche.",
            actionLabel: "Voir la conformite",
            onAction: onOpenCompliance,
        });

        return items.slice(0, 4);
    }, [apiaries.length, hives.length, recentActivity.length, userNeedsEmailVerification, onOpenApiaries, onOpenJournal, onOpenCompliance]);

    const hasReadingHives = readingsHives.length > 0;
    const hasActionHives = actionsHives.length > 0;

    return (
        <section className="grid gap-6">
            <SectionCard
                title="Cockpit terrain"
                description="Saisie rapide et actions du jour."
                action={
                    <Button type="button" variant="outline" className="rounded-xl" onClick={onOpenJournal}>
                        Ouvrir le journal
                        <ArrowRight className="size-4" />
                    </Button>
                }
                contentClassName="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
            >
                <div className="rounded-[28px] border border-border/70 bg-[linear-gradient(135deg,rgba(30,74,58,0.96),rgba(47,94,73,0.88)_48%,rgba(241,186,89,0.18))] p-6 text-primary-foreground shadow-[0_30px_90px_-55px_rgba(21,33,27,0.82)]">
                    <StatusBadge className="border-transparent bg-white/10 text-primary-foreground">Terrain first</StatusBadge>
                    <h2 className="mt-4 font-display text-4xl leading-tight text-primary-foreground">
                        Passe au rucher. Saisis. Repars.
                    </h2>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-primary-foreground/78">
                        Tout ce qu il faut pour noter une visite sans perdre de temps.
                    </p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[20px] border border-white/10 bg-white/8 p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-primary-foreground/58">Mesures</p>
                            <p className="mt-2 text-2xl font-semibold text-primary-foreground">{recentActivity.filter((entry) => entry.kind === "Mesure").length}</p>
                        </div>
                        <div className="rounded-[20px] border border-white/10 bg-white/8 p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-primary-foreground/58">Actions</p>
                            <p className="mt-2 text-2xl font-semibold text-primary-foreground">{recentActivity.filter((entry) => entry.kind === "Action").length}</p>
                        </div>
                        <div className="rounded-[20px] border border-white/10 bg-white/8 p-4">
                            <p className="text-xs uppercase tracking-[0.22em] text-primary-foreground/58">Ruches actives</p>
                            <p className="mt-2 text-2xl font-semibold text-primary-foreground">{hives.length}</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-3">
                    {priorities.map((item) => (
                        <article
                            key={item.id}
                            className="rounded-[24px] border border-border/70 bg-background/80 p-5 shadow-[0_16px_40px_-32px_rgba(40,31,21,0.35)]"
                        >
                            <p className="font-medium text-foreground">{item.title}</p>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                            {item.actionLabel && item.onAction ? (
                                <Button type="button" variant="ghost" className="mt-3 rounded-xl px-0 text-primary hover:bg-transparent" onClick={item.onAction}>
                                    {item.actionLabel}
                                    <ArrowRight className="size-4" />
                                </Button>
                            ) : null}
                        </article>
                    ))}
                </div>
            </SectionCard>

            <div className="grid gap-6 xl:grid-cols-2">
                <SectionCard
                    title="Mesure rapide"
                    description="Releve en une saisie."
                    action={<StatusBadge className="bg-primary/10 text-primary">Capteurs humains</StatusBadge>}
                >
                    <form className="grid gap-4" onSubmit={createReading}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <FieldBlock label="Rucher">
                                <NativeSelect
                                    value={selectedReadingsApiaryFilter}
                                    onChange={(event) => setSelectedReadingsApiaryFilter(event.target.value)}
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
                                    value={readingForm.hive_id}
                                    onChange={(event) => setReadingForm({ ...readingForm, hive_id: event.target.value })}
                                    required
                                >
                                    <option value="">Choisir une ruche</option>
                                    {readingsHives.map((hive) => (
                                        <option key={hive.id} value={hive.id}>
                                            {hive.name}
                                        </option>
                                    ))}
                                </NativeSelect>
                            </FieldBlock>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <FieldBlock label="Poids (kg)">
                                <Input
                                    type="number"
                                    step="0.01"
                                    inputMode="decimal"
                                    value={readingForm.weight_kg}
                                    onChange={(event) => setReadingForm({ ...readingForm, weight_kg: event.target.value })}
                                    className="h-11 rounded-xl"
                                />
                            </FieldBlock>
                            <FieldBlock label="Temperature (C)">
                                <Input
                                    type="number"
                                    step="0.1"
                                    inputMode="decimal"
                                    value={readingForm.temperature_c}
                                    onChange={(event) => setReadingForm({ ...readingForm, temperature_c: event.target.value })}
                                    className="h-11 rounded-xl"
                                />
                            </FieldBlock>
                            <FieldBlock label="Humidite (%)">
                                <Input
                                    type="number"
                                    step="0.1"
                                    inputMode="decimal"
                                    value={readingForm.humidity_percent}
                                    onChange={(event) => setReadingForm({ ...readingForm, humidity_percent: event.target.value })}
                                    className="h-11 rounded-xl"
                                />
                            </FieldBlock>
                            <FieldBlock label="Activite (0-100)">
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    value={readingForm.activity_index}
                                    onChange={(event) => setReadingForm({ ...readingForm, activity_index: event.target.value })}
                                    className="h-11 rounded-xl"
                                />
                            </FieldBlock>
                        </div>

                        <FieldBlock label="Date de mesure">
                            <Input
                                type="datetime-local"
                                value={readingForm.recorded_at}
                                onChange={(event) => setReadingForm({ ...readingForm, recorded_at: event.target.value })}
                                className="h-11 rounded-xl"
                                required
                            />
                        </FieldBlock>

                        {!hasReadingHives ? (
                            <EmptyState
                                title="Aucune ruche disponible pour cette mesure"
                                description="Cree une ruche ou ajuste le filtre rucher pour pouvoir enregistrer un releve."
                                className="min-h-0"
                            />
                        ) : null}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Button className="rounded-xl" type="submit" disabled={busy || !hasReadingHives}>
                                <WavesLadder className="size-4" />
                                Enregistrer la mesure
                            </Button>
                            <p className="text-sm text-muted-foreground">
                                La saisie garde automatiquement l horodatage et le contexte ruche/rucher.
                            </p>
                        </div>
                    </form>
                </SectionCard>

                <SectionCard
                    title="Action terrain"
                    description="Intervention et note associee."
                    action={<StatusBadge className="bg-accent/20 text-accent-foreground">Tracabilite</StatusBadge>}
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
                                placeholder="Visite, traitement, nourrissement, recolte"
                                className="h-11 rounded-xl"
                                required
                            />
                        </FieldBlock>

                        <FieldBlock label="Notes utiles">
                            <Textarea
                                rows={5}
                                value={actionForm.description}
                                onChange={(event) => setActionForm({ ...actionForm, description: event.target.value })}
                                placeholder="Ce qui a ete fait, observe ou devra etre repris au prochain passage."
                                className="min-h-32 rounded-2xl"
                            />
                        </FieldBlock>

                        <FieldBlock label="Date d intervention">
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
                                title="Aucune ruche disponible pour l action"
                                description="Ajuste le filtre rucher ou ajoute une ruche avant de journaliser l intervention."
                                className="min-h-0"
                            />
                        ) : null}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Button className="rounded-xl" type="submit" disabled={busy || !hasActionHives}>
                                <ClipboardPlus className="size-4" />
                                Consigner l action
                            </Button>
                            <p className="text-sm text-muted-foreground">
                                Cette entree alimente directement le registre recent et les indicateurs de conformite.
                            </p>
                        </div>
                    </form>
                </SectionCard>
            </div>

            <SectionCard
                title="Derniers passages"
                description="Dernieres entrees."
                action={
                    <Button type="button" variant="outline" className="rounded-xl" onClick={onOpenCompliance}>
                        <ShieldCheck className="size-4" />
                        Voir la conformite
                    </Button>
                }
                contentClassName="grid gap-4 lg:grid-cols-2"
            >
                {recentActivity.length === 0 ? (
                    <EmptyState
                        title="Aucune mesure ni intervention enregistree"
                        description="Demarre avec un premier releve ou une intervention pour lancer le rythme de suivi."
                        action={
                            <Button type="button" className="rounded-xl" onClick={onOpenApiaries}>
                                Preparer la base d exploitation
                            </Button>
                        }
                    />
                ) : (
                    recentActivity.map((entry) => (
                        <article
                            key={entry.id}
                            className="rounded-[24px] border border-border/70 bg-background/80 p-5 shadow-[0_16px_40px_-32px_rgba(40,31,21,0.35)]"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <StatusBadge className={entry.kind === "Action" ? "bg-accent/20 text-accent-foreground" : "bg-primary/10 text-primary"}>
                                    {entry.kind}
                                </StatusBadge>
                                <p className="text-sm text-muted-foreground">{formatDate(entry.timestamp)}</p>
                            </div>
                            <p className="mt-4 font-display text-2xl text-foreground">{entry.title}</p>
                            <p className="mt-2 text-sm leading-7 text-muted-foreground">{entry.subtitle}</p>
                        </article>
                    ))
                )}
            </SectionCard>
        </section>
    );
}
