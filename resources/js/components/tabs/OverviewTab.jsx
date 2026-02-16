export function OverviewTab({ stats, readings }) {
    return (
        <section className="content-grid">
            <article className="stats-grid">
                <div className="panel stat-card">
                    <h3>Ruches</h3>
                    <p>{stats.hiveCount}</p>
                </div>
                <div className="panel stat-card">
                    <h3>Ruchers</h3>
                    <p>{stats.apiaryCount ?? 0}</p>
                </div>
                <div className="panel stat-card secondary">
                    <h3>Releves</h3>
                    <p>{stats.readingCount}</p>
                </div>
                <div className="panel stat-card tertiary">
                    <h3>Interventions</h3>
                    <p>{stats.actionCount}</p>
                </div>
            </article>
            <article className="panel">
                <h2>Activite recente</h2>
                <div className="list-shell">
                    {readings.slice(0, 5).map((reading) => (
                        <div className="item-card" key={`o-reading-${reading.id}`}>
                            <div className="row between">
                                <h3>{reading.hive?.name || `Ruche #${reading.hive_id}`}</h3>
                                <span className="chip">{new Date(reading.recorded_at).toLocaleString()}</span>
                            </div>
                            <p className="muted small">
                                poids {reading.weight_kg ?? '-'} kg | temp {reading.temperature_c ?? '-'} C | humidite {reading.humidity_percent ?? '-'}%
                            </p>
                        </div>
                    ))}
                    {readings.length === 0 && <p className="muted">Aucun releve enregistre.</p>}
                </div>
            </article>
        </section>
    );
}
