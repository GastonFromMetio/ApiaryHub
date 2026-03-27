import { useEffect, useMemo } from "react";
import { Activity, FilterX, Hexagon, MapPinned, ShieldCheck, Trash2, Users } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState, FieldBlock, FilterToolbar, MetricCard, NativeSelect, SectionCard, StatusBadge } from "@/components/app/app-ui";
import { FALLBACK_CENTER } from "@/constants";
import { formatCountLabel } from "@/utils/text";

function formatDate(value) {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleString();
}

function formatCoordinates(latitude, longitude) {
    const lat = Number(latitude);
    const lon = Number(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
        return "Non renseignées";
    }

    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
}

function toCoordinateApiaries(apiaries = []) {
    return apiaries
        .map((apiary) => {
            const latitude = Number(apiary.latitude);
            const longitude = Number(apiary.longitude);

            if (
                Number.isNaN(latitude)
                || Number.isNaN(longitude)
                || latitude < -90
                || latitude > 90
                || longitude < -180
                || longitude > 180
            ) {
                return null;
            }

            return {
                ...apiary,
                latitude,
                longitude,
            };
        })
        .filter(Boolean);
}

function MapViewport({ positions }) {
    const map = useMap();

    useEffect(() => {
        if (positions.length === 0) {
            map.setView(FALLBACK_CENTER, 5);
            return;
        }

        if (positions.length === 1) {
            map.setView(positions[0], 10);
            return;
        }

        map.fitBounds(positions, {
            padding: [36, 36],
        });
    }, [map, positions]);

    return null;
}

function statusBadgeClass(status) {
    if (status === "active") {
        return "bg-primary/10 text-primary";
    }

    if (status === "maintenance") {
        return "bg-accent/20 text-accent-foreground";
    }

    return "bg-secondary text-secondary-foreground";
}

function ApiariesMap({ apiaries }) {
    const coordinateApiaries = useMemo(() => toCoordinateApiaries(apiaries), [apiaries]);
    const positions = useMemo(
        () => coordinateApiaries.map((apiary) => [apiary.latitude, apiary.longitude]),
        [coordinateApiaries]
    );

    if (coordinateApiaries.length === 0) {
        return (
            <EmptyState
                title="Aucun rucher cartographié"
                description="Ajoute des coordonnées sur les ruchers pour les visualiser ici."
                className="min-h-72"
            />
        );
    }

    return (
        <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-3">
                <div className="radius-subpanel border border-border/70 bg-secondary/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Points visibles</p>
                    <p className="mt-2 font-display text-3xl text-foreground">{coordinateApiaries.length}</p>
                </div>
                <div className="radius-subpanel border border-border/70 bg-secondary/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Ruchers filtrés</p>
                    <p className="mt-2 font-display text-3xl text-foreground">{apiaries.length}</p>
                </div>
                <div className="radius-subpanel border border-border/70 bg-secondary/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Sans coordonnées</p>
                    <p className="mt-2 font-display text-3xl text-foreground">{Math.max(0, apiaries.length - coordinateApiaries.length)}</p>
                </div>
            </div>

            <MapContainer
                center={positions[0] || FALLBACK_CENTER}
                zoom={6}
                scrollWheelZoom
                className="apiary-map"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapViewport positions={positions} />
                {coordinateApiaries.map((apiary) => (
                    <Marker key={`admin-apiary-${apiary.id}`} position={[apiary.latitude, apiary.longitude]}>
                        <Popup>
                            <div className="grid gap-1">
                                <strong>{apiary.name}</strong>
                                <span>{apiary.user?.name || apiary.user?.email || "Utilisateur inconnu"}</span>
                                <span>{formatCountLabel(apiary.hives_count ?? 0, "ruche")}</span>
                                <span>{formatCoordinates(apiary.latitude, apiary.longitude)}</span>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

export function AdminTab({
    data,
    currentUserId,
    busy,
    selectedUserFilter,
    selectedApiaryFilter,
    selectedHiveFilter,
    onDeleteUser,
    onUserFilterChange,
    onApiaryFilterChange,
    onHiveFilterChange,
}) {
    const stats = data?.stats || {};
    const people = data?.people || [];
    const activityByDay = data?.activity_by_day || [];
    const userOptions = data?.user_options || [];
    const apiaryOptions = data?.apiary_options || [];
    const hiveOptions = data?.hive_options || [];
    const apiaries = data?.apiaries || [];
    const hives = data?.hives || [];
    const activeFilterCount = [selectedUserFilter, selectedApiaryFilter, selectedHiveFilter].filter((value) => value !== "all").length;

    const clearFilters = () => {
        onUserFilterChange("all");
        onApiaryFilterChange("all");
        onHiveFilterChange("all");
    };

    const maxActivity = activityByDay.reduce((accumulator, row) => Math.max(accumulator, row.total || 0), 1);

    const confirmDeleteUser = async (person) => {
        if (!person || !onDeleteUser) {
            return;
        }

        const confirmed = window.confirm(
            `Supprimer le compte ${person.email || person.name} et toutes ses données associées ?`
        );

        if (!confirmed) {
            return;
        }

        await onDeleteUser(person);
    };

    return (
        <section className="grid gap-6">
            <SectionCard
                title="Vue d’ensemble"
                description="Filtre l’administration par utilisateur, rucher ou ruche puis inspecte les créations et leurs positions."
                action={<StatusBadge variant="secondary">{activeFilterCount === 0 ? "Aucun filtre" : `${activeFilterCount} filtre${activeFilterCount > 1 ? "s" : ""}`}</StatusBadge>}
                contentClassName="grid gap-4"
            >
                <FilterToolbar className="grid gap-3 xl:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
                    <FieldBlock label="Utilisateur" labelClassName="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/72">
                        <NativeSelect value={selectedUserFilter} onChange={(event) => onUserFilterChange(event.target.value)} className="h-10 border-border/55 bg-background/78 shadow-none">
                            <option value="all">Tous les utilisateurs</option>
                            {userOptions.map((user) => (
                                <option key={user.id} value={String(user.id)}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </NativeSelect>
                    </FieldBlock>

                    <FieldBlock label="Rucher" labelClassName="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/72">
                        <NativeSelect value={selectedApiaryFilter} onChange={(event) => onApiaryFilterChange(event.target.value)} className="h-10 border-border/55 bg-background/78 shadow-none">
                            <option value="all">Tous les ruchers</option>
                            {apiaryOptions.map((apiary) => (
                                <option key={apiary.id} value={String(apiary.id)}>
                                    {apiary.name} ({apiary.user?.email || "sans propriétaire"})
                                </option>
                            ))}
                        </NativeSelect>
                    </FieldBlock>

                    <FieldBlock label="Ruche" labelClassName="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/72">
                        <NativeSelect value={selectedHiveFilter} onChange={(event) => onHiveFilterChange(event.target.value)} className="h-10 border-border/55 bg-background/78 shadow-none">
                            <option value="all">Toutes les ruches</option>
                            {hiveOptions.map((hive) => (
                                <option key={hive.id} value={String(hive.id)}>
                                    {hive.name} ({hive.apiary_entity?.name || "rucher non défini"})
                                </option>
                            ))}
                        </NativeSelect>
                    </FieldBlock>

                    <div className="flex items-end">
                        <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={clearFilters}>
                            <FilterX className="size-4" />
                            Réinitialiser
                        </Button>
                    </div>
                </FilterToolbar>

                <div className="grid gap-4 lg:grid-cols-5">
                    <MetricCard label="Comptes" value={stats.accounts ?? 0} hint="Périmètre courant." icon={Users} accent="forest" />
                    <MetricCard label="Admins" value={stats.admins ?? 0} hint="Dans le filtre." icon={ShieldCheck} accent="clay" />
                    <MetricCard label="Ruchers" value={stats.apiaries ?? 0} hint="Sites visibles." icon={MapPinned} accent="honey" />
                    <MetricCard label="Ruches" value={stats.hives ?? 0} hint="Ruches visibles." icon={Hexagon} accent="sky" />
                    <MetricCard label="Activité" value={(stats.readings ?? 0) + (stats.actions ?? 0)} hint="Relevés + interventions." icon={Activity} accent="forest" />
                </div>
            </SectionCard>

            <SectionCard
                title="Carte des ruchers"
                description="Position des ruchers filtrés avec propriétaire et volume de ruches."
                action={<StatusBadge variant="secondary">{formatCountLabel(apiaries.length, "rucher")}</StatusBadge>}
            >
                <ApiariesMap apiaries={apiaries} />
            </SectionCard>

            <div className="grid gap-6 xl:grid-cols-2">
                <SectionCard
                    title="Ruchers créés"
                    description="Liste détaillée des ruchers visibles."
                    action={<StatusBadge variant="secondary">{formatCountLabel(apiaries.length, "rucher")}</StatusBadge>}
                >
                    {apiaries.length === 0 ? (
                        <EmptyState
                            title="Aucun rucher pour ce filtre"
                            description="Élargis le filtre utilisateur ou retire les contraintes rucher/ruche."
                        />
                    ) : (
                        <div className="overflow-hidden rounded-[24px] border border-border/70">
                            <Table>
                                <TableHeader className="bg-secondary/45">
                                    <TableRow>
                                        <TableHead>Rucher</TableHead>
                                        <TableHead>Propriétaire</TableHead>
                                        <TableHead>Coordonnées</TableHead>
                                        <TableHead>Ruches</TableHead>
                                        <TableHead>Créé le</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {apiaries.map((apiary) => (
                                        <TableRow key={apiary.id} className="bg-background/80 transition hover:bg-secondary/35">
                                            <TableCell className="font-medium text-foreground">{apiary.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{apiary.user?.email || "-"}</TableCell>
                                            <TableCell className="text-muted-foreground">{formatCoordinates(apiary.latitude, apiary.longitude)}</TableCell>
                                            <TableCell>{apiary.hives_count ?? 0}</TableCell>
                                            <TableCell className="text-muted-foreground">{formatDate(apiary.created_at)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </SectionCard>

                <SectionCard
                    title="Ruches créées"
                    description="Liste détaillée des ruches visibles."
                    action={<StatusBadge variant="secondary">{formatCountLabel(hives.length, "ruche")}</StatusBadge>}
                >
                    {hives.length === 0 ? (
                        <EmptyState
                            title="Aucune ruche pour ce filtre"
                            description="Ajuste les filtres pour retrouver les ruches de l’utilisateur ou du rucher ciblé."
                        />
                    ) : (
                        <div className="overflow-hidden rounded-[24px] border border-border/70">
                            <Table>
                                <TableHeader className="bg-secondary/45">
                                    <TableRow>
                                        <TableHead>Ruche</TableHead>
                                        <TableHead>Rucher</TableHead>
                                        <TableHead>Propriétaire</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Relevés</TableHead>
                                        <TableHead>Actions</TableHead>
                                        <TableHead>Créée le</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {hives.map((hive) => (
                                        <TableRow key={hive.id} className="bg-background/80 transition hover:bg-secondary/35">
                                            <TableCell className="font-medium text-foreground">{hive.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{hive.apiary_entity?.name || "-"}</TableCell>
                                            <TableCell className="text-muted-foreground">{hive.user?.email || "-"}</TableCell>
                                            <TableCell>
                                                <StatusBadge className={statusBadgeClass(hive.status)}>{hive.status}</StatusBadge>
                                            </TableCell>
                                            <TableCell>{hive.readings_count ?? 0}</TableCell>
                                            <TableCell>{hive.actions_count ?? 0}</TableCell>
                                            <TableCell className="text-muted-foreground">{formatDate(hive.created_at)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </SectionCard>
            </div>

            <SectionCard
                title="Utilisateurs et activité"
                description="Synthèse des comptes touchés par le filtre courant."
                action={<StatusBadge variant="secondary">{formatCountLabel(people.length, "personne")}</StatusBadge>}
            >
                {people.length === 0 ? (
                    <EmptyState
                        title="Aucune personne sur ce périmètre"
                        description="Le filtre courant ne renvoie aucun compte."
                    />
                ) : (
                    <div className="overflow-hidden rounded-[24px] border border-border/70">
                        <Table>
                            <TableHeader className="bg-secondary/45">
                                <TableRow>
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Rôle</TableHead>
                                    <TableHead>Ruchers</TableHead>
                                    <TableHead>Ruches</TableHead>
                                    <TableHead>Relevés</TableHead>
                                    <TableHead>Interventions</TableHead>
                                    <TableHead>Dernière activité</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {people.map((person) => (
                                    <TableRow key={person.id} className="bg-background/80 transition hover:bg-secondary/35">
                                        <TableCell className="font-medium text-foreground">{person.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{person.email}</TableCell>
                                        <TableCell>{person.is_admin ? "Admin" : "Utilisateur"}</TableCell>
                                        <TableCell>{person.apiaries_count ?? 0}</TableCell>
                                        <TableCell>{person.hives_count ?? 0}</TableCell>
                                        <TableCell>{person.readings_count ?? 0}</TableCell>
                                        <TableCell>{person.actions_count ?? 0}</TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(person.last_activity_at)}</TableCell>
                                        <TableCell className="text-right">
                                            {Number(person.id) === Number(currentUserId) ? (
                                                <StatusBadge variant="outline">Compte courant</StatusBadge>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="rounded-xl"
                                                    onClick={() => confirmDeleteUser(person)}
                                                    disabled={busy}
                                                >
                                                    <Trash2 className="size-4" />
                                                    Supprimer
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </SectionCard>

            <SectionCard
                title="Activité des 7 derniers jours"
                description="Répartition journalière des relevés et interventions sur le périmètre filtré."
            >
                {activityByDay.length === 0 ? (
                    <EmptyState
                        title="Aucune activité"
                        description="Aucun relevé ni aucune intervention n’a été trouvé sur les sept derniers jours."
                    />
                ) : (
                    <div className="grid gap-3">
                        <div className="flex h-64 items-end gap-3 rounded-[24px] border border-border/70 bg-secondary/35 p-4">
                            {activityByDay.map((row) => {
                                const totalHeight = Math.max(12, Math.round(((row.total || 0) / maxActivity) * 100));
                                const actionsHeight = Math.max(8, Math.round(((row.actions || 0) / maxActivity) * 100));
                                const readingsHeight = Math.max(8, Math.round(((row.readings || 0) / maxActivity) * 100));

                                return (
                                    <div key={row.day} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                                        <div
                                            className="flex h-48 w-full items-end justify-center gap-1 rounded-[18px] border border-border/50 bg-background/80 px-2 py-3"
                                            title={`${row.day}: ${row.total} activités`}
                                        >
                                            <span className="w-3 rounded-full bg-primary/75" style={{ height: `${readingsHeight}%` }} />
                                            <span className="w-3 rounded-full bg-accent/85" style={{ height: `${actionsHeight}%` }} />
                                            <span className="w-3 rounded-full bg-foreground/70" style={{ height: `${totalHeight}%` }} />
                                        </div>
                                        <p className="text-center text-xs text-muted-foreground">{new Date(row.day).toLocaleDateString()}</p>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <StatusBadge className="bg-primary/10 text-primary">Relevés</StatusBadge>
                            <StatusBadge className="bg-accent/20 text-accent-foreground">Interventions</StatusBadge>
                            <StatusBadge variant="outline">Total</StatusBadge>
                        </div>
                    </div>
                )}
            </SectionCard>
        </section>
    );
}
