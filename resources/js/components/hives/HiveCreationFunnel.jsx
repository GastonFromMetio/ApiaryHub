import { useMemo } from 'react';
import { HIVE_STATUSES } from '../../constants';

export function HiveCreationFunnel({
    hiveForm,
    setHiveForm,
    createHive,
    busy,
    apiaries,
    setError,
    handleHiveApiaryChange,
}) {
    const selectedApiary = useMemo(
        () => apiaries.find((apiary) => String(apiary.id) === String(hiveForm.apiary_id)) || null,
        [apiaries, hiveForm.apiary_id]
    );

    const submitHive = async (event) => {
        event.preventDefault();

        if (!hiveForm.name.trim()) {
            setError('Renseigne le nom de la ruche.');
            return;
        }

        if (!hiveForm.apiary_id) {
            setError('Selectionne un rucher.');
            return;
        }

        setError('');
        await createHive(event);
    };

    return (
        <article className="panel hive-create-card">
            <div className="hive-create-head">
                <h2>Nouvelle ruche</h2>
                <p className="muted small">Creation unitaire: 1 ruche = 1 rucher.</p>
            </div>

            {apiaries.length === 0 ? (
                <p className="muted small">Aucun rucher disponible. Cree un rucher d&apos;abord.</p>
            ) : (
                <form className="form-grid hive-form" onSubmit={submitHive}>
                    <label>
                        Nom de la ruche
                        <input
                            value={hiveForm.name}
                            onChange={(event) => setHiveForm({ ...hiveForm, name: event.target.value })}
                            placeholder="Ex: Ruche Violette"
                            required
                        />
                    </label>
                    <label>
                        Rucher
                        <select
                            value={hiveForm.apiary_id}
                            onChange={(event) => handleHiveApiaryChange(event.target.value)}
                            required
                        >
                            <option value="">Choisir un rucher</option>
                            {apiaries.map((apiary) => (
                                <option key={apiary.id} value={apiary.id}>{apiary.name}</option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Statut initial
                        <select
                            value={hiveForm.status}
                            onChange={(event) => setHiveForm({ ...hiveForm, status: event.target.value })}
                        >
                            {HIVE_STATUSES.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </label>
                    <label className="full">
                        Notes
                        <textarea
                            rows={3}
                            value={hiveForm.notes}
                            onChange={(event) => setHiveForm({ ...hiveForm, notes: event.target.value })}
                            placeholder="Informations utiles pour le suivi."
                        />
                    </label>
                    {selectedApiary && (
                        <div className="full hive-create-summary">
                            <p><strong>Rucher cible:</strong> {selectedApiary.name}</p>
                            <p className="muted small">
                                Position: lat {selectedApiary.latitude ?? '-'} / lon {selectedApiary.longitude ?? '-'}
                            </p>
                        </div>
                    )}
                    <div className="row actions full">
                        <button className="btn btn-primary" type="submit" disabled={busy}>
                            Ajouter la ruche
                        </button>
                    </div>
                </form>
            )}
        </article>
    );
}
