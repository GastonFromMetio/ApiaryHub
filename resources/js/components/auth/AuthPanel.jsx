import {
    ArrowRight,
    ChartNoAxesCombined,
    FileText,
    KeyRound,
    MapPinned,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FieldBlock } from "@/components/app/app-ui";

const AUTH_FEATURES = [
    {
        title: "Cartographie terrain",
        description: "Ruchers sur carte.",
        icon: MapPinned,
    },
    {
        title: "Journal",
        description: "Historique des interventions.",
        icon: ChartNoAxesCombined,
    },
    {
        title: "Documents",
        description: "Module à venir.",
        icon: FileText,
    },
];

const TITLES = {
    login: "Connexion sécurisée",
    register: "Créer un espace de pilotage",
    forgot: "Retrouver l’accès",
    reset: "Définir un nouveau mot de passe",
    "verify-pending": "Vérification d’email en attente",
};

const DESCRIPTIONS = {
    login: "Accède à ton espace.",
    register: "Crée ton espace de suivi.",
    forgot: "On t’envoie un lien.",
    reset: "Choisis un nouveau mot de passe.",
    "verify-pending": "Confirme ton email pour activer le compte.",
};

const SUBMIT_LABELS = {
    login: "Se connecter",
    register: "Créer mon compte",
    forgot: "Envoyer le lien",
    reset: "Enregistrer le nouveau mot de passe",
};

export function AuthPanel({
    authMode,
    setAuthMode,
    authForm,
    setAuthForm,
    submitAuth,
    resendVerificationEmail,
    busy,
}) {
    const showPrimaryTabs = authMode === "login" || authMode === "register";

    return (
        <div className="grid min-h-[calc(100svh-2rem)] gap-6 lg:grid-cols-[1.15fr_0.92fr]">
            <section className="radius-shell relative overflow-hidden border border-border/70 bg-[linear-gradient(145deg,rgba(21,54,42,0.96),rgba(31,72,56,0.92)_42%,rgba(246,182,74,0.18)_100%)] p-6 text-primary-foreground shadow-[0_40px_120px_-60px_rgba(19,31,24,0.85)] lg:p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,245,214,0.26),transparent_24%),radial-gradient(circle_at_82%_22%,rgba(250,195,87,0.28),transparent_20%),linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.03)_42%,transparent_80%)]" />
                <div className="absolute -left-10 top-16 h-52 w-52 rounded-full border border-white/12 bg-white/6 blur-2xl" />
                <div className="absolute bottom-[-5rem] right-[-2rem] h-64 w-64 rounded-full border border-white/10 bg-amber-200/12 blur-3xl" />

                <div className="relative flex h-full flex-col justify-between gap-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="radius-subpanel flex size-14 items-center justify-center border border-white/15 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                                <img
                                    src="/branding/apiaryhub_logo_seul.png"
                                    alt="ApiaryHub"
                                    className="h-9 w-auto object-contain"
                                />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-foreground/60">
                                    ApiaryHub platform
                                </p>
                                <p className="text-sm text-primary-foreground/78">Ops cockpit pour l’activité apicole</p>
                            </div>
                        </div>

                        <Badge className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-primary-foreground shadow-none">
                            Suivi simple
                        </Badge>

                        <div className="space-y-4">
                            <h1 className="max-w-xl font-display text-4xl leading-[1.05] tracking-tight text-primary-foreground md:text-5xl lg:text-6xl">
                                Pilote tes ruchers simplement.
                            </h1>
                            <p className="max-w-2xl text-base leading-8 text-primary-foreground/76">
                                Carte, ruches, journal et documents au même endroit.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {AUTH_FEATURES.map((feature) => {
                            const Icon = feature.icon;

                            return (
                                <article
                                    key={feature.title}
                                    className="radius-panel border border-white/12 bg-white/8 p-5 backdrop-blur-sm"
                                >
                                    <div className="flex size-11 items-center justify-center rounded-2xl border border-white/12 bg-white/10">
                                        <Icon className="size-5" />
                                    </div>
                                    <h2 className="mt-4 text-lg font-semibold text-primary-foreground">{feature.title}</h2>
                                    <p className="mt-2 text-sm leading-6 text-primary-foreground/70">{feature.description}</p>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </section>

            <div className="flex items-center justify-center">
                <Card className="radius-shell w-full max-w-xl border-border/70 bg-card/92 shadow-[0_30px_100px_-60px_rgba(68,50,20,0.45)] backdrop-blur">
                    <CardHeader className="space-y-4 border-b border-border/60 bg-gradient-to-b from-background to-secondary/35">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                                    Accès sécurisé
                                </p>
                                <CardTitle className="mt-2 font-display text-3xl text-foreground">
                                    {TITLES[authMode] || TITLES.login}
                                </CardTitle>
                            </div>
                            <div className="radius-subpanel flex size-12 items-center justify-center border border-border/70 bg-background shadow-xs">
                                <KeyRound className="size-5 text-foreground" />
                            </div>
                        </div>
                        <CardDescription className="max-w-lg text-sm leading-6 text-muted-foreground">
                            {DESCRIPTIONS[authMode] || DESCRIPTIONS.login}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 lg:p-7">
                        <form className="space-y-5" onSubmit={submitAuth}>
                            {showPrimaryTabs ? (
                                <Tabs value={authMode} onValueChange={setAuthMode} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-secondary/70 p-1">
                                        <TabsTrigger value="login" className="rounded-xl">
                                            Connexion
                                        </TabsTrigger>
                                        <TabsTrigger value="register" className="rounded-xl">
                                            Inscription
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            ) : null}

                            {authMode === "verify-pending" ? (
                                <div className="radius-panel space-y-4 border border-border bg-secondary/45 p-5">
                                    <div className="space-y-2">
                                        <h3 className="font-display text-2xl text-foreground">Encore une étape</h3>
                                        <p className="text-sm leading-6 text-muted-foreground">
                                            Ouvre l’email envoyé à <strong>{authForm.email}</strong> puis confirme le compte.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <Button type="button" className="rounded-xl" onClick={resendVerificationEmail} disabled={busy}>
                                            Renvoyer l’email
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="rounded-xl"
                                            onClick={() => setAuthMode("login")}
                                            disabled={busy}
                                        >
                                            Aller à la connexion
                                            <ArrowRight className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {authMode === "register" ? (
                                        <FieldBlock label="Nom complet">
                                            <Input
                                                type="text"
                                                value={authForm.name}
                                                onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                                                autoComplete="name"
                                                required
                                                className="h-11 rounded-xl"
                                            />
                                        </FieldBlock>
                                    ) : null}

                                    <FieldBlock label="Email">
                                        <Input
                                            type="email"
                                            value={authForm.email}
                                            onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                                            autoComplete="email"
                                            required
                                            className="h-11 rounded-xl"
                                        />
                                    </FieldBlock>

                                    {authMode !== "forgot" ? (
                                        <FieldBlock label={authMode === "reset" ? "Nouveau mot de passe" : "Mot de passe"}>
                                            <Input
                                                type="password"
                                                value={authForm.password}
                                                onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                                                autoComplete={authMode === "login" ? "current-password" : "new-password"}
                                                required
                                                className="h-11 rounded-xl"
                                            />
                                        </FieldBlock>
                                    ) : null}

                                    {authMode === "register" || authMode === "reset" ? (
                                        <FieldBlock label="Confirmation du mot de passe">
                                            <Input
                                                type="password"
                                                value={authForm.password_confirmation}
                                                onChange={(event) => setAuthForm({ ...authForm, password_confirmation: event.target.value })}
                                                autoComplete="new-password"
                                                required
                                                className="h-11 rounded-xl"
                                            />
                                        </FieldBlock>
                                    ) : null}

                                    <div className="flex flex-col gap-3 pt-2">
                                        <Button className="h-11 rounded-xl" type="submit" disabled={busy}>
                                            {SUBMIT_LABELS[authMode] || SUBMIT_LABELS.login}
                                            <ArrowRight className="size-4" />
                                        </Button>

                                        {authMode === "login" ? (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="rounded-xl text-muted-foreground hover:text-foreground"
                                                onClick={() => setAuthMode("forgot")}
                                                disabled={busy}
                                            >
                                                Mot de passe oublié ?
                                            </Button>
                                        ) : null}

                                        {authMode === "forgot" || authMode === "reset" ? (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="rounded-xl"
                                                onClick={() => setAuthMode("login")}
                                                disabled={busy}
                                            >
                                                Retour a la connexion
                                            </Button>
                                        ) : null}
                                    </div>
                                </>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
