import { useMemo } from "react";
import { LocateFixed, MapPinned, Pencil, Trash2 } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, FieldBlock, SectionCard, StatusBadge } from "@/components/app/app-ui";
import { formatCountLabel } from "@/utils/text";

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
        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <SectionCard
                title="Ajouter un rucher"
                description="Nom, position, notes."
                action={<StatusBadge className="bg-primary/10 text-primary">Carte interactive</StatusBadge>}
            >
                <form className="grid gap-5" onSubmit={createApiary}>
                    <div className="grid gap-4 md:grid-cols-3">
                        <FieldBlock label="Nom du rucher" className="md:col-span-3">
                            <Input
                                value={apiaryForm.name}
                                onChange={(event) => setApiaryForm({ ...apiaryForm, name: event.target.value })}
                                placeholder="Ex: Rucher des peupliers"
                                className="h-11 rounded-xl"
                                required
                            />
                        </FieldBlock>
                        <FieldBlock label="Latitude">
                            <Input
                                type="number"
                                step="0.000001"
                                inputMode="decimal"
                                value={apiaryForm.latitude}
                                onChange={(event) => setApiaryForm({ ...apiaryForm, latitude: event.target.value })}
                                className="h-11 rounded-xl"
                            />
                        </FieldBlock>
                        <FieldBlock label="Longitude">
                            <Input
                                type="number"
                                step="0.000001"
                                inputMode="decimal"
                                value={apiaryForm.longitude}
                                onChange={(event) => setApiaryForm({ ...apiaryForm, longitude: event.target.value })}
                                className="h-11 rounded-xl"
                            />
                        </FieldBlock>
                        <div className="hidden md:block" />
                    </div>

                    <div className="rounded-[24px] border border-border/70 bg-secondary/35 p-4">
                        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="text-sm font-medium text-foreground">Position du rucher</p>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    Clique sur la carte pour placer le rucher avec precision.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {userLocation ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl"
                                        onClick={() => selectApiaryLocation(userLocation[0], userLocation[1])}
                                    >
                                        <LocateFixed className="size-4" />
                                        Utiliser ma position
                                    </Button>
                                ) : null}
                                <Button type="button" variant="ghost" size="sm" className="rounded-xl" onClick={clearApiaryLocation}>
                                    Effacer
                                </Button>
                            </div>
                        </div>

                        <MapContainer
                            key={`create-apiary-map-${createMapCenter[0]}-${createMapCenter[1]}-${apiaries.length}`}
                            center={createMapCenter}
                            zoom={selectedApiaryPosition ? 10 : 7}
                            scrollWheelZoom
                            className="apiary-map"
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
                            {selectedApiaryPosition ? (
                                <Marker position={selectedApiaryPosition}>
                                    <Popup>Nouveau rucher</Popup>
                                </Marker>
                            ) : null}
                            <ApiaryLocationEvents onSelect={selectApiaryLocation} />
                        </MapContainer>
                    </div>

                    <FieldBlock label="Notes de terrain">
                        <Textarea
                            rows={4}
                            value={apiaryForm.notes}
                            onChange={(event) => setApiaryForm({ ...apiaryForm, notes: event.target.value })}
                            placeholder="Acces, environnement, contraintes ou observations utiles."
                            className="min-h-28 rounded-2xl"
                        />
                    </FieldBlock>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button className="rounded-xl" type="submit" disabled={busy}>
                            <MapPinned className="size-4" />
                            Enregistrer le rucher
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            Les coordonnees sont reutilisees ensuite pour simplifier la creation des ruches.
                        </p>
                    </div>
                </form>
            </SectionCard>

            <SectionCard
                title="Ruchers en place"
                description="Liste et edition des sites."
                action={<StatusBadge variant="secondary">{formatCountLabel(apiaries.length, "site")}</StatusBadge>}
                contentClassName="grid gap-4"
            >
                {apiaries.length === 0 ? (
                    <EmptyState
                        title="Aucun rucher enregistre"
                        description="Cree ton premier site sur la carte."
                    />
                ) : (
                    apiaries.map((apiary) => {
                        const isEditing = editingApiaryId === apiary.id;

                        return (
                            <div
                                key={apiary.id}
                                className="radius-panel border border-border/70 bg-background/80 p-5 shadow-[0_16px_40px_-32px_rgba(40,31,21,0.35)]"
                            >
                                {isEditing ? (
                                    <div className="grid gap-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <FieldBlock label="Nom">
                                                <Input
                                                    value={editingApiaryForm.name}
                                                    onChange={(event) => setEditingApiaryForm({ ...editingApiaryForm, name: event.target.value })}
                                                    className="h-11 rounded-xl"
                                                />
                                            </FieldBlock>
                                            <div className="grid grid-cols-2 gap-4">
                                                <FieldBlock label="Latitude">
                                                    <Input
                                                        type="number"
                                                        step="0.000001"
                                                        inputMode="decimal"
                                                        value={editingApiaryForm.latitude}
                                                        onChange={(event) => setEditingApiaryForm({ ...editingApiaryForm, latitude: event.target.value })}
                                                        className="h-11 rounded-xl"
                                                    />
                                                </FieldBlock>
                                                <FieldBlock label="Longitude">
                                                    <Input
                                                        type="number"
                                                        step="0.000001"
                                                        inputMode="decimal"
                                                        value={editingApiaryForm.longitude}
                                                        onChange={(event) => setEditingApiaryForm({ ...editingApiaryForm, longitude: event.target.value })}
                                                        className="h-11 rounded-xl"
                                                    />
                                                </FieldBlock>
                                            </div>
                                        </div>

                                        <div className="rounded-[24px] border border-border/70 bg-secondary/35 p-4">
                                            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                <p className="text-sm font-medium text-foreground">Ajuster la localisation</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {userLocation ? (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            className="rounded-xl"
                                                            onClick={() => selectEditingApiaryLocation(userLocation[0], userLocation[1])}
                                                        >
                                                            <LocateFixed className="size-4" />
                                                            Utiliser ma position
                                                        </Button>
                                                    ) : null}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="rounded-xl"
                                                        onClick={clearEditingApiaryLocation}
                                                    >
                                                        Effacer
                                                    </Button>
                                                </div>
                                            </div>

                                            <MapContainer
                                                key={`edit-apiary-map-${editMapCenter[0]}-${editMapCenter[1]}-${apiary.id}`}
                                                center={editMapCenter}
                                                zoom={editingApiaryPosition ? 10 : 7}
                                                scrollWheelZoom
                                                className="apiary-map apiary-map-compact"
                                            >
                                                <TileLayer
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                {editingApiaryPosition ? (
                                                    <Marker position={editingApiaryPosition}>
                                                        <Popup>{editingApiaryForm.name || "Rucher en edition"}</Popup>
                                                    </Marker>
                                                ) : null}
                                                <ApiaryLocationEvents onSelect={selectEditingApiaryLocation} />
                                            </MapContainer>
                                        </div>

                                        <FieldBlock label="Notes">
                                            <Textarea
                                                rows={3}
                                                value={editingApiaryForm.notes}
                                                onChange={(event) => setEditingApiaryForm({ ...editingApiaryForm, notes: event.target.value })}
                                                className="rounded-2xl"
                                            />
                                        </FieldBlock>

                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            <Button className="rounded-xl" type="button" onClick={() => updateApiary(apiary.id)} disabled={busy}>
                                                Sauver
                                            </Button>
                                            <Button className="rounded-xl" type="button" variant="outline" onClick={() => setEditingApiaryId(null)}>
                                                Annuler
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="font-display text-2xl text-foreground">{apiary.name}</h3>
                                                    <StatusBadge variant="secondary">{formatCountLabel(apiary.hives_count ?? 0, "ruche")}</StatusBadge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    Lat {apiary.latitude ?? "-"} / Lon {apiary.longitude ?? "-"}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => startEditApiary(apiary)}>
                                                    <Pencil className="size-4" />
                                                    Modifier
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="rounded-xl"
                                                    onClick={() => deleteApiary(apiary.id)}
                                                    disabled={busy}
                                                >
                                                    <Trash2 className="size-4" />
                                                    Supprimer
                                                </Button>
                                            </div>
                                        </div>

                                        {apiary.notes ? (
                                            <p className="text-sm leading-7 text-muted-foreground">{apiary.notes}</p>
                                        ) : (
                                            <p className="text-sm italic text-muted-foreground">Aucune note associee a ce rucher.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </SectionCard>
        </section>
    );
}
