import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function SectionCard({
    title,
    description,
    action = null,
    className,
    headerClassName,
    contentClassName,
    children,
}) {
    return (
        <Card className={cn("overflow-hidden rounded-[28px] border-border/70 bg-card/90 shadow-[0_24px_80px_-48px_rgba(52,39,18,0.45)] backdrop-blur", className)}>
            {(title || description || action) && (
                <CardHeader className={cn("flex flex-row items-start justify-between gap-4 border-b border-border/60 bg-gradient-to-r from-background via-background to-secondary/35", headerClassName)}>
                    <div className="space-y-1.5">
                        {title ? <CardTitle className="font-display text-xl text-foreground">{title}</CardTitle> : null}
                        {description ? <CardDescription className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</CardDescription> : null}
                    </div>
                    {action ? <div className="shrink-0">{action}</div> : null}
                </CardHeader>
            )}
            <CardContent className={cn("p-6", contentClassName)}>{children}</CardContent>
        </Card>
    );
}

export function MetricCard({
    label,
    value,
    hint,
    icon: Icon,
    className,
    accent = "forest",
}) {
    const accentMap = {
        forest: "from-primary/18 via-primary/5 to-transparent text-primary",
        honey: "from-accent/28 via-accent/8 to-transparent text-accent-foreground",
        clay: "from-destructive/18 via-destructive/6 to-transparent text-destructive",
        sky: "from-chart-3/18 via-chart-3/6 to-transparent text-chart-3",
    };

    return (
        <Card className={cn("relative overflow-hidden rounded-[24px] border-border/70 bg-card/95 shadow-[0_18px_50px_-36px_rgba(42,32,20,0.4)]", className)}>
            <div className={cn("absolute inset-x-0 top-0 h-24 bg-gradient-to-br", accentMap[accent] || accentMap.forest)} />
            <CardContent className="relative flex h-full min-h-32 flex-col justify-between gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
                        <p className="font-display text-3xl leading-none text-foreground">{value}</p>
                    </div>
                    {Icon ? (
                        <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-background/90 shadow-sm">
                            <Icon className="size-5 text-foreground" />
                        </div>
                    ) : null}
                </div>
                {hint ? <p className="text-sm leading-6 text-muted-foreground">{hint}</p> : null}
            </CardContent>
        </Card>
    );
}

export function FieldBlock({
    label,
    hint,
    className,
    children,
}) {
    return (
        <div className={cn("grid gap-2", className)}>
            {label ? <label className="text-sm font-medium text-foreground">{label}</label> : null}
            {children}
            {hint ? <p className="text-xs leading-5 text-muted-foreground">{hint}</p> : null}
        </div>
    );
}

export function NativeSelect({ className, ...props }) {
    return (
        <select
            className={cn(
                "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    );
}

export function StatusBadge({
    children,
    variant = "outline",
    className,
}) {
    return (
        <Badge
            variant={variant}
            className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]", className)}
        >
            {children}
        </Badge>
    );
}

export function EmptyState({
    title,
    description,
    action,
    className,
}) {
    return (
        <div className={cn("flex min-h-40 flex-col items-start justify-center rounded-[24px] border border-dashed border-border bg-secondary/35 p-6", className)}>
            <div className="space-y-2">
                <h3 className="font-display text-xl text-foreground">{title}</h3>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
            {action ? <div className="mt-4">{action}</div> : null}
        </div>
    );
}
