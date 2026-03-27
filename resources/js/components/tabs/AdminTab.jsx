import { Activity, Hexagon, MapPinned, ShieldCheck, Users } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { EmptyState, MetricCard, NativeSelect, SectionCard, StatusBadge } from "@/components/app/app-ui";
import { formatCountLabel } from "@/utils/text";

function formatDate(value) {
    if (!value) {
        return "-";
    }

    return new Date(value).toLocaleString();
}

function BarChart({ rows = [] }) {
    const maxValue = rows.reduce((acc, row) => Math.max(acc, row.total || 0), 1);

    return (
        <div className="grid gap-3">
            <div className="flex h-64 items-end gap-3 rounded-[24px] border border-border/70 bg-secondary/35 p-4">
                {rows.map((row) => {
                    const totalHeight = Math.max(12, Math.round(((row.total || 0) / maxValue) * 100));
                    const actionsHeight = Math.max(8, Math.round(((row.actions || 0) / maxValue) * 100));
                    const readingsHeight = Math.max(8, Math.round(((row.readings || 0) / maxValue) * 100));

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
    );
}

export function AdminTab({
    data,
    selectedApiaryFilter,
    onApiaryFilterChange,
}) {
    const stats = data?.stats || {};
    const people = data?.people || [];
    const recent = data?.recent_creations || {};
    const activityByDay = data?.activity_by_day || [];
    const apiaryOptions = data?.apiary_options || [];
    const recentFeed = [...(recent.readings || []), ...(recent.actions || [])]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

    return (
        <section className="grid gap-6">
            <SectionCard
                title="Vue d’ensemble"
                description="Comptes, ruchers, activité."
                action={
                    <div className="w-full min-w-56 max-w-sm">
                        <NativeSelect value={selectedApiaryFilter} onChange={(event) => onApiaryFilterChange(event.target.value)}>
                            <option value="all">Tous les ruchers</option>
                            {apiaryOptions.map((apiary) => (
                                <option key={apiary.id} value={String(apiary.id)}>
                                    {apiary.name} ({apiary.user?.email || "sans propriétaire"})
                                </option>
                            ))}
                        </NativeSelect>
                    </div>
                }
                contentClassName="grid gap-4 lg:grid-cols-5"
            >
                <MetricCard label="Comptes" value={stats.accounts ?? 0} hint="Tous les profils." icon={Users} accent="forest" />
                <MetricCard label="Admins" value={stats.admins ?? 0} hint="Accès élevés." icon={ShieldCheck} accent="clay" />
                <MetricCard label="Ruchers" value={stats.apiaries ?? 0} hint="Sites indexés." icon={MapPinned} accent="honey" />
                <MetricCard label="Ruches" value={stats.hives ?? 0} hint="Ruches du filtre." icon={Hexagon} accent="sky" />
                <MetricCard label="Activité" value={(stats.readings ?? 0) + (stats.actions ?? 0)} hint="Mesures + actions." icon={Activity} accent="forest" />
            </SectionCard>

            <SectionCard
                title="Utilisateurs et activité"
                description="Comptes et volumes."
                action={<StatusBadge variant="secondary">{formatCountLabel(people.length, "personne")}</StatusBadge>}
            >
                {people.length === 0 ? (
                    <EmptyState
                        title="Aucune personne pour ce filtre"
                        description="Élargis le filtre rucher pour retrouver les comptes et leurs volumes d’activité."
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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {people.map((person) => (
                                    <TableRow key={person.id} className="bg-background/80">
                                        <TableCell className="font-medium text-foreground">{person.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{person.email}</TableCell>
                                        <TableCell>{person.is_admin ? "Admin" : "Utilisateur"}</TableCell>
                                        <TableCell>{person.apiaries_count ?? 0}</TableCell>
                                        <TableCell>{person.hives_count ?? 0}</TableCell>
                                        <TableCell>{person.readings_count ?? 0}</TableCell>
                                        <TableCell>{person.actions_count ?? 0}</TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(person.last_activity_at)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </SectionCard>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                <SectionCard
                    title="Activité des 7 derniers jours"
                    description="Mesures, actions, total."
                >
                    <BarChart rows={activityByDay} />
                </SectionCard>

                <SectionCard
                    title="Flux récent"
                    description="Dernières créations."
                    contentClassName="grid gap-4"
                >
                    {recentFeed.length === 0 ? (
                        <EmptyState
                            title="Aucune création récente"
                            description="Aucune mesure ni intervention récente n’est disponible sur le filtre courant."
                        />
                    ) : (
                        recentFeed.map((entry) => (
                            <article
                                key={`feed-${entry.id}-${entry.created_at}`}
                                className="rounded-[24px] border border-border/70 bg-background/80 p-5 shadow-[0_16px_40px_-32px_rgba(40,31,21,0.35)]"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <StatusBadge className={entry.type ? "bg-accent/20 text-accent-foreground" : "bg-primary/10 text-primary"}>
                                        {entry.type ? "Intervention" : "Relevé"}
                                    </StatusBadge>
                                    <p className="text-sm text-muted-foreground">{formatDate(entry.created_at)}</p>
                                </div>
                                <h3 className="mt-4 font-display text-2xl text-foreground">
                                    {entry.type ? entry.type : entry.hive?.name || `Ruche #${entry.hive_id}`}
                                </h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {entry.hive?.apiary_entity?.name || entry.hive?.apiaryEntity?.name || "Rucher non défini"}
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">{entry.hive?.user?.email || "-"}</p>
                            </article>
                        ))
                    )}
                </SectionCard>
            </div>
        </section>
    );
}
