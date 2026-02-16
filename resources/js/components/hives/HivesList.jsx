import { HIVE_STATUSES } from '../../constants';

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
        <article className="panel hives-list-card">
            <div className="hive-list-head">
                <div>
                    <h2>Ruches</h2>
                    <p className="muted small">{hives.length} visible(s) / {totalHives} total</p>
                </div>
                <div className="hive-toolbar">
                    <label className="hive-toolbar-field">
                        Rucher
                        <select value={selectedApiaryFilter} onChange={(event) => setSelectedApiaryFilter(event.target.value)}>
                            <option value="all">Tous</option>
                            {apiaries.map((apiary) => (
                                <option key={apiary.id} value={String(apiary.id)}>{apiary.name}</option>
                            ))}
                        </select>
                    </label>
                    <label className="hive-toolbar-field">
                        Statut
                        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                            <option value="all">Tous</option>
                            {HIVE_STATUSES.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </label>
                    <label className="hive-toolbar-field">
                        Recherche
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Nom de ruche"
                        />
                    </label>
                </div>
            </div>

            <div className="list-shell hives-list-shell">
                {hives.map((hive) => {
                    const weather = weatherByHive[hive.id];
                    const isEditing = editingHiveId === hive.id;

                    return (
                        <div className="item-card hive-item" key={hive.id}>
                            {isEditing ? (
                                <div className="form-grid compact">
                                    <label>
                                        Nom
                                        <input
                                            value={editingHiveForm.name}
                                            onChange={(event) => setEditingHiveForm({ ...editingHiveForm, name: event.target.value })}
                                        />
                                    </label>
                                    <label>
                                        Statut
                                        <select
                                            value={editingHiveForm.status}
                                            onChange={(event) => setEditingHiveForm({ ...editingHiveForm, status: event.target.value })}
                                        >
                                            {HIVE_STATUSES.map((status) => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="full">
                                        Rucher
                                        <select
                                            value={editingHiveForm.apiary_id}
                                            onChange={(event) => handleEditingHiveApiaryChange(event.target.value)}
                                        >
                                            <option value="">Choisir</option>
                                            {apiaries.map((apiary) => (
                                                <option key={apiary.id} value={apiary.id}>{apiary.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="full">
                                        Notes
                                        <textarea
                                            rows={2}
                                            value={editingHiveForm.notes}
                                            onChange={(event) => setEditingHiveForm({ ...editingHiveForm, notes: event.target.value })}
                                        />
                                    </label>
                                    <div className="row actions full">
                                        <button className="btn btn-primary" type="button" onClick={() => updateHive(hive.id)} disabled={busy}>Sauver</button>
                                        <button className="btn" type="button" onClick={() => setEditingHiveId(null)}>Annuler</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="row between">
                                        <div>
                                            <h3>{hive.name}</h3>
                                            <p className="muted small">{hive.apiary_entity?.name || hive.apiary || 'Rucher non precise'}</p>
                                        </div>
                                        <span className="chip">{hive.status}</span>
                                    </div>
                                    {hive.notes && <p>{hive.notes}</p>}
                                    <div className="row actions">
                                        <button type="button" className="btn" onClick={() => startEditHive(hive)}>Edit</button>
                                        <button type="button" className="btn" onClick={() => fetchWeather(hive.id)} disabled={busy}>Meteo</button>
                                        <button type="button" className="btn btn-danger" onClick={() => deleteHive(hive.id)} disabled={busy}>Delete</button>
                                    </div>
                                    {weather && (
                                        <div className="weather-box">
                                            <p><strong>{weather.current.temperature_c ?? '-'} C</strong> maintenant</p>
                                            <p className="muted small">
                                                pluie {weather.current.rain_mm ?? 0} mm, vent {weather.current.wind_kmh ?? 0} km/h
                                            </p>
                                            <p className="muted small">
                                                min/max {weather.forecast_short.temperature_min_c ?? '-'} / {weather.forecast_short.temperature_max_c ?? '-'} C
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
                {hives.length === 0 && <p className="muted">Aucune ruche ne correspond aux filtres.</p>}
            </div>
        </article>
    );
}
