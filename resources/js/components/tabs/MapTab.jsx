import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

export function MapTab({
    hivesWithCoordinates,
    mapCenter,
    userLocation,
    apiaries,
    selectedApiaryFilter,
    setSelectedApiaryFilter,
}) {
    const mapZoom = userLocation ? 10 : 7;

    return (
        <section className="panel map-panel">
            <div className="row between">
                <div>
                    <h2>Carte des ruches</h2>
                    <p className="muted small">{hivesWithCoordinates.length} ruche(s) geolocalisee(s)</p>
                </div>
                <label className="inline-filter">
                    Filtre rucher
                    <select value={selectedApiaryFilter} onChange={(event) => setSelectedApiaryFilter(event.target.value)}>
                        <option value="all">Tous les ruchers</option>
                        {apiaries.map((apiary) => (
                            <option key={apiary.id} value={String(apiary.id)}>{apiary.name}</option>
                        ))}
                    </select>
                </label>
            </div>
            {hivesWithCoordinates.length === 0 && (
                <p className="muted">Ajoute une ruche et place-la sur la carte dans l'onglet Ruches.</p>
            )}
            <MapContainer
                key={`${mapCenter[0]}-${mapCenter[1]}-${hivesWithCoordinates.length}-${userLocation ? 'user' : 'fallback'}`}
                center={mapCenter}
                zoom={mapZoom}
                scrollWheelZoom
                className="map-canvas"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {userLocation && (
                    <Marker position={userLocation}>
                        <Popup>Votre position</Popup>
                    </Marker>
                )}
                {hivesWithCoordinates.map((hive) => (
                    <Marker key={hive.id} position={[hive.latitude, hive.longitude]}>
                        <Popup>
                            <strong>{hive.name}</strong>
                            <br />
                            {hive.apiary_entity?.name || hive.apiary || 'Rucher non precise'}
                            <br />
                            Statut: {hive.status}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </section>
    );
}
