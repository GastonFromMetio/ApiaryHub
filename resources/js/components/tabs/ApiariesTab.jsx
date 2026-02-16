export function ApiariesTab({
    apiaries,
    apiaryForm,
    setApiaryForm,
    createApiary,
    editingApiaryId,
    editingApiaryForm,
    setEditingApiaryForm,
    startEditApiary,
    updateApiary,
    setEditingApiaryId,
    deleteApiary,
    busy,
}) {
    return (
        <section className="content-grid two-columns">
            <article className="panel">
                <h2>Creer un rucher</h2>
                <form className="form-grid" onSubmit={createApiary}>
                    <label>
                        Nom du rucher
                        <input
                            value={apiaryForm.name}
                            onChange={(event) => setApiaryForm({ ...apiaryForm, name: event.target.value })}
                            required
                        />
                    </label>
                    <label>
                        Latitude (optionnel)
                        <input
                            type="number"
                            step="0.000001"
                            value={apiaryForm.latitude}
                            onChange={(event) => setApiaryForm({ ...apiaryForm, latitude: event.target.value })}
                        />
                    </label>
                    <label>
                        Longitude (optionnel)
                        <input
                            type="number"
                            step="0.000001"
                            value={apiaryForm.longitude}
                            onChange={(event) => setApiaryForm({ ...apiaryForm, longitude: event.target.value })}
                        />
                    </label>
                    <label className="full">
                        Notes
                        <textarea
                            rows={3}
                            value={apiaryForm.notes}
                            onChange={(event) => setApiaryForm({ ...apiaryForm, notes: event.target.value })}
                        />
                    </label>
                    <button className="btn btn-primary" type="submit" disabled={busy}>Ajouter rucher</button>
                </form>
            </article>

            <article className="panel">
                <h2>Mes ruchers</h2>
                <div className="list-shell">
                    {apiaries.map((apiary) => {
                        const isEditing = editingApiaryId === apiary.id;

                        return (
                            <div className="item-card" key={apiary.id}>
                                {isEditing ? (
                                    <div className="form-grid compact">
                                        <label>
                                            Nom
                                            <input
                                                value={editingApiaryForm.name}
                                                onChange={(event) => setEditingApiaryForm({ ...editingApiaryForm, name: event.target.value })}
                                            />
                                        </label>
                                        <label>
                                            Latitude
                                            <input
                                                type="number"
                                                step="0.000001"
                                                value={editingApiaryForm.latitude}
                                                onChange={(event) => setEditingApiaryForm({ ...editingApiaryForm, latitude: event.target.value })}
                                            />
                                        </label>
                                        <label>
                                            Longitude
                                            <input
                                                type="number"
                                                step="0.000001"
                                                value={editingApiaryForm.longitude}
                                                onChange={(event) => setEditingApiaryForm({ ...editingApiaryForm, longitude: event.target.value })}
                                            />
                                        </label>
                                        <label className="full">
                                            Notes
                                            <textarea
                                                rows={2}
                                                value={editingApiaryForm.notes}
                                                onChange={(event) => setEditingApiaryForm({ ...editingApiaryForm, notes: event.target.value })}
                                            />
                                        </label>
                                        <div className="row actions full">
                                            <button className="btn btn-primary" type="button" onClick={() => updateApiary(apiary.id)} disabled={busy}>Sauver</button>
                                            <button className="btn" type="button" onClick={() => setEditingApiaryId(null)}>Annuler</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="row between">
                                            <h3>{apiary.name}</h3>
                                            <span className="chip">{apiary.hives_count ?? 0} ruche(s)</span>
                                        </div>
                                        <p className="muted small">
                                            Lat {apiary.latitude ?? '-'} / Lon {apiary.longitude ?? '-'}
                                        </p>
                                        {apiary.notes && <p>{apiary.notes}</p>}
                                        <div className="row actions">
                                            <button type="button" className="btn" onClick={() => startEditApiary(apiary)}>Edit</button>
                                            <button type="button" className="btn btn-danger" onClick={() => deleteApiary(apiary.id)} disabled={busy}>Delete</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                    {apiaries.length === 0 && <p className="muted">Aucun rucher pour le moment.</p>}
                </div>
            </article>
        </section>
    );
}
