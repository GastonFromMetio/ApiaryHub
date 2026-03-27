export const HIVE_STATUSES = ['active', 'inactive', 'maintenance'];
export const FALLBACK_CENTER = [46.603354, 1.888334];

export const TABS = [
    { id: 'field', label: 'Terrain' },
    { id: 'apiaries', label: 'Ruchers' },
    { id: 'journal', label: 'Journal' },
    { id: 'compliance', label: 'Documents' },
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

export const initialActionForm = {
    hive_id: '',
    type: '',
    description: '',
    performed_at: '',
};
