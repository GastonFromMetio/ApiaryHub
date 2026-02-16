import { HIVE_STATUSES } from '../../constants';

export function HivesList({
    hives,
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
}) {
    return (
        <article className="panel">
            <h2>Ruches</h2>
            <div className="list-shell">
                {hives.map((hive) => {
                    const weather = weatherByHive[hive.id];
                    const isEditing = editingHiveId === hive.id;

                    return (
                        <div className="item-card" key={hive.id}>
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
                                    <label>
                                        Rucher
                                        <select
                                            value={editingHiveForm.apiary_id}
                                            onChange={(event) => setEditingHiveForm({ ...editingHiveForm, apiary_id: event.target.value })}
                                        >
                                            <option value="">Choisir</option>
                                            {apiaries.map((apiary) => (
                                                <option key={apiary.id} value={apiary.id}>{apiary.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label>
                                        Latitude
                                        <input
                                            type="number"
                                            step="0.000001"
                                            value={editingHiveForm.latitude}
                                            onChange={(event) => setEditingHiveForm({ ...editingHiveForm, latitude: event.target.value })}
                                        />
                                    </label>
                                    <label>
                                        Longitude
                                        <input
                                            type="number"
                                            step="0.000001"
                                            value={editingHiveForm.longitude}
                                            onChange={(event) => setEditingHiveForm({ ...editingHiveForm, longitude: event.target.value })}
                                        />
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
                                        <h3>{hive.name}</h3>
                                        <span className="chip">{hive.status}</span>
                                    </div>
                                    <p className="muted">{hive.apiary_entity?.name || hive.apiary || 'Rucher non precise'}</p>
                                    <p className="muted small">Lat {hive.latitude ?? '-'} / Lon {hive.longitude ?? '-'}</p>
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
                {hives.length === 0 && <p className="muted">Aucune ruche pour le moment.</p>}
            </div>
        </article>
    );
}
