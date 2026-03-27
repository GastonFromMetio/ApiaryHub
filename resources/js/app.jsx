import './bootstrap';
import React, { Suspense, lazy, startTransition, useEffect, useMemo, useState } from 'react';
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
import { AppShell } from './components/layout/AppShell';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from './lib/api';
import { setupLeafletDefaultIcon } from './lib/leaflet';
import { toDatetimeValue } from './utils/date';
import { parseNumber } from './utils/number';

setupLeafletDefaultIcon();
const lazyNamed = (loader, exportName) => lazy(() => loader().then((module) => ({ default: module[exportName] })));

const TOKEN_STORAGE_KEY = 'apiaryhub_token';
const TOKEN_EXPIRATION_STORAGE_KEY = 'apiaryhub_token_expires_at';
const LEGACY_TOKEN_STORAGE_KEY = 'beewatch_token';
const ACTIVE_TAB_STORAGE_PREFIX = 'apiaryhub_active_tab_';
const SESSION_EXPIRED_CODE = 'SESSION_EXPIRED';
const ADMIN_TAB = { id: 'admin', label: 'Administration' };
const ACCOUNT_TAB = { id: 'account', label: 'Compte' };
const RESET_PASSWORD_PATH_PREFIX = '/reset-password/';
const BRAND_LOGO_FULL = '/branding/apiaryhub_logo_seul_512.png';
const OperationsTab = lazyNamed(() => import('./components/tabs/OperationsTab'), 'OperationsTab');
const FieldTab = lazyNamed(() => import('./components/tabs/FieldTab'), 'FieldTab');
const JournalTab = lazyNamed(() => import('./components/tabs/JournalTab'), 'JournalTab');
const ComplianceTab = lazyNamed(() => import('./components/tabs/ComplianceTab'), 'ComplianceTab');
const AccountTab = lazyNamed(() => import('./components/tabs/AccountTab'), 'AccountTab');
const AdminTab = lazyNamed(() => import('./components/tabs/AdminTab'), 'AdminTab');

const getAllowedTabIds = (currentUser) => {
    if (currentUser?.is_admin) {
        return [ADMIN_TAB.id, ACCOUNT_TAB.id];
    }

    return TABS.map((tab) => tab.id);
};

const resolveTabForUser = (currentUser, candidateTab) => {
    const allowedTabs = getAllowedTabIds(currentUser);

    if (candidateTab && allowedTabs.includes(candidateTab)) {
        return candidateTab;
    }

    if (currentUser?.is_admin) {
        return ADMIN_TAB.id;
    }

    return 'field';
};

function TabLoadingFallback() {
    return (
        <div className="grid gap-6">
            <div className="grid gap-4 lg:grid-cols-3">
                <Skeleton className="h-44 rounded-[28px]" />
                <Skeleton className="h-44 rounded-[28px]" />
                <Skeleton className="h-44 rounded-[28px]" />
            </div>
            <Skeleton className="h-72 radius-shell" />
            <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-64 rounded-[28px]" />
                <Skeleton className="h-64 rounded-[28px]" />
            </div>
        </div>
    );
}

function getStoredSessionValue(key) {
    if (typeof window === 'undefined') {
        return '';
    }

    return window.sessionStorage.getItem(key)
        || window.localStorage.getItem(key)
        || '';
}

function isExpiredTimestamp(value) {
    if (!value) {
        return false;
    }

    const expirationTime = Date.parse(value);

    return Number.isFinite(expirationTime) && expirationTime <= Date.now();
}

function App() {
    const [token, setToken] = useState(
        () => {
            const storedToken = getStoredSessionValue(TOKEN_STORAGE_KEY) || getStoredSessionValue(LEGACY_TOKEN_STORAGE_KEY);
            const storedExpiration = getStoredSessionValue(TOKEN_EXPIRATION_STORAGE_KEY);

            if (!storedToken || isExpiredTimestamp(storedExpiration)) {
                return '';
            }

            return storedToken;
        }
    );
    const [tokenExpiration, setTokenExpiration] = useState(
        () => {
            const storedExpiration = getStoredSessionValue(TOKEN_EXPIRATION_STORAGE_KEY);

            if (!storedExpiration || isExpiredTimestamp(storedExpiration)) {
                return null;
            }

            return storedExpiration;
        }
    );
    const [user, setUser] = useState(null);
    const [apiaries, setApiaries] = useState([]);
    const [hives, setHives] = useState([]);
    const [readings, setReadings] = useState([]);
    const [actions, setActions] = useState([]);
    const [weatherByHive, setWeatherByHive] = useState({});
    const [adminDashboard, setAdminDashboard] = useState(null);
    const [adminLoading, setAdminLoading] = useState(false);
    const [selectedAdminApiaryFilter, setSelectedAdminApiaryFilter] = useState('all');

    const [authMode, setAuthMode] = useState('login');
    const [authForm, setAuthForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        reset_token: '',
    });

    const [activeTab, setActiveTab] = useState('field');
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
    const [verificationBusy, setVerificationBusy] = useState(false);
    const [verificationNoticeDismissed, setVerificationNoticeDismissed] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [userLocation, setUserLocation] = useState(null);
    const userNeedsEmailVerification = Boolean(token && user && !user.email_verified_at);

    const stats = useMemo(() => ({
        hiveCount: hives.length,
        readingCount: readings.length,
        actionCount: actions.length,
        apiaryCount: apiaries.length,
    }), [hives, readings, actions, apiaries]);

    const recentActivity = useMemo(() => {
        const readingItems = readings.map((reading) => ({
            id: `reading-${reading.id}`,
            kind: 'Mesure',
            title: reading.hive?.name || `Ruche #${reading.hive_id}`,
            timestamp: reading.recorded_at,
            subtitle: `${reading.hive?.apiary_entity?.name || reading.hive?.apiary || 'Rucher non precise'} | Poids ${reading.weight_kg ?? '-'} kg`,
        }));

        const actionItems = actions.map((action) => ({
            id: `action-${action.id}`,
            kind: 'Action',
            title: action.type || 'Intervention',
            timestamp: action.performed_at,
            subtitle: `${action.hive?.name || `Ruche #${action.hive_id}`} | ${action.hive?.apiary_entity?.name || action.hive?.apiary || 'Rucher non precise'}`,
        }));

        return [...readingItems, ...actionItems]
            .sort((left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime());
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

    const buildAdminQuery = () => {
        if (selectedAdminApiaryFilter === 'all') {
            return '';
        }

        const apiaryId = Number(selectedAdminApiaryFilter);

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
            apiRequestWithSession('/api/readings', { token: authToken }),
            apiRequestWithSession('/api/actions', { token: authToken }),
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
            setAdminDashboard(null);
            return;
        }

        const load = async () => {
            setBusy(true);
            setError('');

            try {
                const me = await apiRequestWithSession('/api/user', { token });
                const [apiaryData, hiveData, readingData, actionData] = await Promise.all([
                    apiRequestWithSession('/api/apiaries', { token }),
                    apiRequestWithSession('/api/hives', { token }),
                    apiRequestWithSession('/api/readings', { token }),
                    apiRequestWithSession('/api/actions', { token }),
                ]);

                setUser(me);
                setApiaries(apiaryData);
                setHives(hiveData);
                setReadings(readingData);
                setActions(actionData);
                setAdminDashboard(null);
                const savedTab = localStorage.getItem(`${ACTIVE_TAB_STORAGE_PREFIX}${me.id}`);
                setActiveTab(resolveTabForUser(me, savedTab));

                if (me?.is_admin) {
                    const adminData = await apiRequestWithSession(`/api/admin/dashboard${buildAdminQuery()}`, { token });
                    setAdminDashboard(adminData);
                }

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
        if (typeof window === 'undefined') {
            return;
        }

        if (token) {
            window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
            if (tokenExpiration) {
                window.sessionStorage.setItem(TOKEN_EXPIRATION_STORAGE_KEY, tokenExpiration);
            } else {
                window.sessionStorage.removeItem(TOKEN_EXPIRATION_STORAGE_KEY);
            }
            window.localStorage.removeItem(TOKEN_STORAGE_KEY);
            window.localStorage.removeItem(TOKEN_EXPIRATION_STORAGE_KEY);
            window.localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
        } else {
            window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
            window.sessionStorage.removeItem(TOKEN_EXPIRATION_STORAGE_KEY);
            window.localStorage.removeItem(TOKEN_STORAGE_KEY);
            window.localStorage.removeItem(TOKEN_EXPIRATION_STORAGE_KEY);
            window.localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
        }
    }, [token, tokenExpiration]);

    useEffect(() => {
        if (typeof window === 'undefined' || token) {
            return;
        }

        const url = new URL(window.location.href);
        const isResetPasswordPath = url.pathname.startsWith(RESET_PASSWORD_PATH_PREFIX);
        const resetToken = isResetPasswordPath ? decodeURIComponent(url.pathname.slice(RESET_PASSWORD_PATH_PREFIX.length)) : '';
        const emailFromUrl = url.searchParams.get('email');
        const emailVerified = url.searchParams.get('email_verified');

        if (emailVerified === '1') {
            setInfo('Email confirme. Tu peux maintenant te connecter.');
            url.searchParams.delete('email_verified');
            window.history.replaceState({}, '', `${url.pathname}${url.search}`);
        }

        if (!isResetPasswordPath || !resetToken) {
            return;
        }

        setAuthMode('reset');
        setAuthForm((previous) => ({
            ...previous,
            email: emailFromUrl || previous.email,
            password: '',
            password_confirmation: '',
            reset_token: resetToken,
        }));
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
        if (!token || !user) {
            return;
        }

        const resolvedTab = resolveTabForUser(user, activeTab);
        if (resolvedTab !== activeTab) {
            setActiveTab(resolvedTab);
        }
    }, [token, user, activeTab]);

    useEffect(() => {
        if (!token || !user) {
            return;
        }

        localStorage.setItem(`${ACTIVE_TAB_STORAGE_PREFIX}${user.id}`, activeTab);
    }, [token, user?.id, activeTab]);

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
        setVerificationBusy(false);
        setVerificationNoticeDismissed(false);
        setAdminLoading(false);
        setError('');
        setToken('');
        setTokenExpiration(null);
        setUser(null);
        setApiaries([]);
        setHives([]);
        setReadings([]);
        setActions([]);
        setAdminDashboard(null);
        setWeatherByHive({});
        setEditingApiaryId(null);
        setEditingHiveId(null);
        setActiveTab('field');
        setSelectedApiaryFilter('all');
        setSelectedReadingsApiaryFilter('all');
        setSelectedActionsApiaryFilter('all');
        setSelectedAdminApiaryFilter('all');
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

            if (user?.is_admin) {
                setAdminLoading(true);
                const adminData = await apiRequestWithSession(`/api/admin/dashboard${buildAdminQuery()}`, { token });
                setAdminDashboard(adminData);
            }
        } catch (refreshError) {
            if (!isSessionExpiredError(refreshError)) {
                setError(refreshError.message);
            }
        } finally {
            setAdminLoading(false);
            setBusy(false);
        }
    };

    const refreshAdminDashboard = async () => {
        if (!token || !user?.is_admin) {
            return;
        }

        setAdminLoading(true);
        setError('');

        try {
            const adminData = await apiRequestWithSession(`/api/admin/dashboard${buildAdminQuery()}`, { token });
            setAdminDashboard(adminData);
        } catch (refreshError) {
            if (!isSessionExpiredError(refreshError)) {
                setError(refreshError.message);
            }
        } finally {
            setAdminLoading(false);
        }
    };

    useEffect(() => {
        if (!token || !user?.is_admin) {
            return;
        }

        refreshAdminDashboard();
    }, [selectedAdminApiaryFilter]);

    const submitAuth = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError('');
        setInfo('');

        try {
            if (authMode === 'login') {
                const payload = await apiRequest('/api/auth/login', {
                    method: 'POST',
                    body: { email: authForm.email, password: authForm.password },
                });

                setToken(payload.token);
                setTokenExpiration(payload.expires_at || null);
                setActiveTab('field');
                setInfo(payload.message || 'Connexion reussie.');
                return;
            }

            if (authMode === 'register') {
                await apiRequest('/api/auth/register', {
                    method: 'POST',
                    body: {
                        name: authForm.name,
                        email: authForm.email,
                        password: authForm.password,
                        password_confirmation: authForm.password_confirmation,
                    },
                });

                setAuthMode('verify-pending');
                setAuthForm((previous) => ({
                    ...previous,
                    password: '',
                    password_confirmation: '',
                }));
                setInfo('Compte cree. Verifie ton email, puis connecte-toi.');
                return;
            }

            if (authMode === 'forgot') {
                await apiRequest('/api/auth/forgot-password', {
                    method: 'POST',
                    body: { email: authForm.email },
                });

                setInfo('Si cet email existe, un lien de reinitialisation a ete envoye.');
                return;
            }

            if (authMode === 'reset') {
                await apiRequest('/api/auth/reset-password', {
                    method: 'POST',
                    body: {
                        email: authForm.email,
                        token: authForm.reset_token,
                        password: authForm.password,
                        password_confirmation: authForm.password_confirmation,
                    },
                });

                if (typeof window !== 'undefined' && window.location.pathname.startsWith(RESET_PASSWORD_PATH_PREFIX)) {
                    window.history.replaceState({}, '', '/');
                }

                setAuthMode('login');
                setAuthForm((previous) => ({
                    ...previous,
                    password: '',
                    password_confirmation: '',
                    reset_token: '',
                }));
                setInfo('Mot de passe reinitialise. Tu peux maintenant te connecter.');
            }
        } catch (authError) {
            setError(authError.message);
        } finally {
            setBusy(false);
        }
    };

    const resendVerificationEmail = async () => {
        if (!authForm.email) {
            setError('Saisis ton email pour renvoyer la verification.');
            return;
        }

        setBusy(true);
        setError('');

        try {
            await apiRequest('/api/auth/resend-verification', {
                method: 'POST',
                body: { email: authForm.email },
            });
            setInfo('Si ce compte existe et n\'est pas verifie, un email a ete renvoye.');
        } catch (apiError) {
            setError(apiError.message);
        } finally {
            setBusy(false);
        }
    };

    const resendVerificationEmailForConnectedUser = async () => {
        if (!user?.email) {
            return;
        }

        setVerificationBusy(true);
        setError('');

        try {
            await apiRequest('/api/auth/resend-verification', {
                method: 'POST',
                body: { email: user.email },
            });
            setInfo('Email de verification renvoye.');
        } catch (apiError) {
            setError(apiError.message);
        } finally {
            setVerificationBusy(false);
        }
    };

    const checkVerificationStatus = async () => {
        if (!token) {
            return;
        }

        setVerificationBusy(true);
        setError('');

        try {
            const me = await apiRequestWithSession('/api/user', { token });
            setUser(me);

            if (me?.email_verified_at) {
                setVerificationNoticeDismissed(false);
                setInfo('Email confirme. Merci.');
            } else {
                setInfo('Email toujours en attente de verification.');
                setVerificationNoticeDismissed(false);
            }
        } catch (apiError) {
            if (!isSessionExpiredError(apiError)) {
                setError(apiError.message);
            }
        } finally {
            setVerificationBusy(false);
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
            const responsePayload = await apiRequestWithSession('/api/account', {
                method: 'PUT',
                token,
                body: payload,
            });

            const updatedUser = responsePayload?.user ?? responsePayload;

            if (responsePayload?.token) {
                setToken(responsePayload.token);
                setTokenExpiration(responsePayload.expires_at || null);
            }

            setUser(updatedUser);
            setInfo(responsePayload?.session_rotated ? 'Compte mis a jour. Session renouvelee.' : 'Compte mis a jour.');
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
        } catch (createError) {
            if (!isSessionExpiredError(createError)) {
                setError(createError.message);
            }
            setBusy(false);
        }
    };

    const navigationTabs = useMemo(
        () => {
            if (user?.is_admin) {
                return [ADMIN_TAB, ACCOUNT_TAB];
            }

            return TABS;
        },
        [user?.is_admin]
    );

    const currentTabLabel = useMemo(
        () => navigationTabs.find((tab) => tab.id === activeTab)?.label || 'ApiaryHub',
        [navigationTabs, activeTab]
    );

    const currentTabDescription = useMemo(() => {
        if (activeTab === 'field') {
            return 'Mesures et actions.';
        }

        if (activeTab === 'apiaries') {
            return 'Sites, ruches, carte.';
        }

        if (activeTab === 'journal') {
            return 'Historique des entrees.';
        }

        if (activeTab === 'compliance') {
            return 'Suivi et registre.';
        }

        if (activeTab === ADMIN_TAB.id) {
            return 'Comptes, ruchers, activite.';
        }

        return 'Profil et securite.';
    }, [activeTab]);

    const renderContent = () => {
        const navigateToTab = (tabId) => startTransition(() => setActiveTab(tabId));

        if (activeTab === 'field') {
            return (
                <FieldTab
                    apiaries={apiaries}
                    hives={hives}
                    recentActivity={recentActivity}
                    readingForm={readingForm}
                    setReadingForm={setReadingForm}
                    selectedReadingsApiaryFilter={selectedReadingsApiaryFilter}
                    setSelectedReadingsApiaryFilter={setSelectedReadingsApiaryFilter}
                    readingsHives={readingsHives}
                    createReading={createReading}
                    actionForm={actionForm}
                    setActionForm={setActionForm}
                    selectedActionsApiaryFilter={selectedActionsApiaryFilter}
                    setSelectedActionsApiaryFilter={setSelectedActionsApiaryFilter}
                    actionsHives={actionsHives}
                    createAction={createAction}
                    busy={busy}
                    userNeedsEmailVerification={userNeedsEmailVerification}
                    onOpenApiaries={() => navigateToTab('apiaries')}
                    onOpenJournal={() => navigateToTab('journal')}
                    onOpenCompliance={() => navigateToTab('compliance')}
                />
            );
        }

        if (activeTab === 'apiaries') {
            return (
                <OperationsTab
                    stats={stats}
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
                    hiveForm={hiveForm}
                    setHiveForm={setHiveForm}
                    createHive={createHive}
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

        if (activeTab === 'journal') {
            return (
                <JournalTab
                    apiaries={apiaries}
                    hives={hives}
                    readings={readings}
                    actions={actions}
                    onOpenField={() => navigateToTab('field')}
                />
            );
        }

        if (activeTab === 'compliance') {
            return (
                <ComplianceTab
                    hives={hives}
                    actions={actions}
                    onOpenField={() => navigateToTab('field')}
                    onOpenJournal={() => navigateToTab('journal')}
                />
            );
        }

        if (activeTab === ADMIN_TAB.id) {
            if (!user?.is_admin) {
                return <FieldTab
                    apiaries={apiaries}
                    hives={hives}
                    recentActivity={recentActivity}
                    readingForm={readingForm}
                    setReadingForm={setReadingForm}
                    selectedReadingsApiaryFilter={selectedReadingsApiaryFilter}
                    setSelectedReadingsApiaryFilter={setSelectedReadingsApiaryFilter}
                    readingsHives={readingsHives}
                    createReading={createReading}
                    actionForm={actionForm}
                    setActionForm={setActionForm}
                    selectedActionsApiaryFilter={selectedActionsApiaryFilter}
                    setSelectedActionsApiaryFilter={setSelectedActionsApiaryFilter}
                    actionsHives={actionsHives}
                    createAction={createAction}
                    busy={busy}
                    userNeedsEmailVerification={userNeedsEmailVerification}
                    onOpenApiaries={() => navigateToTab('apiaries')}
                    onOpenJournal={() => navigateToTab('journal')}
                    onOpenCompliance={() => navigateToTab('compliance')}
                />;
            }

            return (
                <AdminTab
                    data={adminDashboard}
                    selectedApiaryFilter={selectedAdminApiaryFilter}
                    onApiaryFilterChange={setSelectedAdminApiaryFilter}
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
        <main className="min-h-svh overflow-x-clip px-4 py-4 lg:px-6">
            {(error || info) && (
                <div className="fixed right-4 top-4 z-[80] grid w-[min(92vw,26rem)] gap-3">
                    {error ? (
                        <div
                            className="radius-subpanel border border-destructive/25 bg-background/92 p-4 shadow-[0_24px_70px_-45px_rgba(146,46,32,0.55)] backdrop-blur"
                            role="alert"
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-destructive">Erreur</p>
                            <p className="mt-2 text-sm leading-6 text-foreground">{error}</p>
                        </div>
                    ) : null}
                    {info ? (
                        <div
                            className="radius-subpanel border border-primary/20 bg-background/92 p-4 shadow-[0_24px_70px_-45px_rgba(31,73,57,0.45)] backdrop-blur"
                            role="status"
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Info</p>
                            <p className="mt-2 text-sm leading-6 text-foreground">{info}</p>
                        </div>
                    ) : null}
                </div>
            )}

            {!token ? (
                <div className="mx-auto max-w-[1600px]">
                    <AuthPanel
                        authMode={authMode}
                        setAuthMode={setAuthMode}
                        authForm={authForm}
                        setAuthForm={setAuthForm}
                        submitAuth={submitAuth}
                        resendVerificationEmail={resendVerificationEmail}
                        busy={busy}
                    />
                </div>
            ) : (
                <AppShell
                    brandLogo={BRAND_LOGO_FULL}
                    user={user}
                    navigationTabs={navigationTabs}
                    activeTab={activeTab}
                    onTabChange={(tabId) => startTransition(() => setActiveTab(tabId))}
                    currentTabLabel={currentTabLabel}
                    currentTabDescription={currentTabDescription}
                    stats={stats}
                    userNeedsEmailVerification={userNeedsEmailVerification}
                    showVerificationNotice={userNeedsEmailVerification && !verificationNoticeDismissed}
                    verificationBusy={verificationBusy}
                    onResendVerification={resendVerificationEmailForConnectedUser}
                    onCheckVerification={checkVerificationStatus}
                    onDismissVerification={() => setVerificationNoticeDismissed(true)}
                    onLogout={logout}
                >
                    <Suspense fallback={<TabLoadingFallback />}>
                        {renderContent()}
                    </Suspense>
                </AppShell>
            )}
        </main>
    );
}

const rootElement = document.getElementById('app');

if (rootElement) {
    createRoot(rootElement).render(<App />);
}
