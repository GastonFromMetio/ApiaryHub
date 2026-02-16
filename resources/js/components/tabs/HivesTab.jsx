import { HiveCreationFunnel } from '../hives/HiveCreationFunnel';
import { HivesList } from '../hives/HivesList';

export function HivesTab(props) {
    return (
        <section className="content-grid two-columns">
            <HiveCreationFunnel
                hiveForm={props.hiveForm}
                setHiveForm={props.setHiveForm}
                createHive={props.createHive}
                busy={props.busy}
                hivesWithCoordinates={props.hivesWithCoordinates}
                mapCenter={props.mapCenter}
                selectedHivePosition={props.selectedHivePosition}
                userLocation={props.userLocation}
                apiaries={props.apiaries}
                selectHiveLocation={props.selectHiveLocation}
                clearHiveLocation={props.clearHiveLocation}
                setError={props.setError}
                selectedApiaryFilter={props.selectedApiaryFilter}
                setSelectedApiaryFilter={props.setSelectedApiaryFilter}
            />
            <HivesList
                hives={props.hives}
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
            />
        </section>
    );
}
