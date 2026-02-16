import './bootstrap';
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';

import {
    FALLBACK_CENTER,
    TABS,
    initialActionForm,
    initialApiaryForm,
    initialHiveForm,
    initialReadingForm,
} from './constants';
import { AuthPanel } from './components/auth/AuthPanel';
import { OverviewTab } from './components/tabs/OverviewTab';
import { ApiariesTab } from './components/tabs/ApiariesTab';
import { MapTab } from './components/tabs/MapTab';
import { HivesTab } from './components/tabs/HivesTab';
import { ReadingsTab } from './components/tabs/ReadingsTab';
import { ActionsTab } from './components/tabs/ActionsTab';
import { apiRequest } from './lib/api';
import { setupLeafletDefaultIcon } from './lib/leaflet';
import { toDatetimeValue } from './utils/date';
import { parseNumber } from './utils/number';

setupLeafletDefaultIcon();
const TOKEN_STORAGE_KEY = 'apiarihub_token';
const LEGACY_TOKEN_STORAGE_KEY = 'beewatch_token';

function App() {
    const [token, setToken] = useState(
        () => localStorage.getItem(TOKEN_STORAGE_KEY) || localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY) || ''
    );
    const [user, setUser] = useState(null);
    const [apiaries, setApiaries] = useState([]);
    const [hives, setHives] = useState([]);
    const [readings, setReadings] = useState([]);
    const [actions, setActions] = useState([]);
    const [weatherByHive, setWeatherByHive] = useState({});

    const [authMode, setAuthMode] = useState('login');
    const [authForm, setAuthForm] = useState({
        name: '',
        email: 'demo@apiarihub.local',
        password: 'password123',
        password_confirmation: 'password123',
    });

    const [activeTab, setActiveTab] = useState('overview');
    const [selectedApiaryFilter, setSelectedApiaryFilter] = useState('all');
    const [hiveForm, setHiveForm] = useState(initialHiveForm);
    const [apiaryForm, setApiaryForm] = useState(initialApiaryForm);
    const [readingForm, setReadingForm] = useState(() => ({
        ...initialReadingForm,
        recorded_at: toDatetimeValue(),
    }));
    const [actionForm, setActionForm] = useState(() => ({
        ...initialActionForm,
        performed_at: toDatetimeValue(),
    }));

    const [editingApiaryId, setEditingApiaryId] = useState(null);
    const [editingApiaryForm, setEditingApiaryForm] = useState(initialApiaryForm);
    const [editingHiveId, setEditingHiveId] = useState(null);
    const [editingHiveForm, setEditingHiveForm] = useState(initialHiveForm);

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [userLocation, setUserLocation] = useState(null);

    const stats = useMemo(() => ({
        hiveCount: hives.length,
        readingCount: readings.length,
        actionCount: actions.length,
        apiaryCount: apiaries.length,
    }), [hives, readings, actions, apiaries]);

    const filteredHives = useMemo(() => {
        if (selectedApiaryFilter === 'all') {
            return hives;
        }

        const selectedId = Number(selectedApiaryFilter);

        return hives.filter((hive) => Number(hive.apiary_id) === selectedId);
    }, [hives, selectedApiaryFilter]);

    const hivesWithCoordinates = useMemo(
        () => filteredHives
            .map((hive) => {
                const latitude = Number(hive.latitude);
                const longitude = Number(hive.longitude);

                if (
                    Number.isNaN(latitude)
                    || Number.isNaN(longitude)
                    || latitude < -90
                    || latitude > 90
                    || longitude < -180
                    || longitude > 180
                ) {
                    return null;
                }

                return {
                    ...hive,
                    latitude,
                    longitude,
                };
            })
            .filter(Boolean),
        [filteredHives]
    );

    const mapCenter = useMemo(() => {
        if (userLocation) {
            return userLocation;
        }

        if (hivesWithCoordinates.length > 0) {
            const totals = hivesWithCoordinates.reduce((accumulator, hive) => ({
                latitude: accumulator.latitude + hive.latitude,
                longitude: accumulator.longitude + hive.longitude,
            }), { latitude: 0, longitude: 0 });

            return [
                totals.latitude / hivesWithCoordinates.length,
                totals.longitude / hivesWithCoordinates.length,
            ];
        }

        return FALLBACK_CENTER;
    }, [hivesWithCoordinates, userLocation]);

    const selectedHivePosition = useMemo(() => {
        const latitude = Number(hiveForm.latitude);
        const longitude = Number(hiveForm.longitude);

        if (
            Number.isNaN(latitude)
            || Number.isNaN(longitude)
            || latitude < -90
            || latitude > 90
            || longitude < -180
            || longitude > 180
        ) {
            return null;
        }

        return [latitude, longitude];
    }, [hiveForm.latitude, hiveForm.longitude]);

    useEffect(() => {
        if (!token) {
            setUser(null);
            setApiaries([]);
            setHives([]);
            setReadings([]);
            setActions([]);
            return;
        }

        const load = async () => {
            setBusy(true);
            setError('');

            try {
                const [me, apiaryData, hiveData, readingData, actionData] = await Promise.all([
                    apiRequest('/api/user', { token }),
                    apiRequest('/api/apiaries', { token }),
                    apiRequest('/api/hives', { token }),
                    apiRequest('/api/readings', { token }),
                    apiRequest('/api/actions', { token }),
                ]);

                setUser(me);
                setApiaries(apiaryData);
                setHives(hiveData);
                setReadings(readingData);
                setActions(actionData);

                if (!hiveForm.apiary_id && apiaryData[0]) {
                    setHiveForm((previous) => ({ ...previous, apiary_id: String(apiaryData[0].id) }));
                }
                if (!readingForm.hive_id && hiveData[0]) {
                    setReadingForm((previous) => ({ ...previous, hive_id: String(hiveData[0].id) }));
                }

                if (!actionForm.hive_id && hiveData[0]) {
                    setActionForm((previous) => ({ ...previous, hive_id: String(hiveData[0].id) }));
                }
            } catch (loadError) {
                setError(loadError.message);
                localStorage.removeItem(TOKEN_STORAGE_KEY);
                localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
                setToken('');
            } finally {
                setBusy(false);
            }
        };

        load();
    }, [token]);

    useEffect(() => {
        if (token) {
            localStorage.setItem(TOKEN_STORAGE_KEY, token);
            localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
        } else {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
        }
    }, [token]);

    useEffect(() => {
        if (!token || !navigator.geolocation) {
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation([
                    position.coords.latitude,
                    position.coords.longitude,
                ]);
            },
            () => {
                // Keep fallback center if geolocation is denied/unavailable.
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000,
            }
        );
    }, [token]);

    useEffect(() => {
        if (selectedApiaryFilter === 'all') {
            return;
        }

        const exists = apiaries.some((apiary) => String(apiary.id) === String(selectedApiaryFilter));

        if (!exists) {
            setSelectedApiaryFilter('all');
        }
    }, [apiaries, selectedApiaryFilter]);

    useEffect(() => {
        if (selectedApiaryFilter === 'all') {
            return;
        }

        setHiveForm((previous) => ({
            ...previous,
            apiary_id: String(selectedApiaryFilter),
        }));
    }, [selectedApiaryFilter]);

    const refreshAll = async () => {
        if (!token) {
            return;
        }

        setBusy(true);
        setError('');

        try {
            const [apiaryData, hiveData, readingData, actionData] = await Promise.all([
                apiRequest('/api/apiaries', { token }),
                apiRequest('/api/hives', { token }),
                apiRequest('/api/readings', { token }),
                apiRequest('/api/actions', { token }),
            ]);

            setApiaries(apiaryData);
            setHives(hiveData);
            setReadings(readingData);
            setActions(actionData);
        } catch (refreshError) {
            setError(refreshError.message);
        } finally {
            setBusy(false);
        }
    };

    const submitAuth = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError('');
        setInfo('');

        const path = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
        const body = authMode === 'login'
            ? { email: authForm.email, password: authForm.password }
            : authForm;

        try {
            const payload = await apiRequest(path, { method: 'POST', body });
            setToken(payload.token);
            setInfo(authMode === 'login' ? 'Connexion reussie.' : 'Compte cree et connecte.');
        } catch (authError) {
            setError(authError.message);
        } finally {
            setBusy(false);
        }
    };

    const logout = async () => {
        if (!token) {
            return;
        }

        try {
            await apiRequest('/api/auth/logout', { method: 'POST', token });
        } catch {
            // Ignore logout errors if token is already invalid.
        }

        setToken('');
        setUser(null);
        setInfo('Session fermee.');
    };

    const createApiary = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError('');

        try {
            const created = await apiRequest('/api/apiaries', {
                method: 'POST',
                token,
                body: {
                    ...apiaryForm,
                    latitude: parseNumber(apiaryForm.latitude),
                    longitude: parseNumber(apiaryForm.longitude),
                },
            });

            setApiaryForm(initialApiaryForm);
            setHiveForm((previous) => ({
                ...previous,
                apiary_id: previous.apiary_id || String(created.id),
            }));
            await refreshAll();
        } catch (createError) {
            setError(createError.message);
            setBusy(false);
        }
    };

    const startEditApiary = (apiary) => {
        setEditingApiaryId(apiary.id);
        setEditingApiaryForm({
            name: apiary.name || '',
            latitude: apiary.latitude ?? '',
            longitude: apiary.longitude ?? '',
            notes: apiary.notes || '',
        });
    };

    const updateApiary = async (apiaryId) => {
        setBusy(true);
        setError('');

        try {
            await apiRequest(`/api/apiaries/${apiaryId}`, {
                method: 'PUT',
                token,
                body: {
                    ...editingApiaryForm,
                    latitude: parseNumber(editingApiaryForm.latitude),
                    longitude: parseNumber(editingApiaryForm.longitude),
                },
            });

            setEditingApiaryId(null);
            await refreshAll();
        } catch (updateError) {
            setError(updateError.message);
            setBusy(false);
        }
    };

    const deleteApiary = async (apiaryId) => {
        if (!window.confirm('Supprimer ce rucher ?')) {
            return;
        }

        setBusy(true);
        setError('');

        try {
            await apiRequest(`/api/apiaries/${apiaryId}`, { method: 'DELETE', token });

            if (String(selectedApiaryFilter) === String(apiaryId)) {
                setSelectedApiaryFilter('all');
            }

            setHiveForm((previous) => ({
                ...previous,
                apiary_id: String(previous.apiary_id) === String(apiaryId) ? '' : previous.apiary_id,
            }));

            await refreshAll();
        } catch (deleteError) {
            setError(deleteError.message);
            setBusy(false);
        }
    };

    const createHive = async (event) => {
        event.preventDefault();

        if (apiaries.length === 0) {
            setError('Cree d\'abord un rucher avant d\'ajouter des ruches.');
            return false;
        }

        if (!selectedHivePosition) {
            setError('Selectionne un point sur la carte pour localiser la ruche.');
            return false;
        }

        const apiaryId = Number(hiveForm.apiary_id);

        if (!apiaryId || Number.isNaN(apiaryId)) {
            setError('Selectionne un rucher pour la ruche.');
            return false;
        }

        const hiveCount = Math.max(1, Math.min(25, parseInt(hiveForm.hive_count, 10) || 1));

        setBusy(true);
        setError('');

        try {
            const requests = Array.from({ length: hiveCount }).map((_, index) => apiRequest('/api/hives', {
                method: 'POST',
                token,
                body: {
                    name: hiveCount === 1 ? hiveForm.name : `${hiveForm.name} ${index + 1}`,
                    apiary_id: apiaryId,
                    latitude: parseNumber(hiveForm.latitude),
                    longitude: parseNumber(hiveForm.longitude),
                    status: hiveForm.status,
                    notes: hiveForm.notes,
                },
            }));

            await Promise.all(requests);

            setHiveForm({
                ...initialHiveForm,
                apiary_id: String(apiaryId),
                hive_count: '1',
            });
            setInfo(hiveCount > 1 ? `${hiveCount} ruches creees.` : 'Ruche creee.');
            await refreshAll();
            return true;
        } catch (createError) {
            setError(createError.message);
            setBusy(false);
            return false;
        }
    };

    const selectHiveLocation = (latitude, longitude) => {
        setHiveForm((previous) => ({
            ...previous,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
        }));
    };

    const clearHiveLocation = () => {
        setHiveForm((previous) => ({
            ...previous,
            latitude: '',
            longitude: '',
        }));
    };

    const startEditHive = (hive) => {
        setEditingHiveId(hive.id);
        setEditingHiveForm({
            ...initialHiveForm,
            name: hive.name || '',
            apiary_id: hive.apiary_id ? String(hive.apiary_id) : '',
            latitude: hive.latitude ?? '',
            longitude: hive.longitude ?? '',
            status: hive.status || 'active',
            notes: hive.notes || '',
        });
    };

    const updateHive = async (hiveId) => {
        const apiaryId = Number(editingHiveForm.apiary_id);

        if (!apiaryId || Number.isNaN(apiaryId)) {
            setError('Selectionne un rucher valide avant de sauver.');
            return;
        }

        setBusy(true);
        setError('');

        try {
            await apiRequest(`/api/hives/${hiveId}`, {
                method: 'PUT',
                token,
                body: {
                    name: editingHiveForm.name,
                    apiary_id: apiaryId,
                    latitude: parseNumber(editingHiveForm.latitude),
                    longitude: parseNumber(editingHiveForm.longitude),
                    status: editingHiveForm.status,
                    notes: editingHiveForm.notes,
                },
            });

            setEditingHiveId(null);
            await refreshAll();
        } catch (updateError) {
            setError(updateError.message);
            setBusy(false);
        }
    };

    const deleteHive = async (hiveId) => {
        if (!window.confirm('Supprimer cette ruche ?')) {
            return;
        }

        setBusy(true);
        setError('');

        try {
            await apiRequest(`/api/hives/${hiveId}`, { method: 'DELETE', token });
            setWeatherByHive((previous) => {
                const next = { ...previous };
                delete next[hiveId];
                return next;
            });
            await refreshAll();
        } catch (deleteError) {
            setError(deleteError.message);
            setBusy(false);
        }
    };

    const fetchWeather = async (hiveId) => {
        setBusy(true);
        setError('');

        try {
            const payload = await apiRequest(`/api/hives/${hiveId}/weather`, { token });
            setWeatherByHive((previous) => ({
                ...previous,
                [hiveId]: payload.weather,
            }));
        } catch (weatherError) {
            setError(weatherError.message);
        } finally {
            setBusy(false);
        }
    };

    const createReading = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError('');

        try {
            await apiRequest('/api/readings', {
                method: 'POST',
                token,
                body: {
                    ...readingForm,
                    hive_id: Number(readingForm.hive_id),
                    weight_kg: parseNumber(readingForm.weight_kg),
                    temperature_c: parseNumber(readingForm.temperature_c),
                    humidity_percent: parseNumber(readingForm.humidity_percent),
                    activity_index: parseNumber(readingForm.activity_index),
                    recorded_at: new Date(readingForm.recorded_at).toISOString(),
                },
            });

            setReadingForm((previous) => ({
                ...initialReadingForm,
                hive_id: previous.hive_id,
                recorded_at: toDatetimeValue(),
            }));

            await refreshAll();
        } catch (createError) {
            setError(createError.message);
            setBusy(false);
        }
    };

    const createAction = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError('');

        try {
            await apiRequest('/api/actions', {
                method: 'POST',
                token,
                body: {
                    ...actionForm,
                    hive_id: Number(actionForm.hive_id),
                    performed_at: new Date(actionForm.performed_at).toISOString(),
                },
            });

            setActionForm((previous) => ({
                ...initialActionForm,
                hive_id: previous.hive_id,
                performed_at: toDatetimeValue(),
            }));

            await refreshAll();
        } catch (createError) {
            setError(createError.message);
            setBusy(false);
        }
    };

    const renderContent = () => {
        if (activeTab === 'overview') {
            return <OverviewTab stats={stats} readings={readings} />;
        }

        if (activeTab === 'apiaries') {
            return (
                <ApiariesTab
                    apiaries={apiaries}
                    apiaryForm={apiaryForm}
                    setApiaryForm={setApiaryForm}
                    createApiary={createApiary}
                    editingApiaryId={editingApiaryId}
                    editingApiaryForm={editingApiaryForm}
                    setEditingApiaryForm={setEditingApiaryForm}
                    startEditApiary={startEditApiary}
                    updateApiary={updateApiary}
                    setEditingApiaryId={setEditingApiaryId}
                    deleteApiary={deleteApiary}
                    busy={busy}
                />
            );
        }

        if (activeTab === 'map') {
            return (
                <MapTab
                    hivesWithCoordinates={hivesWithCoordinates}
                    mapCenter={mapCenter}
                    userLocation={userLocation}
                    apiaries={apiaries}
                    selectedApiaryFilter={selectedApiaryFilter}
                    setSelectedApiaryFilter={setSelectedApiaryFilter}
                />
            );
        }

        if (activeTab === 'hives') {
            return (
                <HivesTab
                    hiveForm={hiveForm}
                    setHiveForm={setHiveForm}
                    createHive={createHive}
                    busy={busy}
                    hivesWithCoordinates={hivesWithCoordinates}
                    mapCenter={mapCenter}
                    selectedHivePosition={selectedHivePosition}
                    userLocation={userLocation}
                    apiaries={apiaries}
                    selectedApiaryFilter={selectedApiaryFilter}
                    setSelectedApiaryFilter={setSelectedApiaryFilter}
                    selectHiveLocation={selectHiveLocation}
                    clearHiveLocation={clearHiveLocation}
                    setError={setError}
                    hives={filteredHives}
                    weatherByHive={weatherByHive}
                    editingHiveId={editingHiveId}
                    editingHiveForm={editingHiveForm}
                    setEditingHiveForm={setEditingHiveForm}
                    startEditHive={startEditHive}
                    updateHive={updateHive}
                    setEditingHiveId={setEditingHiveId}
                    fetchWeather={fetchWeather}
                    deleteHive={deleteHive}
                />
            );
        }

        if (activeTab === 'readings') {
            return (
                <ReadingsTab
                    createReading={createReading}
                    readingForm={readingForm}
                    setReadingForm={setReadingForm}
                    hives={hives}
                    readings={readings}
                    busy={busy}
                />
            );
        }

        return (
            <ActionsTab
                createAction={createAction}
                actionForm={actionForm}
                setActionForm={setActionForm}
                hives={hives}
                actions={actions}
                busy={busy}
            />
        );
    };

    return (
        <main className={token ? 'page-wrap app-authenticated' : 'page-wrap'}>
            {error && <div className="flash error">{error}</div>}
            {info && <div className="flash info">{info}</div>}

            {!token ? (
                <AuthPanel
                    authMode={authMode}
                    setAuthMode={setAuthMode}
                    authForm={authForm}
                    setAuthForm={setAuthForm}
                    submitAuth={submitAuth}
                    busy={busy}
                />
            ) : (
                <div className="dashboard-shell">
                    <aside className="sidebar panel">
                        <div className="brand-block">
                            <p className="kicker">Apiarihub</p>
                            <h2>{user?.name ?? 'apiculteur'}</h2>
                        </div>
                        <nav className="tab-nav">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    className={activeTab === tab.id ? 'tab-link active' : 'tab-link'}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                        <div className="sidebar-actions">
                            <button type="button" className="btn" onClick={refreshAll} disabled={busy}>Rafraichir</button>
                            <button type="button" className="btn btn-danger" onClick={logout}>Logout</button>
                        </div>
                    </aside>

                    <section className="workspace">
                        <header className="workspace-header panel gradient-panel">
                            <div>
                                <p className="kicker">Apiarihub Dashboard</p>
                                <h1>{TABS.find((tab) => tab.id === activeTab)?.label}</h1>
                                <p>Gestion multi-ruchers avec filtrage des ruches et creation geolocalisee.</p>
                            </div>
                        </header>
                        {renderContent()}
                    </section>
                </div>
            )}
        </main>
    );
}

const rootElement = document.getElementById('app');

if (rootElement) {
    createRoot(rootElement).render(<App />);
}
