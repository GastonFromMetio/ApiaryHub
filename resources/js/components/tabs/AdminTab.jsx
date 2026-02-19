function formatDate(value) {
    if (!value) {
        return '-';
    }

    return new Date(value).toLocaleString();
}

function BarChart({ rows = [] }) {
    const maxValue = rows.reduce((acc, row) => Math.max(acc, row.total || 0), 1);

    return (
        <div className="admin-bars">
            {rows.map((row) => {
                const barHeight = Math.max(8, Math.round(((row.total || 0) / maxValue) * 100));

                return (
                    <div className="admin-bar-item" key={row.day}>
                        <div className="admin-bar-stack" title={`${row.day}: ${row.total} actions`}>
                            <span className="admin-bar admin-bar-readings" style={{ height: `${Math.max(4, Math.round(((row.readings || 0) / maxValue) * 100))}%` }} />
                            <span className="admin-bar admin-bar-actions" style={{ height: `${Math.max(4, Math.round(((row.actions || 0) / maxValue) * 100))}%` }} />
                            <span className="admin-bar admin-bar-total" style={{ height: `${barHeight}%` }} />
                        </div>
                        <p className="muted small">{new Date(row.day).toLocaleDateString()}</p>
                    </div>
                );
            })}
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

    return (
        <section className="content-grid admin-grid-full">
            <article className="panel admin-controls-card">
                <div className="row between">
                    <div>
                        <h2>Dashboard admin complet</h2>
                        <p className="muted small">Analyse des comptes, activite et creations avec filtre par rucher.</p>
                    </div>
                </div>
                <div className="admin-filters-row">
                    <label>
                        Filtrer par rucher
                        <select
                            value={selectedApiaryFilter}
                            onChange={(event) => onApiaryFilterChange(event.target.value)}
                        >
                            <option value="all">Tous les ruchers</option>
                            {apiaryOptions.map((apiary) => (
                                <option key={apiary.id} value={String(apiary.id)}>
                                    {apiary.name} ({apiary.user?.email || 'sans proprietaire'})
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <div className="admin-kpi-grid">
                    <div className="admin-kpi-item">
                        <span className="muted small">Personnes</span>
                        <strong>{stats.accounts ?? 0}</strong>
                    </div>
                    <div className="admin-kpi-item">
                        <span className="muted small">Admins</span>
                        <strong>{stats.admins ?? 0}</strong>
                    </div>
                    <div className="admin-kpi-item">
                        <span className="muted small">Utilisateurs actifs</span>
                        <strong>{stats.active_users ?? 0}</strong>
                    </div>
                    <div className="admin-kpi-item">
                        <span className="muted small">Ruchers</span>
                        <strong>{stats.apiaries ?? 0}</strong>
                    </div>
                    <div className="admin-kpi-item">
                        <span className="muted small">Ruches</span>
                        <strong>{stats.hives ?? 0}</strong>
                    </div>
                    <div className="admin-kpi-item">
                        <span className="muted small">Activites (releves + interventions)</span>
                        <strong>{(stats.readings ?? 0) + (stats.actions ?? 0)}</strong>
                    </div>
                </div>
            </article>

            <article className="panel admin-table-card">
                <div className="row between">
                    <h3>Utilisateurs et activite</h3>
                    <span className="chip">{people.length} personnes</span>
                </div>
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Ruchers</th>
                                <th>Ruches</th>
                                <th>Releves</th>
                                <th>Interventions</th>
                                <th>Derniere activite</th>
                            </tr>
                        </thead>
                        <tbody>
                            {people.map((person) => (
                                <tr key={person.id}>
                                    <td>{person.name}</td>
                                    <td>{person.email}</td>
                                    <td>{person.is_admin ? 'Admin' : 'Utilisateur'}</td>
                                    <td>{person.apiaries_count ?? 0}</td>
                                    <td>{person.hives_count ?? 0}</td>
                                    <td>{person.readings_count ?? 0}</td>
                                    <td>{person.actions_count ?? 0}</td>
                                    <td>{formatDate(person.last_activity_at)}</td>
                                </tr>
                            ))}
                            {people.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="muted small">Aucune personne trouvee pour ce filtre.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </article>

            <div className="admin-analytics-grid">
                <article className="panel">
                    <h3>Activite des 7 derniers jours</h3>
                    <p className="muted small">Barres superposees: releves, interventions et total.</p>
                    <BarChart rows={activityByDay} />
                </article>

                <article className="panel">
                    <h3>Flux recentes</h3>
                    <div className="list-shell">
                        {[...(recent.readings || []), ...(recent.actions || [])]
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .slice(0, 10)
                            .map((entry) => (
                                <div className="item-card" key={`feed-${entry.id}-${entry.created_at}`}>
                                    <div className="row between">
                                        <strong>{entry.type ? `Intervention: ${entry.type}` : `Releve ${entry.hive?.name || '#'}`}</strong>
                                        <span className="chip">{formatDate(entry.created_at)}</span>
                                    </div>
                                    <p className="muted small">
                                        {entry.hive?.apiary_entity?.name || entry.hive?.apiaryEntity?.name || 'Rucher non defini'} | {entry.hive?.user?.email || '-'}
                                    </p>
                                </div>
                            ))}
                    </div>
                </article>
            </div>
        </section>
    );
}
