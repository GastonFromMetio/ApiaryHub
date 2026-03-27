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
        <Card
            className={cn(
                "radius-panel overflow-hidden border-border/65 bg-[linear-gradient(180deg,hsl(var(--card))/0.94,hsla(42,38%,95%,0.88))] shadow-[0_28px_84px_-54px_rgba(52,39,18,0.46)] backdrop-blur-sm",
                className
            )}
        >
            {(title || description || action) && (
                <CardHeader
                    className={cn(
                        "flex flex-row items-start justify-between gap-4 border-b border-border/55 bg-gradient-to-r from-background/92 via-background/80 to-secondary/28",
                        headerClassName
                    )}
                >
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
        <Card
            className={cn(
                "radius-subpanel relative overflow-hidden border-border/65 bg-[linear-gradient(180deg,hsl(var(--card))/0.96,hsla(42,34%,95%,0.86))] shadow-[0_22px_58px_-40px_rgba(42,32,20,0.4)] backdrop-blur-sm",
                className
            )}
        >
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
    labelClassName,
    hintClassName,
    children,
}) {
    return (
        <div className={cn("grid gap-2", className)}>
            {label ? <label className={cn("text-sm font-medium text-foreground", labelClassName)}>{label}</label> : null}
            {children}
            {hint ? <p className={cn("text-xs leading-5 text-muted-foreground", hintClassName)}>{hint}</p> : null}
        </div>
    );
}

export function FilterToolbar({
    className,
    children,
}) {
    return (
        <div
            className={cn(
                "radius-subpanel border border-border/50 bg-[linear-gradient(180deg,hsl(var(--background))/0.7,hsla(43,34%,95%,0.58))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.32)] backdrop-blur-sm",
                className
            )}
        >
            {children}
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
        <div
            className={cn(
                "radius-subpanel flex min-h-40 flex-col items-start justify-center border border-dashed border-border/75 bg-[linear-gradient(180deg,hsl(var(--secondary))/0.52,hsla(43,34%,94%,0.78))] p-6 backdrop-blur-sm",
                className
            )}
        >
            <div className="space-y-2">
                <h3 className="font-display text-xl text-foreground">{title}</h3>
                <p className="max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
            {action ? <div className="mt-4">{action}</div> : null}
        </div>
    );
}
