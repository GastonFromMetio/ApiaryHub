import { useDeferredValue, useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, FieldBlock, NativeSelect, SectionCard, StatusBadge } from "@/components/app/app-ui";
import { formatCountLabel } from "@/utils/text";

function formatDate(value) {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleString();
}

export function JournalTab({
    apiaries,
    hives,
    readings,
    actions,
    onOpenField,
}) {
    const [kindFilter, setKindFilter] = useState("all");
    const [apiaryFilter, setApiaryFilter] = useState("all");
    const [hiveFilter, setHiveFilter] = useState("all");
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);

    const entries = useMemo(() => {
        const readingItems = readings.map((reading) => ({
            id: `reading-${reading.id}`,
            kind: "mesure",
            label: "Mesure",
            title: reading.hive?.name || `Ruche #${reading.hive_id}`,
            timestamp: reading.recorded_at,
            apiaryId: reading.hive?.apiary_id ? String(reading.hive.apiary_id) : "unknown",
            apiaryName: reading.hive?.apiary_entity?.name || reading.hive?.apiary || "Rucher non precise",
            hiveId: String(reading.hive_id),
            details: [
                `Poids ${reading.weight_kg ?? "-"} kg`,
                `Temp ${reading.temperature_c ?? "-"} C`,
                `Humidite ${reading.humidity_percent ?? "-"} %`,
                `Activite ${reading.activity_index ?? "-"}`,
            ].join(" | "),
            searchText: `${reading.hive?.name || ""} ${reading.hive?.apiary_entity?.name || ""} ${reading.weight_kg ?? ""}`,
        }));

        const actionItems = actions.map((action) => ({
            id: `action-${action.id}`,
            kind: "action",
            label: "Action",
            title: action.type || "Intervention",
            timestamp: action.performed_at,
            apiaryId: action.hive?.apiary_id ? String(action.hive.apiary_id) : "unknown",
            apiaryName: action.hive?.apiary_entity?.name || action.hive?.apiary || "Rucher non precise",
            hiveId: String(action.hive_id),
            hiveName: action.hive?.name || `Ruche #${action.hive_id}`,
            details: action.description || "Aucune note complementaire.",
            searchText: `${action.type || ""} ${action.description || ""} ${action.hive?.name || ""} ${action.hive?.apiary_entity?.name || ""}`,
        }));

        return [...readingItems, ...actionItems]
            .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());
    }, [actions, readings]);

    const visibleHives = useMemo(() => {
        if (apiaryFilter === "all") {
            return hives;
        }

        return hives.filter((hive) => String(hive.apiary_id) === String(apiaryFilter));
    }, [apiaryFilter, hives]);

    const normalizedSearch = deferredSearch.trim().toLowerCase();

    const filteredEntries = useMemo(
        () => entries.filter((entry) => {
            const matchesKind = kindFilter === "all" || entry.kind === kindFilter;
            const matchesApiary = apiaryFilter === "all" || entry.apiaryId === String(apiaryFilter);
            const matchesHive = hiveFilter === "all" || entry.hiveId === String(hiveFilter);
            const matchesSearch = normalizedSearch === ""
                || entry.title.toLowerCase().includes(normalizedSearch)
                || entry.details.toLowerCase().includes(normalizedSearch)
                || entry.searchText.toLowerCase().includes(normalizedSearch);

            return matchesKind && matchesApiary && matchesHive && matchesSearch;
        }),
        [apiaryFilter, entries, hiveFilter, kindFilter, normalizedSearch]
    );

    return (
        <section className="grid gap-6">
            <SectionCard
                title="Journal unifie"
                description="Historique des mesures et actions."
                action={
                    <Button type="button" variant="outline" className="rounded-xl" onClick={onOpenField}>
                        <ArrowLeft className="size-4" />
                        Retour terrain
                    </Button>
                }
            >
                <div className="grid gap-4 rounded-[24px] border border-border/70 bg-secondary/35 p-4 xl:grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,0.55fr))]">
                    <FieldBlock label="Recherche">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Ruche, rucher, type, note"
                                className="h-11 rounded-xl pl-10"
                            />
                        </div>
                    </FieldBlock>
                    <FieldBlock label="Type">
                        <NativeSelect value={kindFilter} onChange={(event) => setKindFilter(event.target.value)}>
                            <option value="all">Tout</option>
                            <option value="mesure">Mesures</option>
                            <option value="action">Actions</option>
                        </NativeSelect>
                    </FieldBlock>
                    <FieldBlock label="Rucher">
                        <NativeSelect
                            value={apiaryFilter}
                            onChange={(event) => {
                                setApiaryFilter(event.target.value);
                                setHiveFilter("all");
                            }}
                        >
                            <option value="all">Tous</option>
                            {apiaries.map((apiary) => (
                                <option key={apiary.id} value={String(apiary.id)}>
                                    {apiary.name}
                                </option>
                            ))}
                        </NativeSelect>
                    </FieldBlock>
                    <FieldBlock label="Ruche">
                        <NativeSelect value={hiveFilter} onChange={(event) => setHiveFilter(event.target.value)}>
                            <option value="all">Toutes</option>
                            {visibleHives.map((hive) => (
                                <option key={hive.id} value={String(hive.id)}>
                                    {hive.name}
                                </option>
                            ))}
                        </NativeSelect>
                    </FieldBlock>
                </div>
            </SectionCard>

            <SectionCard
                title="Historique"
                description="Toutes les entrees filtrees."
                action={<StatusBadge variant="secondary">{formatCountLabel(filteredEntries.length, "entree", "entrees")}</StatusBadge>}
                contentClassName="grid gap-4 lg:grid-cols-2"
            >
                {filteredEntries.length === 0 ? (
                    <EmptyState
                        title="Aucune entree ne correspond aux filtres"
                        description="Elargis les filtres ou retourne au terrain pour enregistrer de nouvelles mesures et interventions."
                    />
                ) : (
                    filteredEntries.map((entry) => (
                        <article
                            key={entry.id}
                            className="rounded-[24px] border border-border/70 bg-background/80 p-5 shadow-[0_16px_40px_-32px_rgba(40,31,21,0.35)]"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <StatusBadge className={entry.kind === "action" ? "bg-accent/20 text-accent-foreground" : "bg-primary/10 text-primary"}>
                                        {entry.label}
                                    </StatusBadge>
                                    {entry.kind === "action" && entry.hiveName ? (
                                        <StatusBadge variant="outline">{entry.hiveName}</StatusBadge>
                                    ) : null}
                                </div>
                                <p className="text-sm text-muted-foreground">{formatDate(entry.timestamp)}</p>
                            </div>
                            <h3 className="mt-4 font-display text-2xl text-foreground">{entry.title}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">{entry.apiaryName}</p>
                            <p className="mt-4 text-sm leading-7 text-muted-foreground">{entry.details}</p>
                        </article>
                    ))
                )}
            </SectionCard>
        </section>
    );
}
