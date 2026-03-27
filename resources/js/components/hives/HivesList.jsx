import { CloudSun, Pencil, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, FieldBlock, FilterToolbar, NativeSelect, SectionCard, StatusBadge } from "@/components/app/app-ui";
import { HIVE_STATUSES } from "@/constants";

export function HivesList({
    hives,
    totalHives,
    apiaries,
    weatherByHive,
    editingHiveId,
    editingHiveForm,
    setEditingHiveForm,
    startEditHive,
    updateHive,
    setEditingHiveId,
    fetchWeather,
    deleteHive,
    busy,
    handleEditingHiveApiaryChange,
    selectedApiaryFilter,
    setSelectedApiaryFilter,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
}) {
    return (
        <SectionCard
            title="Ruches"
            description="Filtre et gère les ruches."
            action={<StatusBadge variant="secondary">{hives.length} / {totalHives}</StatusBadge>}
            contentClassName="grid gap-4"
        >
            <FilterToolbar className="grid gap-3 md:grid-cols-[minmax(0,0.9fr)_repeat(2,minmax(0,0.55fr))]">
                <FieldBlock label="Recherche" labelClassName="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/72">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Nom ou repere"
                            className="h-10 rounded-xl border-border/55 bg-background/78 pl-10 shadow-none"
                        />
                    </div>
                </FieldBlock>
                <FieldBlock label="Rucher" labelClassName="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/72">
                    <NativeSelect value={selectedApiaryFilter} onChange={(event) => setSelectedApiaryFilter(event.target.value)} className="h-10 border-border/55 bg-background/78 shadow-none">
                        <option value="all">Tous</option>
                        {apiaries.map((apiary) => (
                            <option key={apiary.id} value={String(apiary.id)}>
                                {apiary.name}
                            </option>
                        ))}
                    </NativeSelect>
                </FieldBlock>
                <FieldBlock label="Statut" labelClassName="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/72">
                    <NativeSelect value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 border-border/55 bg-background/78 shadow-none">
                        <option value="all">Tous</option>
                        {HIVE_STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </NativeSelect>
                </FieldBlock>
            </FilterToolbar>

            {hives.length === 0 ? (
                <EmptyState
                    title="Aucune ruche ne correspond aux filtres"
                    description="Ajuste les filtres ou crée une ruche."
                />
            ) : (
                hives.map((hive) => {
                    const weather = weatherByHive[hive.id];
                    const isEditing = editingHiveId === hive.id;

                    return (
                        <div
                            className="radius-panel border border-border/70 bg-background/80 p-5 shadow-[0_16px_40px_-32px_rgba(40,31,21,0.35)]"
                            key={hive.id}
                        >
                            {isEditing ? (
                                <div className="grid gap-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <FieldBlock label="Nom">
                                            <Input
                                                value={editingHiveForm.name}
                                                onChange={(event) => setEditingHiveForm({ ...editingHiveForm, name: event.target.value })}
                                                className="h-11 rounded-xl"
                                            />
                                        </FieldBlock>
                                        <FieldBlock label="Statut">
                                            <NativeSelect
                                                value={editingHiveForm.status}
                                                onChange={(event) => setEditingHiveForm({ ...editingHiveForm, status: event.target.value })}
                                            >
                                                {HIVE_STATUSES.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </NativeSelect>
                                        </FieldBlock>
                                    </div>

                                    <FieldBlock label="Rucher">
                                        <NativeSelect
                                            value={editingHiveForm.apiary_id}
                                            onChange={(event) => handleEditingHiveApiaryChange(event.target.value)}
                                        >
                                            <option value="">Choisir</option>
                                            {apiaries.map((apiary) => (
                                                <option key={apiary.id} value={apiary.id}>
                                                    {apiary.name}
                                                </option>
                                            ))}
                                        </NativeSelect>
                                    </FieldBlock>

                                    <FieldBlock label="Notes">
                                        <Textarea
                                            rows={3}
                                            value={editingHiveForm.notes}
                                            onChange={(event) => setEditingHiveForm({ ...editingHiveForm, notes: event.target.value })}
                                            className="rounded-2xl"
                                        />
                                    </FieldBlock>

                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <Button className="rounded-xl" type="button" onClick={() => updateHive(hive.id)} disabled={busy}>
                                            Sauver
                                        </Button>
                                        <Button className="rounded-xl" type="button" variant="outline" onClick={() => setEditingHiveId(null)}>
                                            Annuler
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-display text-2xl text-foreground">{hive.name}</h3>
                                                <StatusBadge
                                                    className={
                                                        hive.status === "active"
                                                            ? "bg-primary/10 text-primary"
                                                            : hive.status === "maintenance"
                                                                ? "bg-accent/20 text-accent-foreground"
                                                                : ""
                                                    }
                                                >
                                                    {hive.status}
                                                </StatusBadge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {hive.apiary_entity?.name || hive.apiary || "Rucher non précisé"}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => startEditHive(hive)}>
                                                <Pencil className="size-4" />
                                                Modifier
                                            </Button>
                                            <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => fetchWeather(hive.id)} disabled={busy}>
                                                <CloudSun className="size-4" />
                                                Météo locale
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="rounded-xl"
                                                onClick={() => deleteHive(hive.id)}
                                                disabled={busy}
                                            >
                                                <Trash2 className="size-4" />
                                                Supprimer
                                            </Button>
                                        </div>
                                    </div>

                                    {hive.notes ? (
                                        <p className="text-sm leading-7 text-muted-foreground">{hive.notes}</p>
                                    ) : null}

                                    {weather ? (
                                        <div className="grid gap-3 rounded-[24px] border border-border/70 bg-secondary/45 p-4 md:grid-cols-3">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Maintenant</p>
                                                <p className="mt-2 font-display text-3xl text-foreground">
                                                    {weather.current.temperature_c ?? "-"} C
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Conditions</p>
                                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                                    pluie {weather.current.rain_mm ?? 0} mm, vent {weather.current.wind_kmh ?? 0} km/h
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Tendance</p>
                                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                                    min/max {weather.forecast_short.temperature_min_c ?? "-"} / {weather.forecast_short.temperature_max_c ?? "-"} C
                                                </p>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </SectionCard>
    );
}
