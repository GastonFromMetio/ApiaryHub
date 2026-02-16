import { useMemo, useState } from 'react';
import { HiveCreationFunnel } from '../hives/HiveCreationFunnel';
import { HivesList } from '../hives/HivesList';

export function HivesTab(props) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const visibleHives = useMemo(
        () => props.hives.filter((hive) => {
            const matchesStatus = statusFilter === 'all' || hive.status === statusFilter;
            const matchesSearch = hive.name.toLowerCase().includes(search.trim().toLowerCase());

            return matchesStatus && matchesSearch;
        }),
        [props.hives, search, statusFilter]
    );

    return (
        <section className="content-grid hives-page">
            <HiveCreationFunnel
                hiveForm={props.hiveForm}
                setHiveForm={props.setHiveForm}
                createHive={props.createHive}
                busy={props.busy}
                apiaries={props.apiaries}
                setError={props.setError}
                handleHiveApiaryChange={props.handleHiveApiaryChange}
            />
            <HivesList
                hives={visibleHives}
                totalHives={props.hives.length}
                apiaries={props.apiaries}
                weatherByHive={props.weatherByHive}
                editingHiveId={props.editingHiveId}
                editingHiveForm={props.editingHiveForm}
                setEditingHiveForm={props.setEditingHiveForm}
                startEditHive={props.startEditHive}
                updateHive={props.updateHive}
                setEditingHiveId={props.setEditingHiveId}
                fetchWeather={props.fetchWeather}
                deleteHive={props.deleteHive}
                busy={props.busy}
                handleEditingHiveApiaryChange={props.handleEditingHiveApiaryChange}
                selectedApiaryFilter={props.selectedApiaryFilter}
                setSelectedApiaryFilter={props.setSelectedApiaryFilter}
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
            />
        </section>
    );
}
