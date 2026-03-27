import { Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState, SectionCard, StatusBadge } from "@/components/app/app-ui";

export function ComplianceTab({
    onOpenField,
}) {
    return (
        <section className="grid gap-6">
            <SectionCard
                title="Documents"
                description="Section en cours de développement."
                action={
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" className="rounded-xl" onClick={onOpenField}>
                            Retour terrain
                        </Button>
                    </div>
                }
                contentClassName="grid gap-4 lg:grid-cols-2"
            >
                <EmptyState
                    className="lg:col-span-2 min-h-52"
                    title="Section en cours de développement"
                    description="Cette partie sera disponible prochainement."
                    action={
                        <StatusBadge className="bg-primary/10 text-primary">
                            <Clock3 className="mr-1 size-3" />
                            En développement
                        </StatusBadge>
                    }
                />
            </SectionCard>
        </section>
    );
}
