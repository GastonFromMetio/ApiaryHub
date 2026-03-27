import { Hexagon, MapPinned } from "lucide-react";

import { ApiariesTab } from "./ApiariesTab";
import { HivesTab } from "./HivesTab";
import { MetricCard, SectionCard, StatusBadge } from "@/components/app/app-ui";

export function OperationsTab({
    stats,
    ...props
}) {
    return (
        <section className="grid gap-6">
            <SectionCard
                title="Base d’exploitation"
                description="Crée les sites puis les ruches."
                action={<StatusBadge className="bg-primary/10 text-primary">Structure active</StatusBadge>}
                contentClassName="grid gap-4 lg:grid-cols-3"
            >
                <MetricCard
                    label="Ruchers"
                    value={stats.apiaryCount}
                    hint="Nombre de sites actuellement cartographiés."
                    icon={MapPinned}
                    accent="forest"
                />
                <MetricCard
                    label="Ruches"
                    value={stats.hiveCount}
                    hint="Supports de production rattachés à un rucher."
                    icon={Hexagon}
                    accent="honey"
                />
                <div className="rounded-[24px] border border-border/70 bg-secondary/45 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Ordre</p>
                    <p className="mt-3 font-display text-2xl text-foreground">1. Situer. 2. Nommer. 3. Opérer.</p>
                </div>
            </SectionCard>

            <ApiariesTab
                apiaries={props.apiaries}
                apiaryForm={props.apiaryForm}
                setApiaryForm={props.setApiaryForm}
                createApiary={props.createApiary}
                editingApiaryId={props.editingApiaryId}
                editingApiaryForm={props.editingApiaryForm}
                setEditingApiaryForm={props.setEditingApiaryForm}
                startEditApiary={props.startEditApiary}
                updateApiary={props.updateApiary}
                setEditingApiaryId={props.setEditingApiaryId}
                deleteApiary={props.deleteApiary}
                busy={props.busy}
                userLocation={props.userLocation}
                mapCenter={props.mapCenter}
                selectApiaryLocation={props.selectApiaryLocation}
                clearApiaryLocation={props.clearApiaryLocation}
                selectEditingApiaryLocation={props.selectEditingApiaryLocation}
                clearEditingApiaryLocation={props.clearEditingApiaryLocation}
            />

            <HivesTab
                hiveForm={props.hiveForm}
                setHiveForm={props.setHiveForm}
                createHive={props.createHive}
                busy={props.busy}
                apiaries={props.apiaries}
                selectedApiaryFilter={props.selectedApiaryFilter}
                setSelectedApiaryFilter={props.setSelectedApiaryFilter}
                setError={props.setError}
                hives={props.hives}
                weatherByHive={props.weatherByHive}
                editingHiveId={props.editingHiveId}
                editingHiveForm={props.editingHiveForm}
                setEditingHiveForm={props.setEditingHiveForm}
                startEditHive={props.startEditHive}
                updateHive={props.updateHive}
                setEditingHiveId={props.setEditingHiveId}
                fetchWeather={props.fetchWeather}
                deleteHive={props.deleteHive}
                handleHiveApiaryChange={props.handleHiveApiaryChange}
                handleEditingHiveApiaryChange={props.handleEditingHiveApiaryChange}
            />
        </section>
    );
}
