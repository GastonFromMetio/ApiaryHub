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
import { HivesTab } from './components/tabs/HivesTab';
import { ReadingsTab } from './components/tabs/ReadingsTab';
import { ActionsTab } from './components/tabs/ActionsTab';
import { AccountTab } from './components/tabs/AccountTab';
import { QuickActionsTab } from './components/tabs/QuickActionsTab';
import { apiRequest } from './lib/api';
import { setupLeafletDefaultIcon } from './lib/leaflet';
import { toDatetimeValue } from './utils/date';
import { parseNumber } from './utils/number';

setupLeafletDefaultIcon();
const TOKEN_STORAGE_KEY = 'apiaryhub_token';
const LEGACY_TOKEN_STORAGE_KEY = 'beewatch_token';
const SESSION_EXPIRED_CODE = 'SESSION_EXPIRED';
const MOBILE_ACTIONS_TAB = { id: 'mobile-actions', label: 'Actions rapides' };

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
        email: 'demo@apiaryhub.local',
        password: 'password123',
        password_confirmation: 'password123',
    });

    const [activeTab, setActiveTab] = useState('overview');
    const [selectedApiaryFilter, setSelectedApiaryFilter] = useState('all');
    const [selectedReadingsApiaryFilter, setSelectedReadingsApiaryFilter] = useState('all');
    const [selectedActionsApiaryFilter, setSelectedActionsApiaryFilter] = useState('all');
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobileViewport, setIsMobileViewport] = useState(
        () => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 1023px)').matches : false)
    );
    const [userLocation, setUserLocation] = useState(null);

    const stats = useMemo(() => ({
        hiveCount: hives.length,
        readingCount: readings.length,
        actionCount: actions.length,
        apiaryCount: apiaries.length,
    }), [hives, readings, actions, apiaries]);

    const mobileRecentActivity = useMemo(() => {
        const readingItems = readings.map((reading) => ({
            id: `reading-${reading.id}`,
            kind: 'Releve',
            title: reading.hive?.name || `Ruche #${reading.hive_id}`,
            timestamp: reading.recorded_at,
            subtitle: `Poids ${reading.weight_kg ?? '-'} kg`,
        }));

        const actionItems = actions.map((action) => ({
            id: `action-${action.id}`,
            kind: 'Intervention',
            title: action.type || 'Intervention',
            timestamp: action.performed_at,
            subtitle: action.hive?.name || `Ruche #${action.hive_id}`,
        }));

        return [...readingItems, ...actionItems]
            .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime())
            .slice(0, 4);
    }, [readings, actions]);

    const filteredHives = useMemo(() => {
        if (selectedApiaryFilter === 'all') {
            return hives;
        }

        const selectedId = Number(selectedApiaryFilter);

        return hives.filter((hive) => Number(hive.apiary_id) === selectedId);
    }, [hives, selectedApiaryFilter]);

    const readingsHives = useMemo(() => {
        if (selectedReadingsApiaryFilter === 'all') {
            return hives;
        }

        const selectedId = Number(selectedReadingsApiaryFilter);

        return hives.filter((hive) => Number(hive.apiary_id) === selectedId);
    }, [hives, selectedReadingsApiaryFilter]);

    const actionsHives = useMemo(() => {
        if (selectedActionsApiaryFilter === 'all') {
            return hives;
        }

        const selectedId = Number(selectedActionsApiaryFilter);

        return hives.filter((hive) => Number(hive.apiary_id) === selectedId);
    }, [hives, selectedActionsApiaryFilter]);

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

    const apiariesWithCoordinates = useMemo(
        () => apiaries
            .map((apiary) => {
                const latitude = Number(apiary.latitude);
                const longitude = Number(apiary.longitude);

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
                    ...apiary,
                    latitude,
                    longitude,
                };
            })
            .filter(Boolean),
        [apiaries]
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

        if (apiariesWithCoordinates.length > 0) {
            const totals = apiariesWithCoordinates.reduce((accumulator, apiary) => ({
                latitude: accumulator.latitude + apiary.latitude,
                longitude: accumulator.longitude + apiary.longitude,
            }), { latitude: 0, longitude: 0 });

            return [
                totals.latitude / apiariesWithCoordinates.length,
                totals.longitude / apiariesWithCoordinates.length,
            ];
        }

        return FALLBACK_CENTER;
    }, [hivesWithCoordinates, apiariesWithCoordinates, userLocation]);

    const withApiaryCoordinates = (form, apiaryId) => {
        return {
            ...form,
            apiary_id: String(apiaryId),
        };
    };

    const buildApiaryQuery = (apiaryFilter) => {
        if (apiaryFilter === 'all') {
            return '';
        }

        const apiaryId = Number(apiaryFilter);

        if (!apiaryId || Number.isNaN(apiaryId)) {
            return '';
        }

        return `?apiary_id=${apiaryId}`;
    };

    const syncHiveSelection = (previous, availableHives) => {
        const selectedHiveId = String(previous.hive_id || '');
        const stillExists = availableHives.some((hive) => String(hive.id) === selectedHiveId);
        const fallbackHiveId = availableHives[0] ? String(availableHives[0].id) : '';

        if (stillExists || selectedHiveId === fallbackHiveId) {
            return previous;
        }

        return {
            ...previous,
            hive_id: fallbackHiveId,
        };
    };

    const isSessionExpiredError = (apiError) => apiError?.code === SESSION_EXPIRED_CODE;

    const apiRequestWithSession = async (path, options = {}) => {
        try {
            return await apiRequest(path, options);
        } catch (apiError) {
            if (options.token && apiError?.status === 401) {
                clearSessionState('Session expiree. Reconnecte-toi.');
                const handledError = new Error('Session expired');
                handledError.code = SESSION_EXPIRED_CODE;
                throw handledError;
            }

            throw apiError;
        }
    };

    const fetchReadingsAndActions = async (authToken = token) => {
        const [readingData, actionData] = await Promise.all([
            apiRequestWithSession(`/api/readings${buildApiaryQuery(selectedReadingsApiaryFilter)}`, { token: authToken }),
            apiRequestWithSession(`/api/actions${buildApiaryQuery(selectedActionsApiaryFilter)}`, { token: authToken }),
        ]);

        setReadings(readingData);
        setActions(actionData);
    };

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
                const [me, apiaryData, hiveData] = await Promise.all([
                    apiRequestWithSession('/api/user', { token }),
                    apiRequestWithSession('/api/apiaries', { token }),
                    apiRequestWithSession('/api/hives', { token }),
                ]);

                setUser(me);
                setApiaries(apiaryData);
                setHives(hiveData);

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
                if (!isSessionExpiredError(loadError)) {
                    setError(loadError.message);
                }
            } finally {
                setBusy(false);
            }
        };

        load();
    }, [token]);

    useEffect(() => {
        if (!token) {
            return;
        }

        const loadReadingsAndActions = async () => {
            setBusy(true);
            setError('');

            try {
                await fetchReadingsAndActions(token);
            } catch (loadError) {
                if (!isSessionExpiredError(loadError)) {
                    setError(loadError.message);
                }
            } finally {
                setBusy(false);
            }
        };

        loadReadingsAndActions();
    }, [token, selectedReadingsApiaryFilter, selectedActionsApiaryFilter]);

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
        if (!info) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            setInfo('');
        }, 2600);

        return () => window.clearTimeout(timeoutId);
    }, [info]);

    useEffect(() => {
        if (!error) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            setError('');
        }, 4200);

        return () => window.clearTimeout(timeoutId);
    }, [error]);

    useEffect(() => {
        if (!token || typeof window === 'undefined') {
            return undefined;
        }

        const mediaQuery = window.matchMedia('(max-width: 1023px)');
        const syncViewportState = (mobile) => {
            setIsMobileViewport(mobile);

            if (!mobile) {
                setMobileMenuOpen(false);
            }
        };

        syncViewportState(mediaQuery.matches);

        if (typeof mediaQuery.addEventListener === 'function') {
            const handleChange = (event) => syncViewportState(event.matches);
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }

        const handleChange = (event) => syncViewportState(event.matches);
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
    }, [token]);

    useEffect(() => {
        if (isMobileViewport) {
            setMobileMenuOpen(false);
        }
    }, [isMobileViewport]);

    useEffect(() => {
        if (!token) {
            return;
        }

        if (!isMobileViewport && activeTab === MOBILE_ACTIONS_TAB.id) {
            setActiveTab('overview');
            return;
        }

        if (isMobileViewport && activeTab === 'overview') {
            setActiveTab(MOBILE_ACTIONS_TAB.id);
        }
    }, [token, isMobileViewport]);

    useEffect(() => {
        if (!token) {
            document.body.classList.remove('no-scroll');
            return undefined;
        }

        if (mobileMenuOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }

        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [mobileMenuOpen, token]);

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
        if (selectedReadingsApiaryFilter === 'all') {
            return;
        }

        const exists = apiaries.some((apiary) => String(apiary.id) === String(selectedReadingsApiaryFilter));

        if (!exists) {
            setSelectedReadingsApiaryFilter('all');
        }
    }, [apiaries, selectedReadingsApiaryFilter]);

    useEffect(() => {
        if (selectedActionsApiaryFilter === 'all') {
            return;
        }

        const exists = apiaries.some((apiary) => String(apiary.id) === String(selectedActionsApiaryFilter));

        if (!exists) {
            setSelectedActionsApiaryFilter('all');
        }
    }, [apiaries, selectedActionsApiaryFilter]);

    useEffect(() => {
        if (selectedApiaryFilter === 'all') {
            return;
        }

        setHiveForm((previous) => ({
            ...previous,
            apiary_id: String(selectedApiaryFilter),
        }));
    }, [selectedApiaryFilter]);

    useEffect(() => {
        setReadingForm((previous) => syncHiveSelection(previous, readingsHives));
    }, [readingsHives]);

    useEffect(() => {
        setActionForm((previous) => syncHiveSelection(previous, actionsHives));
    }, [actionsHives]);

    const clearSessionState = (message) => {
        setBusy(false);
        setError('');
        setToken('');
        setUser(null);
        setApiaries([]);
        setHives([]);
        setReadings([]);
        setActions([]);
        setWeatherByHive({});
        setEditingApiaryId(null);
        setEditingHiveId(null);
        setActiveTab('overview');
        setMobileMenuOpen(false);
        setSelectedApiaryFilter('all');
        setSelectedReadingsApiaryFilter('all');
        setSelectedActionsApiaryFilter('all');
        setInfo(message);
    };

    const refreshAll = async () => {
        if (!token) {
            return;
        }

        setBusy(true);
        setError('');

        try {
            const [apiaryData, hiveData] = await Promise.all([
                apiRequestWithSession('/api/apiaries', { token }),
                apiRequestWithSession('/api/hives', { token }),
            ]);

            setApiaries(apiaryData);
            setHives(hiveData);
            await fetchReadingsAndActions(token);
        } catch (refreshError) {
            if (!isSessionExpiredError(refreshError)) {
                setError(refreshError.message);
            }
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
            setActiveTab(isMobileViewport ? MOBILE_ACTIONS_TAB.id : 'overview');
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

        clearSessionState('Session fermee.');
    };

    const updateAccount = async (payload) => {
        setBusy(true);
        setError('');
        setInfo('');

        try {
            const updatedUser = await apiRequestWithSession('/api/account', {
                method: 'PUT',
                token,
                body: payload,
            });

            setUser(updatedUser);
            setInfo('Compte mis a jour.');
            return true;
        } catch (updateError) {
            if (!isSessionExpiredError(updateError)) {
                setError(updateError.message);
            }
            return false;
        } finally {
            setBusy(false);
        }
    };

    const deleteAccount = async (payload) => {
        setBusy(true);
        setError('');
        setInfo('');

        try {
            await apiRequestWithSession('/api/account', {
                method: 'DELETE',
                token,
                body: payload,
            });

            clearSessionState('Compte supprime. Toutes les donnees associees ont ete effacees.');
            return true;
        } catch (deleteError) {
            if (!isSessionExpiredError(deleteError)) {
                setError(deleteError.message);
            }
            return false;
        } finally {
            setBusy(false);
        }
    };

    const createApiary = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError('');

        try {
            const created = await apiRequestWithSession('/api/apiaries', {
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
            if (!isSessionExpiredError(createError)) {
                setError(createError.message);
            }
            setBusy(false);
        }
    };

    const selectApiaryLocation = (latitude, longitude) => {
        setApiaryForm((previous) => ({
            ...previous,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
        }));
    };

    const clearApiaryLocation = () => {
        setApiaryForm((previous) => ({
            ...previous,
            latitude: '',
            longitude: '',
        }));
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

    const selectEditingApiaryLocation = (latitude, longitude) => {
        setEditingApiaryForm((previous) => ({
            ...previous,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
        }));
    };

    const clearEditingApiaryLocation = () => {
        setEditingApiaryForm((previous) => ({
            ...previous,
            latitude: '',
            longitude: '',
        }));
    };

    const updateApiary = async (apiaryId) => {
        setBusy(true);
        setError('');

        try {
            await apiRequestWithSession(`/api/apiaries/${apiaryId}`, {
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
            if (!isSessionExpiredError(updateError)) {
                setError(updateError.message);
            }
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
            await apiRequestWithSession(`/api/apiaries/${apiaryId}`, { method: 'DELETE', token });

            if (String(selectedApiaryFilter) === String(apiaryId)) {
                setSelectedApiaryFilter('all');
            }
            if (String(selectedReadingsApiaryFilter) === String(apiaryId)) {
                setSelectedReadingsApiaryFilter('all');
            }
            if (String(selectedActionsApiaryFilter) === String(apiaryId)) {
                setSelectedActionsApiaryFilter('all');
            }

            setHiveForm((previous) => ({
                ...previous,
                apiary_id: String(previous.apiary_id) === String(apiaryId) ? '' : previous.apiary_id,
            }));

            await refreshAll();
        } catch (deleteError) {
            if (!isSessionExpiredError(deleteError)) {
                setError(deleteError.message);
            }
            setBusy(false);
        }
    };

    const handleHiveApiaryChange = (apiaryId) => {
        setHiveForm((previous) => withApiaryCoordinates(previous, apiaryId));
    };

    const createHive = async (event) => {
        event.preventDefault();

        if (apiaries.length === 0) {
            setError('Cree d\'abord un rucher avant d\'ajouter des ruches.');
            return false;
        }

        const apiaryId = Number(hiveForm.apiary_id);

        if (!apiaryId || Number.isNaN(apiaryId)) {
            setError('Selectionne un rucher pour la ruche.');
            return false;
        }

        setBusy(true);
        setError('');

        try {
            await apiRequestWithSession('/api/hives', {
                method: 'POST',
                token,
                body: {
                    name: hiveForm.name,
                    apiary_id: apiaryId,
                    status: hiveForm.status,
                    notes: hiveForm.notes,
                },
            });

            setHiveForm({
                ...initialHiveForm,
                apiary_id: String(apiaryId),
            });
            setInfo('Ruche creee.');
            await refreshAll();
            return true;
        } catch (createError) {
            if (!isSessionExpiredError(createError)) {
                setError(createError.message);
            }
            setBusy(false);
            return false;
        }
    };

    const startEditHive = (hive) => {
        setEditingHiveId(hive.id);
        setEditingHiveForm({
            ...initialHiveForm,
            name: hive.name || '',
            apiary_id: hive.apiary_id ? String(hive.apiary_id) : '',
            status: hive.status || 'active',
            notes: hive.notes || '',
        });
    };

    const handleEditingHiveApiaryChange = (apiaryId) => {
        setEditingHiveForm((previous) => withApiaryCoordinates(previous, apiaryId));
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
            await apiRequestWithSession(`/api/hives/${hiveId}`, {
                method: 'PUT',
                token,
                body: {
                    name: editingHiveForm.name,
                    apiary_id: apiaryId,
                    status: editingHiveForm.status,
                    notes: editingHiveForm.notes,
                },
            });

            setEditingHiveId(null);
            await refreshAll();
        } catch (updateError) {
            if (!isSessionExpiredError(updateError)) {
                setError(updateError.message);
            }
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
            await apiRequestWithSession(`/api/hives/${hiveId}`, { method: 'DELETE', token });
            setWeatherByHive((previous) => {
                const next = { ...previous };
                delete next[hiveId];
                return next;
            });
            await refreshAll();
        } catch (deleteError) {
            if (!isSessionExpiredError(deleteError)) {
                setError(deleteError.message);
            }
            setBusy(false);
        }
    };

    const fetchWeather = async (hiveId) => {
        setBusy(true);
        setError('');

        try {
            const payload = await apiRequestWithSession(`/api/hives/${hiveId}/weather`, { token });
            setWeatherByHive((previous) => ({
                ...previous,
                [hiveId]: payload.weather,
            }));
        } catch (weatherError) {
            if (!isSessionExpiredError(weatherError)) {
                setError(weatherError.message);
            }
        } finally {
            setBusy(false);
        }
    };

    const createReading = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError('');

        try {
            await apiRequestWithSession('/api/readings', {
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
            setInfo('Releve enregistre.');

            await refreshAll();
            if (isMobileViewport) {
                setActiveTab(MOBILE_ACTIONS_TAB.id);
            }
        } catch (createError) {
            if (!isSessionExpiredError(createError)) {
                setError(createError.message);
            }
            setBusy(false);
        }
    };

    const createAction = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError('');

        try {
            await apiRequestWithSession('/api/actions', {
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
            setInfo('Intervention enregistree.');

            await refreshAll();
            if (isMobileViewport) {
                setActiveTab(MOBILE_ACTIONS_TAB.id);
            }
        } catch (createError) {
            if (!isSessionExpiredError(createError)) {
                setError(createError.message);
            }
            setBusy(false);
        }
    };

    const navigationTabs = useMemo(
        () => (isMobileViewport ? [MOBILE_ACTIONS_TAB, ...TABS] : TABS),
        [isMobileViewport]
    );

    const currentTabLabel = useMemo(
        () => navigationTabs.find((tab) => tab.id === activeTab)?.label || TABS.find((tab) => tab.id === activeTab)?.label || 'Apiaryhub',
        [navigationTabs, activeTab]
    );

    const currentTabDescription = useMemo(() => {
        if (activeTab === MOBILE_ACTIONS_TAB.id) {
            return 'Raccourcis terrain pour saisir rapidement un releve ou une intervention.';
        }

        return 'Gestion multi-ruchers avec creation de ruche par selection de rucher.';
    }, [activeTab]);

    const renderContent = () => {
        if (activeTab === MOBILE_ACTIONS_TAB.id) {
            return (
                <QuickActionsTab
                    stats={stats}
                    recentActivity={mobileRecentActivity}
                    onOpenReadingsForm={() => {
                        setActiveTab('readings');
                        setMobileMenuOpen(false);
                    }}
                    onOpenActionsForm={() => {
                        setActiveTab('actions');
                        setMobileMenuOpen(false);
                    }}
                    onOpenApiaries={() => {
                        setActiveTab('apiaries');
                        setMobileMenuOpen(false);
                    }}
                    onOpenHives={() => {
                        setActiveTab('hives');
                        setMobileMenuOpen(false);
                    }}
                    onOpenAccount={() => {
                        setActiveTab('account');
                        setMobileMenuOpen(false);
                    }}
                />
            );
        }

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
                    userLocation={userLocation}
                    mapCenter={mapCenter}
                    selectApiaryLocation={selectApiaryLocation}
                    clearApiaryLocation={clearApiaryLocation}
                    selectEditingApiaryLocation={selectEditingApiaryLocation}
                    clearEditingApiaryLocation={clearEditingApiaryLocation}
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
                    apiaries={apiaries}
                    selectedApiaryFilter={selectedApiaryFilter}
                    setSelectedApiaryFilter={setSelectedApiaryFilter}
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
                    handleHiveApiaryChange={handleHiveApiaryChange}
                    handleEditingHiveApiaryChange={handleEditingHiveApiaryChange}
                />
            );
        }

        if (activeTab === 'readings') {
            return (
                <ReadingsTab
                    createReading={createReading}
                    readingForm={readingForm}
                    setReadingForm={setReadingForm}
                    hives={readingsHives}
                    apiaries={apiaries}
                    selectedApiaryFilter={selectedReadingsApiaryFilter}
                    setSelectedApiaryFilter={setSelectedReadingsApiaryFilter}
                    readings={readings}
                    busy={busy}
                    showHistory={!isMobileViewport}
                    onBack={isMobileViewport ? () => setActiveTab(MOBILE_ACTIONS_TAB.id) : null}
                />
            );
        }

        if (activeTab === 'actions') {
            return (
                <ActionsTab
                    createAction={createAction}
                    actionForm={actionForm}
                    setActionForm={setActionForm}
                    hives={actionsHives}
                    apiaries={apiaries}
                    selectedApiaryFilter={selectedActionsApiaryFilter}
                    setSelectedApiaryFilter={setSelectedActionsApiaryFilter}
                    actions={actions}
                    busy={busy}
                    showHistory={!isMobileViewport}
                    onBack={isMobileViewport ? () => setActiveTab(MOBILE_ACTIONS_TAB.id) : null}
                />
            );
        }

        return (
            <AccountTab
                user={user}
                busy={busy}
                onUpdateAccount={updateAccount}
                onDeleteAccount={deleteAccount}
                setError={setError}
            />
        );
    };

    return (
        <main className={token ? 'page-wrap app-authenticated' : 'page-wrap'}>
            {(error || info) && (
                <div className="flash-stack">
                    {error && <div className="flash error" role="alert">{error}</div>}
                    {info && <div className="flash info" role="status">{info}</div>}
                </div>
            )}

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
                <div className={isMobileViewport ? 'dashboard-shell mobile-actions-shell' : (mobileMenuOpen ? 'dashboard-shell menu-open' : 'dashboard-shell')}>
                    {!isMobileViewport && (
                        <>
                            <button
                                type="button"
                                className={mobileMenuOpen ? 'mobile-backdrop visible' : 'mobile-backdrop'}
                                aria-label="Fermer le menu"
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setMobileMenuOpen(false);
                                }}
                            />

                            <aside className={mobileMenuOpen ? 'sidebar panel open' : 'sidebar panel'}>
                                <div className="sidebar-top">
                                    <div className="brand-block">
                                        <p className="kicker">Apiaryhub</p>
                                        <h2>{user?.name ?? 'apiculteur'}</h2>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn mobile-close"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            setMobileMenuOpen(false);
                                        }}
                                    >
                                        Fermer
                                    </button>
                                </div>
                                <nav className="tab-nav">
                                    {navigationTabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            className={activeTab === tab.id ? 'tab-link active' : 'tab-link'}
                                            onClick={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                setActiveTab(tab.id);
                                                setMobileMenuOpen(false);
                                            }}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </nav>
                                <div className="sidebar-actions">
                                    <button
                                        type="button"
                                        className="btn"
                                        onClick={async () => {
                                            setMobileMenuOpen(false);
                                            await refreshAll();
                                        }}
                                        disabled={busy}
                                    >
                                        Rafraichir
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={async () => {
                                            setMobileMenuOpen(false);
                                            await logout();
                                        }}
                                    >
                                        Logout
                                    </button>
                                </div>
                            </aside>
                        </>
                    )}

                    <section className={isMobileViewport ? 'workspace mobile-workspace' : 'workspace'}>
                        <header className={isMobileViewport ? 'workspace-header workspace-header-mobile panel' : 'workspace-header panel gradient-panel'}>
                            <div>
                                <div className="workspace-header-top">
                                    {isMobileViewport ? (
                                        <>
                                            <p className="kicker">Apiaryhub Actions</p>
                                            {activeTab !== MOBILE_ACTIONS_TAB.id ? (
                                                <button
                                                    type="button"
                                                    className="btn mobile-action-back"
                                                    onClick={() => setActiveTab(MOBILE_ACTIONS_TAB.id)}
                                                >
                                                    Retour actions
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn"
                                                    onClick={refreshAll}
                                                    disabled={busy}
                                                >
                                                    Rafraichir
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                className="btn mobile-menu-trigger"
                                                aria-label="Ouvrir le menu"
                                                aria-expanded={mobileMenuOpen}
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    setMobileMenuOpen(true);
                                                }}
                                                disabled={mobileMenuOpen}
                                            >
                                                Menu
                                            </button>
                                            <p className="kicker">Apiaryhub Dashboard</p>
                                        </>
                                    )}
                                </div>
                                <h1>{currentTabLabel}</h1>
                                <p className={isMobileViewport ? 'muted small' : ''}>{currentTabDescription}</p>
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
