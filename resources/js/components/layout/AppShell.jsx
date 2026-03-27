import {
    BellRing,
    BookText,
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

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
    onLogout,
    children,
}) {
    return (
        <SidebarProvider
            defaultOpen
            className="h-svh min-h-0"
            style={{
                "--sidebar-width": "18rem",
                "--sidebar-width-icon": "4rem",
            }}
        >
            <Sidebar
                collapsible="offcanvas"
                variant="inset"
                className="border-r-0 md:top-1 md:bottom-1 md:left-1 md:h-[calc(100svh-0.5rem)]"
            >
                <SidebarHeader className="shrink-0 gap-4 px-4 pb-3 pt-5">
                    <div className="radius-panel border border-sidebar-border/70 bg-sidebar-accent/35 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
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
                            <div className="radius-subpanel border border-sidebar-border/60 bg-sidebar/55 p-3">
                                <p className="uppercase tracking-[0.22em] text-sidebar-foreground/55">Ruches</p>
                                <p className="mt-1 text-xl font-semibold text-sidebar-foreground">{stats.hiveCount}</p>
                            </div>
                            <div className="radius-subpanel border border-sidebar-border/60 bg-sidebar/55 p-3">
                                <p className="uppercase tracking-[0.22em] text-sidebar-foreground/55">Actions</p>
                                <p className="mt-1 text-xl font-semibold text-sidebar-foreground">{stats.actionCount}</p>
                            </div>
                        </div>
                    </div>
                </SidebarHeader>

                <SidebarContent className="min-h-0 overflow-hidden px-0 pb-0">
                    <ScrollArea className="h-full px-2 pb-2">
                        <div className="space-y-2 px-2 pb-4">
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
                                                        "radius-control px-3 py-3 transition",
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
                        </div>
                    </ScrollArea>
                </SidebarContent>

                <SidebarFooter className="shrink-0 p-4 pt-3">
                    <div className="radius-panel border border-sidebar-border/70 bg-sidebar-accent/35 p-3">
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
                            <Button
                                variant="ghost"
                                size="sm"
                                className="radius-control ml-auto px-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                onClick={onLogout}
                            >
                                <LogOut className="size-4" />
                                Quitter
                            </Button>
                        </div>
                    </div>
                </SidebarFooter>
            </Sidebar>

            <SidebarInset className="relative isolate h-full min-h-0 overflow-hidden bg-transparent">
                <div className="relative flex h-full min-h-0 flex-col overflow-hidden border border-border/45 bg-[linear-gradient(180deg,hsl(var(--shell-topbar))/0.8,hsla(43,34%,94%,0.68))] shadow-[0_36px_110px_-78px_rgba(28,22,15,0.58)]">
                    <div className="app-shell-canvas pointer-events-none absolute inset-0 -z-10" />

                    <header className="shrink-0 px-4 pt-4 lg:px-8 lg:pt-5">
                        <div
                            className="radius-shell mx-auto flex w-full max-w-[1600px] flex-col gap-4 border border-border/55 px-3 py-3 shadow-[0_28px_90px_-62px_rgba(36,28,18,0.46)] backdrop-blur-xl"
                            style={{ backgroundColor: "hsl(var(--shell-topbar) / 0.72)" }}
                        >
                            <div className="radius-panel flex min-w-0 items-start gap-3 border border-border/55 bg-[linear-gradient(180deg,hsl(var(--background))/0.88,hsla(43,34%,95%,0.78))] px-4 py-4 shadow-[0_18px_48px_-38px_rgba(36,28,18,0.35)] backdrop-blur-sm">
                                <SidebarTrigger className="radius-control mt-1 border border-border/70 bg-background/80 shadow-xs hover:bg-secondary" />
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
                        </div>
                    </header>

                    <ScrollArea className="min-h-0 flex-1">
                        <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-3 pb-6 pt-4 lg:px-6 lg:pt-5">
                            <div className="relative z-10 flex flex-1 flex-col gap-5">
                                {showVerificationNotice ? (
                                    <Alert className="radius-panel border-amber-300/30 bg-[linear-gradient(135deg,rgba(254,243,199,0.72),rgba(255,251,235,0.94))] shadow-[0_20px_60px_-42px_rgba(146,107,32,0.35)]">
                                        <BellRing className="text-amber-700" />
                                        <AlertTitle className="text-amber-900">Validation email requise</AlertTitle>
                                        <AlertDescription className="gap-3 text-amber-900/80">
                                            <p>Confirme l adresse du compte pour finaliser l acces.</p>
                                            <div className="flex flex-wrap gap-2">
                                                <Button type="button" size="sm" className="radius-control" onClick={onResendVerification} disabled={verificationBusy}>
                                                    Renvoyer
                                                </Button>
                                                <Button type="button" size="sm" variant="outline" className="radius-control" onClick={onCheckVerification} disabled={verificationBusy}>
                                                    J ai valide
                                                </Button>
                                                <Button type="button" size="sm" variant="ghost" className="radius-control text-amber-900/80 hover:bg-amber-100/60" onClick={onDismissVerification}>
                                                    Masquer
                                                </Button>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                ) : null}
                                {children}
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
