import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { HIVE_STATUSES } from '../../constants';

function CreateHiveLocationEvents({ onSelect }) {
    useMapEvents({
        click: (event) => {
            onSelect(event.latlng.lat, event.latlng.lng);
        },
    });

    return null;
}

const STEPS = [
    { id: 1, label: 'Infos' },
    { id: 2, label: 'Localisation' },
    { id: 3, label: 'Validation' },
];

export function HiveCreationFunnel({
    hiveForm,
    setHiveForm,
    createHive,
    busy,
    hivesWithCoordinates,
    mapCenter,
    selectedHivePosition,
    userLocation,
    apiaries,
    selectHiveLocation,
    clearHiveLocation,
    setError,
    selectedApiaryFilter,
    setSelectedApiaryFilter,
}) {
    const [step, setStep] = useState(1);

    useEffect(() => {
        if (step !== 2 || selectedHivePosition || !userLocation) {
            return;
        }

        selectHiveLocation(userLocation[0], userLocation[1]);
    }, [step, selectedHivePosition, userLocation, selectHiveLocation]);

    const selectedPointLabel = useMemo(() => {
        if (!selectedHivePosition) {
            return 'Aucun point selectionne.';
        }

        return `Point selectionne: lat ${selectedHivePosition[0].toFixed(6)} / lon ${selectedHivePosition[1].toFixed(6)}`;
    }, [selectedHivePosition]);

    const canGoNext = () => {
        if (step === 1) {
            return hiveForm.name.trim().length > 0 && hiveForm.apiary_id !== '';
        }

        if (step === 2) {
            return Boolean(selectedHivePosition);
        }

        return true;
    };

    const goNext = () => {
        if (step === 1 && !hiveForm.name.trim()) {
            setError('Renseigne le nom de la ruche pour continuer.');
            return;
        }

        if (step === 1 && !hiveForm.apiary_id) {
            setError('Selectionne un rucher pour continuer.');
            return;
        }

        if (step === 2 && !selectedHivePosition) {
            setError('Selectionne un point sur la carte pour continuer.');
            return;
        }

        setError('');
        setStep((previous) => Math.min(previous + 1, 3));
    };

    const goBack = () => {
        setStep((previous) => Math.max(previous - 1, 1));
    };

    const submitHive = async (event) => {
        if (step < 3) {
            event.preventDefault();
            goNext();
            return;
        }

        const created = await createHive(event);

        if (created) {
            setStep(1);
        }
    };

    return (
        <article className="panel">
            <h2>Creation de ruche</h2>
            <div className="wizard-steps">
                {STEPS.map((item) => (
                    <div
                        key={item.id}
                        className={item.id === step ? 'wizard-step active' : 'wizard-step'}
                    >
                        <span>{item.id}</span>
                        <p>{item.label}</p>
                    </div>
                ))}
            </div>

            <form className="form-grid" onSubmit={submitHive}>
                {apiaries.length === 0 && (
                    <p className="muted small full">Aucun rucher disponible. Cree un rucher dans l'onglet Ruchers avant d'ajouter des ruches.</p>
                )}

                {step === 1 && (
                    <>
                        <label className="full inline-filter">
                            Filtre de gestion
                            <select value={selectedApiaryFilter} onChange={(event) => setSelectedApiaryFilter(event.target.value)}>
                                <option value="all">Tous les ruchers</option>
                                {apiaries.map((apiary) => (
                                    <option key={apiary.id} value={String(apiary.id)}>{apiary.name}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Nom
                            <input
                                value={hiveForm.name}
                                onChange={(event) => setHiveForm({ ...hiveForm, name: event.target.value })}
                                required
                            />
                        </label>
                        <label>
                            Rucher
                            <select
                                value={hiveForm.apiary_id}
                                onChange={(event) => setHiveForm({ ...hiveForm, apiary_id: event.target.value })}
                                required
                            >
                                <option value="">Choisir</option>
                                {apiaries.map((apiary) => (
                                    <option key={apiary.id} value={apiary.id}>{apiary.name}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Nombre de ruches
                            <input
                                type="number"
                                min="1"
                                max="25"
                                value={hiveForm.hive_count}
                                onChange={(event) => setHiveForm({ ...hiveForm, hive_count: event.target.value })}
                            />
                        </label>
                        <label>
                            Statut
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
                                rows={4}
                                value={hiveForm.notes}
                                onChange={(event) => setHiveForm({ ...hiveForm, notes: event.target.value })}
                            />
                        </label>
                    </>
                )}

                {step === 2 && (
                    <div className="full map-picker-field">
                        <div className="row between">
                            <div>
                                <p className="field-title">Position de la ruche</p>
                                <p className="muted small">Clique sur la carte pour poser le point.</p>
                            </div>
                            <div className="row actions">
                                {userLocation && (
                                    <button
                                        type="button"
                                        className="btn btn-soft"
                                        onClick={() => selectHiveLocation(userLocation[0], userLocation[1])}
                                    >
                                        Ma position
                                    </button>
                                )}
                                <button type="button" className="btn btn-soft" onClick={clearHiveLocation}>Effacer</button>
                            </div>
                        </div>
                        <MapContainer
                            key={`create-hive-map-${mapCenter[0]}-${mapCenter[1]}-${hivesWithCoordinates.length}`}
                            center={selectedHivePosition || mapCenter}
                            zoom={selectedHivePosition ? 9 : 7}
                            scrollWheelZoom
                            className="map-picker-canvas"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {hivesWithCoordinates.map((hive) => (
                                <Marker key={`create-hive-map-existing-${hive.id}`} position={[hive.latitude, hive.longitude]}>
                                    <Popup>
                                        <strong>{hive.name}</strong>
                                        <br />
                                        Ruche existante
                                    </Popup>
                                </Marker>
                            ))}
                            {selectedHivePosition && (
                                <Marker position={selectedHivePosition}>
                                    <Popup>Nouvelle ruche</Popup>
                                </Marker>
                            )}
                            <CreateHiveLocationEvents onSelect={selectHiveLocation} />
                        </MapContainer>
                        <p className="muted small">{selectedPointLabel}</p>
                    </div>
                )}

                {step === 3 && (
                    <div className="full wizard-review">
                        <p className="muted small">Verifie les informations avant creation.</p>
                        <div className="item-card">
                            <p><strong>Nom:</strong> {hiveForm.name || '-'}</p>
                            <p><strong>Rucher:</strong> {apiaries.find((apiary) => String(apiary.id) === String(hiveForm.apiary_id))?.name || '-'}</p>
                            <p><strong>Nombre:</strong> {hiveForm.hive_count || '1'}</p>
                            <p><strong>Statut:</strong> {hiveForm.status}</p>
                            <p><strong>Position:</strong> {selectedPointLabel}</p>
                            <p><strong>Notes:</strong> {hiveForm.notes || '-'}</p>
                        </div>
                    </div>
                )}

                <div className="row actions full wizard-actions">
                    {step > 1 && (
                        <button type="button" className="btn" onClick={goBack}>
                            Retour
                        </button>
                    )}
                    {step < 3 ? (
                        <button type="button" className="btn btn-primary" onClick={goNext} disabled={busy || !canGoNext()}>
                            Continuer
                        </button>
                    ) : (
                        <button className="btn btn-primary" type="submit" disabled={busy}>
                            Creer la ruche
                        </button>
                    )}
                </div>
            </form>
        </article>
    );
}
