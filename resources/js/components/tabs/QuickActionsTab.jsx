export function QuickActionsTab({
    stats,
    recentActivity = [],
    onOpenReadingsForm,
    onOpenActionsForm,
    onOpenApiaries,
    onOpenHives,
    onOpenAccount,
    isAdmin = false,
    onOpenAdmin,
}) {
    return (
        <section className="content-grid quick-actions-grid">
            <article className="panel quick-actions-card quick-actions-hero">
                <h2>Actions terrain</h2>
                <p className="muted">Releve et intervention en acces direct. Retour automatique ici apres validation.</p>
                <div className="quick-actions-buttons">
                    <button type="button" className="btn btn-primary quick-action-btn" onClick={onOpenReadingsForm}>
                        Nouveau releve
                    </button>
                    <button type="button" className="btn quick-action-btn" onClick={onOpenActionsForm}>
                        Nouvelle intervention
                    </button>
                </div>
            </article>

            <article className="panel quick-actions-card">
                <h3>Raccourcis gestion</h3>
                <div className="quick-links-grid">
                    <button type="button" className="btn quick-link-btn" onClick={onOpenApiaries}>Ruchers</button>
                    <button type="button" className="btn quick-link-btn" onClick={onOpenHives}>Ruches</button>
                    <button type="button" className="btn quick-link-btn" onClick={onOpenAccount}>Compte</button>
                    {isAdmin && (
                        <button type="button" className="btn quick-link-btn" onClick={onOpenAdmin}>Admin</button>
                    )}
                </div>
            </article>

            <article className="panel quick-actions-card">
                <h3>Resume rapide</h3>
                <div className="quick-stats-grid">
                    <div className="quick-stat">
                        <span className="muted small">Ruchers</span>
                        <strong>{stats.apiaryCount ?? 0}</strong>
                    </div>
                    <div className="quick-stat">
                        <span className="muted small">Ruches</span>
                        <strong>{stats.hiveCount}</strong>
                    </div>
                    <div className="quick-stat">
                        <span className="muted small">Releves</span>
                        <strong>{stats.readingCount}</strong>
                    </div>
                    <div className="quick-stat">
                        <span className="muted small">Interventions</span>
                        <strong>{stats.actionCount}</strong>
                    </div>
                </div>
            </article>

            <article className="panel quick-actions-card">
                <h3>Dernieres actions</h3>
                <div className="list-shell quick-activity-shell">
                    {recentActivity.map((entry) => (
                        <div className="item-card activity-card" key={entry.id}>
                            <div className="row between">
                                <strong>{entry.kind}</strong>
                                <span className="chip">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '-'}</span>
                            </div>
                            <p>{entry.title}</p>
                            <p className="muted small">{entry.subtitle}</p>
                        </div>
                    ))}
                    {recentActivity.length === 0 && (
                        <p className="muted">Aucune action recente.</p>
                    )}
                </div>
            </article>
        </section>
    );
}
