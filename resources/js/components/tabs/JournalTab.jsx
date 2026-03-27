import { useDeferredValue, useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, FieldBlock, FilterToolbar, NativeSelect, SectionCard, StatusBadge } from "@/components/app/app-ui";
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
                title="Journal"
                description="Historique des mesures et actions."
                action={
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <StatusBadge variant="secondary">{formatCountLabel(filteredEntries.length, "entree", "entrees")}</StatusBadge>
                        <Button type="button" variant="outline" className="rounded-xl" onClick={onOpenField}>
                            <ArrowLeft className="size-4" />
                            Retour terrain
                        </Button>
                    </div>
                }
                contentClassName="grid gap-4 lg:grid-cols-2"
            >
                <FilterToolbar className="lg:col-span-2 grid gap-3 xl:grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,0.55fr))]">
                    <FieldBlock label="Recherche" labelClassName="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/72">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Ruche, rucher, type, note"
                                className="h-10 rounded-xl border-border/55 bg-background/78 pl-10 shadow-none"
                            />
                        </div>
                    </FieldBlock>
                    <FieldBlock label="Type" labelClassName="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/72">
                        <NativeSelect value={kindFilter} onChange={(event) => setKindFilter(event.target.value)} className="h-10 border-border/55 bg-background/78 shadow-none">
                            <option value="all">Tout</option>
                            <option value="mesure">Mesures</option>
                            <option value="action">Actions</option>
                        </NativeSelect>
                    </FieldBlock>
                    <FieldBlock label="Rucher" labelClassName="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/72">
                        <NativeSelect
                            value={apiaryFilter}
                            onChange={(event) => {
                                setApiaryFilter(event.target.value);
                                setHiveFilter("all");
                            }}
                            className="h-10 border-border/55 bg-background/78 shadow-none"
                        >
                            <option value="all">Tous</option>
                            {apiaries.map((apiary) => (
                                <option key={apiary.id} value={String(apiary.id)}>
                                    {apiary.name}
                                </option>
                            ))}
                        </NativeSelect>
                    </FieldBlock>
                    <FieldBlock label="Ruche" labelClassName="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/72">
                        <NativeSelect value={hiveFilter} onChange={(event) => setHiveFilter(event.target.value)} className="h-10 border-border/55 bg-background/78 shadow-none">
                            <option value="all">Toutes</option>
                            {visibleHives.map((hive) => (
                                <option key={hive.id} value={String(hive.id)}>
                                    {hive.name}
                                </option>
                            ))}
                        </NativeSelect>
                    </FieldBlock>
                </FilterToolbar>

                {filteredEntries.length === 0 ? (
                    <EmptyState
                        className="lg:col-span-2"
                        title="Aucune entree ne correspond aux filtres"
                        description="Elargis les filtres ou retourne au terrain pour enregistrer de nouvelles mesures et interventions."
                    />
                ) : (
                    <div className="lg:col-span-2 overflow-hidden rounded-[24px] border border-border/70 bg-background/82 shadow-[0_18px_48px_-38px_rgba(40,31,21,0.35)]">
                        <ul className="divide-y divide-border/55">
                            {filteredEntries.map((entry) => (
                                <li key={entry.id} className="px-5 py-4">
                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <StatusBadge className={entry.kind === "action" ? "bg-accent/20 text-accent-foreground" : "bg-primary/10 text-primary"}>
                                                    {entry.label}
                                                </StatusBadge>
                                                {entry.kind === "action" && entry.hiveName ? (
                                                    <StatusBadge variant="outline">{entry.hiveName}</StatusBadge>
                                                ) : null}
                                            </div>
                                            <h3 className="mt-3 font-display text-xl text-foreground">{entry.title}</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">{entry.apiaryName}</p>
                                            <p className="mt-3 text-sm leading-6 text-muted-foreground">{entry.details}</p>
                                        </div>
                                        <p className="shrink-0 text-sm text-muted-foreground">{formatDate(entry.timestamp)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </SectionCard>
        </section>
    );
}
