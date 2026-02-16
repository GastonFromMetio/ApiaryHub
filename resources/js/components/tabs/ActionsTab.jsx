export function ActionsTab({
    createAction,
    actionForm,
    setActionForm,
    hives,
    actions,
    busy,
}) {
    return (
        <section className="content-grid two-columns">
            <article className="panel">
                <h2>Ajouter une intervention</h2>
                <form className="form-grid" onSubmit={createAction}>
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
                    <button className="btn btn-primary" type="submit" disabled={busy}>Ajouter intervention</button>
                </form>
            </article>

            <article className="panel">
                <h2>Dernieres interventions</h2>
                <div className="list-shell">
                    {actions.map((action) => (
                        <div className="item-card" key={action.id}>
                            <div className="row between">
                                <h3>{action.type}</h3>
                                <span className="chip">{new Date(action.performed_at).toLocaleString()}</span>
                            </div>
                            <p className="muted">{action.hive?.name || `Ruche #${action.hive_id}`}</p>
                            {action.description && <p>{action.description}</p>}
                        </div>
                    ))}
                    {actions.length === 0 && <p className="muted">Aucune intervention enregistree.</p>}
                </div>
            </article>
        </section>
    );
}
