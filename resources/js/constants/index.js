export const HIVE_STATUSES = ['active', 'inactive', 'maintenance'];
export const FALLBACK_CENTER = [46.603354, 1.888334];

export const TABS = [
    { id: 'overview', label: "Vue d'ensemble" },
    { id: 'apiaries', label: 'Ruchers' },
    { id: 'hives', label: 'Ruches' },
    { id: 'readings', label: 'Releves' },
    { id: 'actions', label: 'Interventions' },
    { id: 'account', label: 'Compte' },
];

export const initialHiveForm = {
    name: '',
    apiary_id: '',
    status: 'active',
    notes: '',
};

export const initialApiaryForm = {
    name: '',
    latitude: '',
    longitude: '',
    notes: '',
};

export const initialReadingForm = {
    hive_id: '',
    weight_kg: '',
    temperature_c: '',
    humidity_percent: '',
    activity_index: '',
    recorded_at: '',
};

export const initialActionForm = {
    hive_id: '',
    type: '',
    description: '',
    performed_at: '',
};
