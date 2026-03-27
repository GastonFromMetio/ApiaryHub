import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldBlock, SectionCard, StatusBadge } from "@/components/app/app-ui";

export function AccountTab({
    user,
    busy,
    onUpdateAccount,
    onDeleteAccount,
    setError,
}) {
    const [profileForm, setProfileForm] = useState({
        name: "",
        email: "",
        current_password: "",
        password: "",
        password_confirmation: "",
    });
    const [deleteForm, setDeleteForm] = useState({
        password: "",
        confirmation: "",
    });

    useEffect(() => {
        setProfileForm((previous) => ({
            ...previous,
            name: user?.name ?? "",
            email: user?.email ?? "",
        }));
    }, [user?.name, user?.email]);

    const submitProfile = async (event) => {
        event.preventDefault();
        setError("");

        const payload = {
            name: profileForm.name.trim(),
            email: profileForm.email.trim(),
        };
        const emailChanged = payload.email !== (user?.email ?? "");
        const passwordChanged = Boolean(profileForm.password);
        const requiresCurrentPassword = emailChanged || passwordChanged;

        if (requiresCurrentPassword && !profileForm.current_password) {
            setError("Saisis ton mot de passe actuel pour confirmer ce changement.");
            return;
        }

        if (requiresCurrentPassword) {
            payload.current_password = profileForm.current_password;
        }

        if (passwordChanged) {
            payload.password = profileForm.password;
            payload.password_confirmation = profileForm.password_confirmation;
        }

        const updated = await onUpdateAccount(payload);

        if (updated) {
            setProfileForm((previous) => ({
                ...previous,
                current_password: "",
                password: "",
                password_confirmation: "",
            }));
        }
    };

    const submitDelete = async (event) => {
        event.preventDefault();
        setError("");

        if (deleteForm.confirmation !== "SUPPRIMER") {
            setError("Tape SUPPRIMER pour confirmer la suppression du compte.");
            return;
        }

        if (!window.confirm("Cette action est definitive. Supprimer le compte et toutes les donnees ?")) {
            return;
        }

        await onDeleteAccount(deleteForm);
    };

    return (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)]">
            <SectionCard
                title="Mon compte"
                description="Profil et mot de passe."
                action={<StatusBadge variant="secondary">{user?.is_admin ? "Admin" : "Utilisateur"}</StatusBadge>}
            >
                <form className="grid gap-5" onSubmit={submitProfile}>
                    <div className="grid gap-4 md:grid-cols-2">
                        <FieldBlock label="Nom complet">
                            <Input
                                value={profileForm.name}
                                onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })}
                                className="h-11 rounded-xl"
                                required
                            />
                        </FieldBlock>
                        <FieldBlock label="Email">
                            <Input
                                type="email"
                                value={profileForm.email}
                                onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })}
                                className="h-11 rounded-xl"
                                required
                            />
                        </FieldBlock>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <FieldBlock label="Mot de passe actuel">
                            <Input
                                type="password"
                                value={profileForm.current_password}
                                onChange={(event) => setProfileForm({ ...profileForm, current_password: event.target.value })}
                                className="h-11 rounded-xl"
                            />
                        </FieldBlock>
                        <FieldBlock label="Nouveau mot de passe">
                            <Input
                                type="password"
                                value={profileForm.password}
                                onChange={(event) => setProfileForm({ ...profileForm, password: event.target.value })}
                                className="h-11 rounded-xl"
                            />
                        </FieldBlock>
                    </div>

                    <FieldBlock label="Confirmation du nouveau mot de passe">
                        <Input
                            type="password"
                            value={profileForm.password_confirmation}
                            onChange={(event) => setProfileForm({ ...profileForm, password_confirmation: event.target.value })}
                            className="h-11 rounded-xl"
                        />
                    </FieldBlock>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button className="rounded-xl" type="submit" disabled={busy}>
                            Enregistrer mes informations
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            Les changements d email ou de mot de passe demandent maintenant le mot de passe actuel et renouvellent la session.
                        </p>
                    </div>
                </form>
            </SectionCard>

            <SectionCard
                title="Suppression du compte"
                description="Suppression definitive."
                action={<StatusBadge className="bg-destructive/10 text-destructive">Zone sensible</StatusBadge>}
            >
                <form className="grid gap-5" onSubmit={submitDelete}>
                    <FieldBlock label="Mot de passe actuel">
                        <Input
                            type="password"
                            value={deleteForm.password}
                            onChange={(event) => setDeleteForm({ ...deleteForm, password: event.target.value })}
                            className="h-11 rounded-xl"
                            required
                        />
                    </FieldBlock>
                    <FieldBlock
                        label="Ecris SUPPRIMER pour confirmer"
                        hint="Cette verification limite les suppressions accidentelles."
                    >
                        <Input
                            value={deleteForm.confirmation}
                            onChange={(event) => setDeleteForm({ ...deleteForm, confirmation: event.target.value })}
                            className="h-11 rounded-xl"
                            required
                        />
                    </FieldBlock>
                    <Button className="rounded-xl" variant="destructive" type="submit" disabled={busy}>
                        Supprimer definitivement mon compte
                    </Button>
                </form>
            </SectionCard>
        </section>
    );
}
