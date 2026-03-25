import { useEffect, useMemo, useState } from "react";
import {
    ArrowRight,
    BookText,
    CheckCircle2,
    CircleHelp,
    Compass,
    Hexagon,
    LayoutDashboard,
    MapPinned,
    ShieldAlert,
    ShieldCheck,
    UserRound,
    X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const USER_STEPS = [
    {
        title: "1. Structure ton terrain",
        detail: "Cree un rucher puis ajoute tes ruches.",
    },
    {
        title: "2. Saisis sur le terrain",
        detail: "Enregistre un releve ou une intervention.",
    },
    {
        title: "3. Controle le suivi",
        detail: "Relis l historique et la tracabilite.",
    },
];

const USER_PAGES = [
    {
        id: "field",
        title: "Terrain",
        eyebrow: "Saisir",
        icon: LayoutDashboard,
        utility: "Mesures et interventions depuis le terrain.",
        action: "Choisis une ruche puis ajoute un releve ou une intervention.",
        outcome: "Tu gardes une trace exploitable de ce qui vient d etre fait ou observe.",
        checklist: [
            "Selectionne le rucher puis la ruche",
            "Ajoute une mesure ou une intervention",
            "Passe ensuite au journal pour verifier le flux",
        ],
    },
    {
        id: "apiaries",
        title: "Ruchers",
        eyebrow: "Structurer",
        icon: MapPinned,
        utility: "Sites, ruches et carte en un seul espace.",
        action: "Cree un rucher, place-le sur la carte puis ajoute ses ruches.",
        outcome: "La base terrain devient claire, localisee et simple a filtrer.",
        checklist: [
            "Nommer le rucher et poser sa position",
            "Ajouter les ruches rattachees au site",
            "Verifier rapidement les statuts et notes",
        ],
    },
    {
        id: "journal",
        title: "Journal",
        eyebrow: "Relire",
        icon: BookText,
        utility: "Historique filtre des mesures et actions.",
        action: "Filtre par rucher, ruche ou type pour relire les dernieres entrees.",
        outcome: "Tu controles vite ce qui a deja ete saisi et ce qui manque.",
        checklist: [
            "Filtrer les entrees utiles",
            "Verifier la chronologie recente",
            "Revenir au terrain pour completer si besoin",
        ],
    },
    {
        id: "compliance",
        title: "Conformite",
        eyebrow: "Tracer",
        icon: ShieldCheck,
        utility: "Vision rapide des traces manquantes.",
        action: "Repere les ruches sans intervention et les points de vigilance du registre.",
        outcome: "Tu identifies ce qui doit etre saisi pour garder une tracabilite propre.",
        checklist: [
            "Repere les ruches sans trace",
            "Controle les traitements et recoltes reperes",
            "Passe par le terrain pour completer les manques",
        ],
    },
    {
        id: "account",
        title: "Compte",
        eyebrow: "Securiser",
        icon: UserRound,
        utility: "Profil, email et mot de passe.",
        action: "Verifie ton email puis mets a jour tes informations de compte.",
        outcome: "Ton acces reste securise et les notifications arrivent au bon endroit.",
        checklist: [
            "Confirmer l email du compte",
            "Mettre a jour le nom si besoin",
            "Changer le mot de passe si necessaire",
        ],
    },
];

const ADMIN_STEPS = [
    {
        title: "1. Controle la plateforme",
        detail: "Vue globale, comptes, ruchers et activite.",
    },
    {
        title: "2. Filtre les volumes",
        detail: "Isole un rucher pour lire l activite.",
    },
    {
        title: "3. Securise le compte",
        detail: "Email, mot de passe et acces.",
    },
];

const ADMIN_PAGES = [
    {
        id: "admin",
        title: "Administration",
        eyebrow: "Piloter",
        icon: Hexagon,
        utility: "Vue globale des comptes, ruchers et volumes.",
        action: "Commence ici pour controler l activite et filtrer un rucher.",
        outcome: "Tu vois vite la sante globale de la plateforme et les zones a surveiller.",
        checklist: [
            "Lire les volumes clefs",
            "Filtrer un rucher si besoin",
            "Controler les creations recentes",
        ],
    },
    {
        id: "account",
        title: "Compte",
        eyebrow: "Securiser",
        icon: UserRound,
        utility: "Profil, email et securite.",
        action: "Verifie l email puis garde le compte admin a jour.",
        outcome: "L acces admin reste propre, identifiable et securise.",
        checklist: [
            "Confirmer l email admin",
            "Mettre a jour les informations du profil",
            "Changer le mot de passe si necessaire",
        ],
    },
];

export function OnboardingDialog({
    open,
    onOpenChange,
    isAdmin,
    onNavigate,
    currentTab,
    userNeedsEmailVerification,
}) {
    const steps = isAdmin ? ADMIN_STEPS : USER_STEPS;
    const pages = isAdmin ? ADMIN_PAGES : USER_PAGES;
    const defaultTab = isAdmin ? "admin" : "field";
    const initialPageId = useMemo(
        () => pages.find((page) => page.id === currentTab)?.id || defaultTab,
        [currentTab, defaultTab, pages]
    );
    const [selectedPageId, setSelectedPageId] = useState(initialPageId);
    const selectedPage = pages.find((page) => page.id === selectedPageId) || pages[0];
    const SelectedIcon = selectedPage?.icon || CircleHelp;

    useEffect(() => {
        if (open) {
            setSelectedPageId(initialPageId);
        }
    }, [initialPageId, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPortal>
                <DialogOverlay
                    className="bg-black/62 backdrop-blur-md"
                    style={{
                        backgroundImage: "radial-gradient(circle at top, rgba(236, 191, 86, 0.16), transparent 20%), linear-gradient(180deg, rgba(18,27,21,0.78), rgba(18,27,21,0.86))",
                    }}
                />
                <DialogContent
                    showCloseButton={false}
                    className="h-[min(92svh,960px)] max-w-[min(96vw,1380px)] gap-0 overflow-hidden rounded-[36px] border-border/70 bg-background/98 p-0 shadow-[0_55px_160px_-68px_rgba(18,27,21,0.8)]"
                >
                    <div className="grid h-full min-h-0 lg:grid-cols-[minmax(340px,0.88fr)_minmax(0,1.12fr)]">
                        <section
                            className="relative flex min-h-0 flex-col overflow-hidden border-b border-white/10 p-6 text-primary-foreground lg:border-b-0 lg:border-r lg:border-r-white/10 lg:p-8"
                            style={{
                                backgroundImage: "radial-gradient(circle at top left, rgba(236, 191, 86, 0.22), transparent 24%), radial-gradient(circle at 82% 18%, rgba(255, 255, 255, 0.08), transparent 18%), linear-gradient(160deg, rgba(18,27,21,0.98), rgba(24,38,30,0.92))",
                            }}
                        >
                            <div className="absolute -right-24 top-16 size-56 rounded-full bg-white/6 blur-3xl" />
                            <div className="absolute -left-14 bottom-8 size-44 rounded-full bg-amber-300/12 blur-3xl" />

                            <div className="relative z-10 flex items-start justify-between gap-4">
                                <Badge className="rounded-full border-0 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-primary-foreground shadow-none">
                                    Experience guidee
                                </Badge>
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="rounded-2xl border border-white/12 bg-white/6 text-primary-foreground hover:bg-white/12 hover:text-primary-foreground"
                                    onClick={() => onOpenChange(false)}
                                >
                                    <X className="size-4" />
                                    <span className="sr-only">Fermer</span>
                                </Button>
                            </div>

                            <DialogHeader className="relative z-10 mt-8 text-left">
                                <DialogTitle className="max-w-md font-display text-4xl leading-tight text-primary-foreground lg:text-5xl">
                                    Bienvenue dans ApiaryHub
                                </DialogTitle>
                                <DialogDescription className="mt-4 max-w-md text-base leading-7 text-primary-foreground/78">
                                    Une prise en main immersive pour comprendre l app, savoir ou commencer et agir sans chercher.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="relative z-10 mt-8 rounded-[30px] border border-white/12 bg-white/7 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-11 items-center justify-center rounded-2xl border border-white/12 bg-white/10">
                                        <Compass className="size-5 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground/68">
                                            Parcours conseille
                                        </p>
                                        <p className="mt-1 text-sm text-primary-foreground/76">
                                            Trois reperes pour demarrer dans le bon ordre.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-5 grid gap-3">
                                    {steps.map((step, index) => (
                                        <article key={step.title} className="rounded-[24px] border border-white/10 bg-black/10 p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/12 text-sm font-semibold text-primary-foreground">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <h2 className="text-base font-semibold text-primary-foreground">{step.title}</h2>
                                                    <p className="mt-1 text-sm leading-6 text-primary-foreground/72">{step.detail}</p>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </div>

                            <div className="relative z-10 mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                <article className="rounded-[26px] border border-white/12 bg-white/7 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground/68">Espaces clefs</p>
                                    <p className="mt-3 font-display text-4xl text-primary-foreground">{pages.length}</p>
                                    <p className="mt-2 text-sm leading-6 text-primary-foreground/72">
                                        Chaque page a un role clair et une premiere action simple.
                                    </p>
                                </article>

                                <article className="rounded-[26px] border border-white/12 bg-white/7 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground/68">Etat du compte</p>
                                    <p className="mt-3 text-lg font-semibold text-primary-foreground">
                                        {userNeedsEmailVerification ? "Email a confirmer" : "Pret a l emploi"}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-primary-foreground/72">
                                        {userNeedsEmailVerification
                                            ? "Le rappel reste visible dans l app. Tu peux avancer puis confirmer l email quand le mail arrive."
                                            : "Le compte est pret. Tu peux commencer tout de suite."}
                                    </p>
                                </article>
                            </div>

                            <div className="relative z-10 mt-auto rounded-[30px] border border-white/12 bg-white/8 p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground/68">Point de depart</p>
                                <div className="mt-3 flex items-center gap-3">
                                    <div className="flex size-12 items-center justify-center rounded-2xl border border-white/12 bg-white/10">
                                        <SelectedIcon className="size-5 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold text-primary-foreground">{selectedPage.title}</p>
                                        <p className="text-sm text-primary-foreground/72">{selectedPage.action}</p>
                                    </div>
                                </div>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        className="rounded-xl bg-primary-foreground text-primary hover:bg-primary-foreground/92"
                                        onClick={() => {
                                            onNavigate(selectedPage.id);
                                            onOpenChange(false);
                                        }}
                                    >
                                        Ouvrir {selectedPage.title}
                                        <ArrowRight className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="rounded-xl border border-white/12 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
                                        onClick={() => onOpenChange(false)}
                                    >
                                        Plus tard
                                    </Button>
                                </div>
                            </div>
                        </section>

                        <section
                            className="min-h-0 overflow-y-auto"
                            style={{
                                backgroundImage: "linear-gradient(180deg, rgba(255,252,245,0.98), rgba(250,246,236,0.92))",
                            }}
                        >
                            <div className="p-6 lg:p-8">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                    <div>
                                        <Badge className="rounded-full bg-primary/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary shadow-none">
                                            Pages et actions
                                        </Badge>
                                        <h2 className="mt-4 font-display text-3xl text-foreground lg:text-4xl">
                                            Prends tes reperes
                                        </h2>
                                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground lg:text-[15px]">
                                            Choisis une page pour voir a quoi elle sert, ce qu il faut y faire et comment avancer ensuite.
                                        </p>
                                    </div>
                                    {userNeedsEmailVerification ? (
                                        <div className="flex items-start gap-3 rounded-[24px] border border-amber-300/40 bg-amber-50/85 px-4 py-3 text-sm text-amber-900 shadow-[0_18px_40px_-34px_rgba(146,107,32,0.4)]">
                                            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                                            <p>
                                                Continue normalement. La verification email reste un rappel, pas un blocage.
                                            </p>
                                        </div>
                                    ) : null}
                                </div>

                                <div className="mt-6 grid gap-3 xl:grid-cols-2">
                                    {pages.map((page, index) => {
                                        const Icon = page.icon;
                                        const isSelected = page.id === selectedPage.id;

                                        return (
                                            <button
                                                key={page.id}
                                                type="button"
                                                className={cn(
                                                    "rounded-[28px] border p-4 text-left transition duration-200",
                                                    isSelected
                                                        ? "border-primary/35 bg-background shadow-[0_22px_55px_-42px_rgba(31,73,57,0.42)]"
                                                        : "border-border/70 bg-background/82 hover:border-primary/25 hover:bg-background"
                                                )}
                                                onClick={() => setSelectedPageId(page.id)}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={cn(
                                                        "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                                                        isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                                                    )}>
                                                        {index + 1}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-secondary/45">
                                                                <Icon className="size-5 text-foreground" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                                                    {page.eyebrow}
                                                                </p>
                                                                <h3 className="mt-1 text-xl font-semibold text-foreground">{page.title}</h3>
                                                            </div>
                                                        </div>
                                                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{page.utility}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <article className="mt-6 rounded-[34px] border border-border/70 bg-background/88 p-6 shadow-[0_28px_80px_-54px_rgba(39,31,21,0.36)] lg:p-7">
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="max-w-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-14 items-center justify-center rounded-[22px] border border-border/70 bg-secondary/45">
                                                    <SelectedIcon className="size-6 text-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                                        {selectedPage.eyebrow}
                                                    </p>
                                                    <h3 className="mt-1 font-display text-3xl text-foreground">
                                                        {selectedPage.title}
                                                    </h3>
                                                </div>
                                            </div>
                                            <p className="mt-5 text-base leading-7 text-muted-foreground">
                                                {selectedPage.utility}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/6 px-3 py-1.5 text-primary">
                                            Action concrete
                                        </Badge>
                                    </div>

                                    <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                                        <div className="rounded-[28px] border border-border/70 bg-secondary/35 p-5">
                                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">A faire ici</p>
                                            <p className="mt-3 text-lg font-semibold leading-8 text-foreground">
                                                {selectedPage.action}
                                            </p>
                                            <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                                {selectedPage.outcome}
                                            </p>
                                        </div>

                                        <div className="rounded-[28px] border border-border/70 bg-background p-5">
                                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Checklist rapide</p>
                                            <div className="mt-4 grid gap-3">
                                                {selectedPage.checklist.map((item) => (
                                                    <div key={item} className="flex items-start gap-3 rounded-[22px] border border-border/60 bg-secondary/30 p-4">
                                                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                                                        <p className="text-sm leading-6 text-foreground">{item}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
                                            Fermer
                                        </Button>
                                        <Button
                                            type="button"
                                            className="rounded-xl"
                                            onClick={() => {
                                                onNavigate(selectedPage.id);
                                                onOpenChange(false);
                                            }}
                                        >
                                            Ouvrir {selectedPage.title}
                                            <ArrowRight className="size-4" />
                                        </Button>
                                    </div>
                                </article>
                            </div>
                        </section>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
}
