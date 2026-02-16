export function ActionsTab({
    createAction,
    actionForm,
    setActionForm,
    apiaries,
    selectedApiaryFilter,
    setSelectedApiaryFilter,
    hives,
    actions,
    busy,
    showHistory = true,
    onBack = null,
}) {
    const hasHives = hives.length > 0;

    return (
        <section className={showHistory ? 'content-grid two-columns' : 'content-grid'}>
            <article className="panel">
                <div className="row between form-title-row">
                    <h2>Ajouter une intervention</h2>
                    {onBack && (
                        <button type="button" className="btn" onClick={onBack}>
                            Retour actions rapides
                        </button>
                    )}
                </div>
                <form className="form-grid" onSubmit={createAction}>
                    <label>
                        Rucher
                        <select
                            value={selectedApiaryFilter}
                            onChange={(event) => setSelectedApiaryFilter(event.target.value)}
                        >
                            <option value="all">Tous les ruchers</option>
                            {apiaries.map((apiary) => (
                                <option key={apiary.id} value={apiary.id}>{apiary.name}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Ruche
                        <select
                            value={actionForm.hive_id}
                            onChange={(event) => setActionForm({ ...actionForm, hive_id: event.target.value })}
                            required
                        >
                            <option value="">Choisir</option>
                            {hives.map((hive) => (
                                <option key={hive.id} value={hive.id}>{hive.name}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Type
                        <input
                            value={actionForm.type}
                            onChange={(event) => setActionForm({ ...actionForm, type: event.target.value })}
                            placeholder="visite, traitement, nourrissement"
                            required
                        />
                    </label>
                    <label className="full">
                        Description
                        <textarea
                            rows={3}
                            value={actionForm.description}
                            onChange={(event) => setActionForm({ ...actionForm, description: event.target.value })}
                        />
                    </label>
                    <label>
                        Date
                        <input
                            type="datetime-local"
                            value={actionForm.performed_at}
                            onChange={(event) => setActionForm({ ...actionForm, performed_at: event.target.value })}
                            required
                        />
                    </label>
                    {!hasHives && (
                        <p className="muted">
                            Aucune ruche disponible pour ce rucher. Cree une ruche ou change de rucher.
                        </p>
                    )}
                    <button className="btn btn-primary" type="submit" disabled={busy || !hasHives}>Ajouter intervention</button>
                </form>
            </article>

            {showHistory && (
                <article className="panel">
                    <h2>Dernieres interventions</h2>
                    <div className="list-shell">
                        {actions.map((action) => (
                            <div className="item-card activity-card" key={action.id}>
                                <div className="row between">
                                    <h3>{action.type}</h3>
                                    <span className="chip">{new Date(action.performed_at).toLocaleString()}</span>
                                </div>
                                <p className="muted">{action.hive?.name || `Ruche #${action.hive_id}`}</p>
                                <p className="muted small">
                                    Rucher {action.hive?.apiary_entity?.name || action.hive?.apiary || 'non precise'}
                                </p>
                                {action.description && <p>{action.description}</p>}
                            </div>
                        ))}
                        {actions.length === 0 && <p className="muted">Aucune intervention enregistree.</p>}
                    </div>
                </article>
            )}
        </section>
    );
}
