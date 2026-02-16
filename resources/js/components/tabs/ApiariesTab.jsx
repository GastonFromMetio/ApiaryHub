import { useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';

function ApiaryLocationEvents({ onSelect }) {
    useMapEvents({
        click: (event) => {
            onSelect(event.latlng.lat, event.latlng.lng);
        },
    });

    return null;
}

function toPosition(latitude, longitude) {
    const lat = Number(latitude);
    const lon = Number(longitude);

    if (
        Number.isNaN(lat)
        || Number.isNaN(lon)
        || lat < -90
        || lat > 90
        || lon < -180
        || lon > 180
    ) {
        return null;
    }

    return [lat, lon];
}

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
    userLocation,
    mapCenter,
    selectApiaryLocation,
    clearApiaryLocation,
    selectEditingApiaryLocation,
    clearEditingApiaryLocation,
}) {
    const selectedApiaryPosition = useMemo(
        () => toPosition(apiaryForm.latitude, apiaryForm.longitude),
        [apiaryForm.latitude, apiaryForm.longitude]
    );
    const editingApiaryPosition = useMemo(
        () => toPosition(editingApiaryForm.latitude, editingApiaryForm.longitude),
        [editingApiaryForm.latitude, editingApiaryForm.longitude]
    );
    const createMapCenter = userLocation || selectedApiaryPosition || mapCenter;
    const editMapCenter = editingApiaryPosition || userLocation || mapCenter;

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
                        Latitude
                        <input
                            type="number"
                            step="0.000001"
                            value={apiaryForm.latitude}
                            onChange={(event) => setApiaryForm({ ...apiaryForm, latitude: event.target.value })}
                        />
                    </label>
                    <label>
                        Longitude
                        <input
                            type="number"
                            step="0.000001"
                            value={apiaryForm.longitude}
                            onChange={(event) => setApiaryForm({ ...apiaryForm, longitude: event.target.value })}
                        />
                    </label>
                    <div className="full map-picker-field">
                        <div className="row between">
                            <div>
                                <p className="field-title">Position du rucher</p>
                                <p className="muted small">Clique sur la carte pour placer le rucher.</p>
                            </div>
                            <div className="row actions">
                                {userLocation && (
                                    <button
                                        type="button"
                                        className="btn btn-soft"
                                        onClick={() => selectApiaryLocation(userLocation[0], userLocation[1])}
                                    >
                                        Utiliser ma position
                                    </button>
                                )}
                                <button type="button" className="btn btn-soft" onClick={clearApiaryLocation}>
                                    Effacer
                                </button>
                            </div>
                        </div>
                        <MapContainer
                            key={`create-apiary-map-${createMapCenter[0]}-${createMapCenter[1]}-${apiaries.length}`}
                            center={createMapCenter}
                            zoom={selectedApiaryPosition ? 10 : 7}
                            scrollWheelZoom
                            className="map-picker-canvas"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {apiaries
                                .filter((apiary) => toPosition(apiary.latitude, apiary.longitude))
                                .map((apiary) => (
                                    <Marker key={`apiary-point-${apiary.id}`} position={[Number(apiary.latitude), Number(apiary.longitude)]}>
                                        <Popup>{apiary.name}</Popup>
                                    </Marker>
                                ))}
                            {selectedApiaryPosition && (
                                <Marker position={selectedApiaryPosition}>
                                    <Popup>Nouveau rucher</Popup>
                                </Marker>
                            )}
                            <ApiaryLocationEvents onSelect={selectApiaryLocation} />
                        </MapContainer>
                    </div>
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
                                        <div className="full map-picker-field">
                                            <div className="row between">
                                                <p className="field-title">Ajuster la localisation</p>
                                                <div className="row actions">
                                                    {userLocation && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-soft"
                                                            onClick={() => selectEditingApiaryLocation(userLocation[0], userLocation[1])}
                                                        >
                                                            Utiliser ma position
                                                        </button>
                                                    )}
                                                    <button type="button" className="btn btn-soft" onClick={clearEditingApiaryLocation}>
                                                        Effacer
                                                    </button>
                                                </div>
                                            </div>
                                            <MapContainer
                                                key={`edit-apiary-map-${editMapCenter[0]}-${editMapCenter[1]}-${apiary.id}`}
                                                center={editMapCenter}
                                                zoom={editingApiaryPosition ? 10 : 7}
                                                scrollWheelZoom
                                                className="map-picker-canvas"
                                            >
                                                <TileLayer
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                {editingApiaryPosition && (
                                                    <Marker position={editingApiaryPosition}>
                                                        <Popup>{editingApiaryForm.name || 'Rucher en edition'}</Popup>
                                                    </Marker>
                                                )}
                                                <ApiaryLocationEvents onSelect={selectEditingApiaryLocation} />
                                            </MapContainer>
                                        </div>
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
                                            <button type="button" className="btn" onClick={() => startEditApiary(apiary)}>Editer</button>
                                            <button type="button" className="btn btn-danger" onClick={() => deleteApiary(apiary.id)} disabled={busy}>Supprimer</button>
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
