import { useMemo } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState, MetricCard, SectionCard, StatusBadge } from "@/components/app/app-ui";
import { formatCountLabel } from "@/utils/text";

const TREATMENT_KEYWORDS = ["trait", "varroa", "acide", "oxal", "amitraz", "thymol"];
const HARVEST_KEYWORDS = ["recol", "miel", "hausse", "extraction"];

function matchesKeywords(value, keywords) {
    const normalized = (value || "").toLowerCase();

    return keywords.some((keyword) => normalized.includes(keyword));
}

function formatDate(value) {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleString();
}

export function ComplianceTab({
    hives,
    actions,
    onOpenField,
    onOpenJournal,
}) {
    const trackedHiveIds = useMemo(
        () => new Set(actions.map((action) => String(action.hive_id))),
        [actions]
    );

    const hivesWithoutActions = useMemo(
        () => hives.filter((hive) => !trackedHiveIds.has(String(hive.id))),
        [hives, trackedHiveIds]
    );

    const treatmentActions = useMemo(
        () => actions.filter((action) => matchesKeywords(action.type, TREATMENT_KEYWORDS) || matchesKeywords(action.description, TREATMENT_KEYWORDS)),
        [actions]
    );

    const harvestActions = useMemo(
        () => actions.filter((action) => matchesKeywords(action.type, HARVEST_KEYWORDS) || matchesKeywords(action.description, HARVEST_KEYWORDS)),
        [actions]
    );

    const recentRegisterEntries = useMemo(
        () => [...actions].sort((left, right) => new Date(right.performed_at).getTime() - new Date(left.performed_at).getTime()).slice(0, 10),
        [actions]
    );

    const missingPoints = useMemo(() => {
        const items = [];

        if (actions.length === 0) {
            items.push("Aucune intervention n est encore journalisee: la tracabilite n est pas exploitable.");
        }

        if (hivesWithoutActions.length > 0) {
            items.push(`${formatCountLabel(hivesWithoutActions.length, "ruche")} sans trace d intervention.`);
        }

        if (treatmentActions.length === 0) {
            items.push("Aucun traitement detecte dans le registre. Une nomenclature claire reste necessaire pour fiabiliser les exports futurs.");
        }

        if (harvestActions.length === 0) {
            items.push("Aucune recolte tracee pour l instant: la future gestion des lots reste a construire.");
        }

        items.push("Les lots, documents sanitaires et exports PDF constituent le prochain chantier prioritaire.");

        return items;
    }, [actions.length, harvestActions.length, hivesWithoutActions.length, treatmentActions.length]);

    return (
        <section className="grid gap-6">
            <SectionCard
                title="Conformite"
                description="Suivi du registre."
                action={
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" className="rounded-xl" onClick={onOpenField}>
                            Ajouter une action
                        </Button>
                        <Button type="button" variant="ghost" className="rounded-xl" onClick={onOpenJournal}>
                            Voir le journal
                            <ArrowRight className="size-4" />
                        </Button>
                    </div>
                }
                contentClassName="grid gap-4 lg:grid-cols-4"
            >
                <MetricCard
                    label="Ruches couvertes"
                    value={`${trackedHiveIds.size} / ${hives.length}`}
                    hint="Supports disposant deja d une trace d intervention."
                    icon={ShieldCheck}
                    accent="forest"
                />
                <MetricCard
                    label="Interventions"
                    value={actions.length}
                    hint="Lignes actuellement journalisees."
                    accent="honey"
                />
                <MetricCard
                    label="Traitements reperes"
                    value={treatmentActions.length}
                    hint="Detection par mots-clefs sur type et description."
                    accent="clay"
                />
                <MetricCard
                    label="Recoltes reperees"
                    value={harvestActions.length}
                    hint="Indicateur preparatoire pour la gestion des lots."
                    accent="sky"
                />
            </SectionCard>

            <SectionCard
                title="Points de vigilance"
                description="Ce qui manque encore."
                contentClassName="grid gap-4 lg:grid-cols-2"
            >
                {missingPoints.map((item) => (
                    <article key={item} className="rounded-[24px] border border-border/70 bg-background/80 p-5 shadow-[0_16px_40px_-32px_rgba(40,31,21,0.35)]">
                        <p className="text-sm leading-7 text-muted-foreground">{item}</p>
                    </article>
                ))}
            </SectionCard>

            <SectionCard
                title="Registre recent"
                description="Dernieres lignes."
                action={<StatusBadge variant="secondary">{formatCountLabel(recentRegisterEntries.length, "ligne")}</StatusBadge>}
                contentClassName="grid gap-4 lg:grid-cols-2"
            >
                {recentRegisterEntries.length === 0 ? (
                    <EmptyState
                        title="Aucune ligne de registre disponible"
                        description="Ajoute une premiere intervention terrain pour amorcer le registre et obtenir une vision utile ici."
                    />
                ) : (
                    recentRegisterEntries.map((action) => (
                        <article
                            className="rounded-[24px] border border-border/70 bg-background/80 p-5 shadow-[0_16px_40px_-32px_rgba(40,31,21,0.35)]"
                            key={action.id}
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <StatusBadge className={matchesKeywords(action.type, TREATMENT_KEYWORDS) ? "bg-accent/20 text-accent-foreground" : "bg-primary/10 text-primary"}>
                                    {action.type || "Intervention"}
                                </StatusBadge>
                                <p className="text-sm text-muted-foreground">{formatDate(action.performed_at)}</p>
                            </div>
                            <h3 className="mt-4 font-display text-2xl text-foreground">
                                {action.hive?.name || `Ruche #${action.hive_id}`}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {action.hive?.apiary_entity?.name || action.hive?.apiary || "Rucher non precise"}
                            </p>
                            <p className="mt-4 text-sm leading-7 text-muted-foreground">
                                {action.description || "Aucune note complementaire."}
                            </p>
                        </article>
                    ))
                )}
            </SectionCard>
        </section>
    );
}
