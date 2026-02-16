export function ReadingsTab({
    createReading,
    readingForm,
    setReadingForm,
    hives,
    readings,
    busy,
}) {
    return (
        <section className="content-grid two-columns">
            <article className="panel">
                <h2>Ajouter un releve</h2>
                <form className="form-grid" onSubmit={createReading}>
                    <label>
                        Ruche
                        <select
                            value={readingForm.hive_id}
                            onChange={(event) => setReadingForm({ ...readingForm, hive_id: event.target.value })}
                            required
                        >
                            <option value="">Choisir</option>
                            {hives.map((hive) => (
                                <option key={hive.id} value={hive.id}>{hive.name}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Poids (kg)
                        <input
                            type="number"
                            step="0.01"
                            value={readingForm.weight_kg}
                            onChange={(event) => setReadingForm({ ...readingForm, weight_kg: event.target.value })}
                        />
                    </label>
                    <label>
                        Temperature (C)
                        <input
                            type="number"
                            step="0.1"
                            value={readingForm.temperature_c}
                            onChange={(event) => setReadingForm({ ...readingForm, temperature_c: event.target.value })}
                        />
                    </label>
                    <label>
                        Humidite (%)
                        <input
                            type="number"
                            step="0.1"
                            value={readingForm.humidity_percent}
                            onChange={(event) => setReadingForm({ ...readingForm, humidity_percent: event.target.value })}
                        />
                    </label>
                    <label>
                        Activite (0-100)
                        <input
                            type="number"
                            value={readingForm.activity_index}
                            onChange={(event) => setReadingForm({ ...readingForm, activity_index: event.target.value })}
                        />
                    </label>
                    <label>
                        Date
                        <input
                            type="datetime-local"
                            value={readingForm.recorded_at}
                            onChange={(event) => setReadingForm({ ...readingForm, recorded_at: event.target.value })}
                            required
                        />
                    </label>
                    <button className="btn btn-primary" type="submit" disabled={busy}>Ajouter releve</button>
                </form>
            </article>

            <article className="panel">
                <h2>Derniers releves</h2>
                <div className="list-shell">
                    {readings.map((reading) => (
                        <div className="item-card" key={reading.id}>
                            <div className="row between">
                                <h3>{reading.hive?.name || `Ruche #${reading.hive_id}`}</h3>
                                <span className="chip">{new Date(reading.recorded_at).toLocaleString()}</span>
                            </div>
                            <p className="muted">
                                poids {reading.weight_kg ?? '-'} kg | temperature {reading.temperature_c ?? '-'} C |
                                humidite {reading.humidity_percent ?? '-'}% | activite {reading.activity_index ?? '-'}
                            </p>
                        </div>
                    ))}
                    {readings.length === 0 && <p className="muted">Aucun releve enregistre.</p>}
                </div>
            </article>
        </section>
    );
}
