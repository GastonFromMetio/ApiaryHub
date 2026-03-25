import {
    BellRing,
    BookText,
    CircleHelp,
    Hexagon,
    LayoutDashboard,
    LogOut,
    MapPinned,
    ShieldCheck,
    UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarSeparator,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { formatCountLabel } from "@/utils/text";

const ICONS = {
    field: LayoutDashboard,
    apiaries: MapPinned,
    journal: BookText,
    compliance: ShieldCheck,
    account: UserRound,
    admin: Hexagon,
};

function getInitials(name) {
    if (!name) {
        return "AH";
    }

    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

export function AppShell({
    brandLogo,
    user,
    navigationTabs,
    activeTab,
    onTabChange,
    currentTabLabel,
    currentTabDescription,
    stats,
    userNeedsEmailVerification,
    showVerificationNotice,
    verificationBusy,
    onResendVerification,
    onCheckVerification,
    onDismissVerification,
    onOpenOnboarding,
    onLogout,
    children,
}) {
    const summaryBadges = [
        formatCountLabel(stats.apiaryCount, "rucher"),
        formatCountLabel(stats.readingCount, "releve", "releves"),
        formatCountLabel(stats.actionCount, "action"),
    ];

    return (
        <SidebarProvider
            defaultOpen
            style={{
                "--sidebar-width": "18rem",
                "--sidebar-width-icon": "4rem",
            }}
        >
            <Sidebar collapsible="offcanvas" variant="inset" className="border-r-0">
                <SidebarHeader className="gap-4 p-4">
                    <div className="rounded-[26px] border border-sidebar-border/70 bg-sidebar-accent/35 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                        <div className="flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-2xl border border-sidebar-border/70 bg-sidebar-primary/15">
                                <img
                                    src={brandLogo}
                                    alt="ApiaryHub"
                                    className="h-8 w-auto object-contain"
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-sidebar-foreground/60">
                                    ApiaryHub
                                </p>
                                <p className="truncate text-sm font-medium text-sidebar-foreground">
                                    Suivi apicole
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-sidebar-foreground/72">
                            <div className="rounded-2xl border border-sidebar-border/60 bg-sidebar/55 p-3">
                                <p className="uppercase tracking-[0.22em] text-sidebar-foreground/55">Ruches</p>
                                <p className="mt-1 text-xl font-semibold text-sidebar-foreground">{stats.hiveCount}</p>
                            </div>
                            <div className="rounded-2xl border border-sidebar-border/60 bg-sidebar/55 p-3">
                                <p className="uppercase tracking-[0.22em] text-sidebar-foreground/55">Actions</p>
                                <p className="mt-1 text-xl font-semibold text-sidebar-foreground">{stats.actionCount}</p>
                            </div>
                        </div>
                    </div>
                </SidebarHeader>

                <SidebarContent className="px-2 pb-2">
                    <SidebarGroup className="pt-0">
                        <SidebarMenu>
                            {navigationTabs.map((tab) => {
                                const Icon = ICONS[tab.id] || Hexagon;
                                const isActive = activeTab === tab.id;

                                return (
                                    <SidebarMenuItem key={tab.id}>
                                        <SidebarMenuButton
                                            isActive={isActive}
                                            size="lg"
                                            tooltip={tab.label}
                                            className={cn(
                                                "rounded-2xl px-3 py-3 transition",
                                                isActive
                                                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_12px_30px_-18px_rgba(0,0,0,0.45)]"
                                                    : "hover:bg-sidebar-accent/80"
                                            )}
                                            onClick={() => onTabChange(tab.id)}
                                        >
                                            <Icon className="size-4" />
                                            <span className="font-medium">{tab.label}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroup>

                    <SidebarSeparator />

                    <SidebarGroup className="space-y-2">
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full justify-start rounded-2xl px-3 text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                            onClick={onOpenOnboarding}
                        >
                            <CircleHelp className="size-4" />
                            Guide
                        </Button>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter className="p-4 pt-2">
                    <div className="rounded-[26px] border border-sidebar-border/70 bg-sidebar-accent/35 p-3">
                        <div className="flex items-center gap-3">
                            <Avatar className="size-11 rounded-2xl border border-sidebar-border/60 bg-sidebar-primary/20">
                                <AvatarFallback className="rounded-2xl bg-sidebar-primary/20 text-sm font-semibold text-sidebar-foreground">
                                    {getInitials(user?.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name || "Utilisateur"}</p>
                                <p className="truncate text-xs text-sidebar-foreground/60">{user?.email || "-"}</p>
                                {userNeedsEmailVerification ? (
                                    <Badge variant="outline" className="mt-2 rounded-full border-amber-300/20 bg-amber-300/8 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-amber-50/85">
                                        Email a verifier
                                    </Badge>
                                ) : null}
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                            <Badge variant="secondary" className="rounded-full border-0 bg-sidebar-primary/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/75">
                                {user?.is_admin ? "Admin" : "Terrain"}
                            </Badge>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="ml-auto rounded-xl px-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                onClick={onLogout}
                            >
                                <LogOut className="size-4" />
                                Quitter
                            </Button>
                        </div>
                    </div>
                </SidebarFooter>
            </Sidebar>

            <SidebarInset className="min-h-svh bg-transparent">
                <header
                    className="sticky top-0 z-30 border-b border-border/60 backdrop-blur-xl"
                    style={{ backgroundColor: "hsl(var(--shell-topbar) / 0.82)" }}
                >
                    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 lg:px-8">
                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto]">
                            <div className="flex min-w-0 items-start gap-3 rounded-[30px] border border-border/60 bg-background/78 px-4 py-4 shadow-[0_18px_48px_-38px_rgba(36,28,18,0.35)]">
                                <SidebarTrigger className="mt-1 rounded-xl border border-border/70 bg-background/80 shadow-xs hover:bg-secondary" />
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                                        ApiaryHub
                                    </p>
                                    <h1 className="mt-1 font-display text-3xl leading-tight text-foreground lg:text-4xl">
                                        {currentTabLabel}
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground lg:text-[15px]">
                                        {currentTabDescription}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-[28px] border border-border/60 bg-background/78 p-3 shadow-[0_18px_48px_-38px_rgba(36,28,18,0.35)] xl:min-w-[22rem]">
                                <div className="flex items-center justify-end">
                                    <Button type="button" variant="outline" className="rounded-xl" onClick={onOpenOnboarding}>
                                        <CircleHelp className="size-4" />
                                        Guide
                                    </Button>
                                </div>
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    {summaryBadges.map((label) => (
                                        <Badge
                                            key={label}
                                            variant="outline"
                                            className="justify-center rounded-2xl border-border/70 bg-background/80 px-3 py-2 text-center font-medium"
                                        >
                                            {label}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-4 pb-8 pt-6 lg:px-8">
                    {showVerificationNotice ? (
                        <Alert className="mb-6 rounded-[26px] border-amber-300/30 bg-[linear-gradient(135deg,rgba(254,243,199,0.72),rgba(255,251,235,0.94))] shadow-[0_20px_60px_-42px_rgba(146,107,32,0.35)]">
                            <BellRing className="text-amber-700" />
                            <AlertTitle className="text-amber-900">Validation email requise</AlertTitle>
                            <AlertDescription className="gap-3 text-amber-900/80">
                                <p>Confirme l adresse du compte pour finaliser l acces.</p>
                                <div className="flex flex-wrap gap-2">
                                    <Button type="button" size="sm" className="rounded-xl" onClick={onResendVerification} disabled={verificationBusy}>
                                        Renvoyer
                                    </Button>
                                    <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={onCheckVerification} disabled={verificationBusy}>
                                        J ai valide
                                    </Button>
                                    <Button type="button" size="sm" variant="ghost" className="rounded-xl text-amber-900/80 hover:bg-amber-100/60" onClick={onDismissVerification}>
                                        Masquer
                                    </Button>
                                </div>
                            </AlertDescription>
                        </Alert>
                    ) : null}
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
