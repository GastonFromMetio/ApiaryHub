import { useEffect, useState } from 'react';

export function AccountTab({
    user,
    busy,
    onUpdateAccount,
    onDeleteAccount,
    setError,
}) {
    const [profileForm, setProfileForm] = useState({
        name: '',
        email: '',
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [deleteForm, setDeleteForm] = useState({
        password: '',
        confirmation: '',
    });

    useEffect(() => {
        setProfileForm((previous) => ({
            ...previous,
            name: user?.name ?? '',
            email: user?.email ?? '',
        }));
    }, [user?.name, user?.email]);

    const submitProfile = async (event) => {
        event.preventDefault();
        setError('');

        const payload = {
            name: profileForm.name.trim(),
            email: profileForm.email.trim(),
        };

        if (profileForm.password) {
            payload.current_password = profileForm.current_password;
            payload.password = profileForm.password;
            payload.password_confirmation = profileForm.password_confirmation;
        }

        const updated = await onUpdateAccount(payload);

        if (updated) {
            setProfileForm((previous) => ({
                ...previous,
                current_password: '',
                password: '',
                password_confirmation: '',
            }));
        }
    };

    const submitDelete = async (event) => {
        event.preventDefault();
        setError('');

        if (deleteForm.confirmation !== 'SUPPRIMER') {
            setError('Tape SUPPRIMER pour confirmer la suppression du compte.');
            return;
        }

        if (!window.confirm('Cette action est definitive. Supprimer le compte et toutes les donnees ?')) {
            return;
        }

        await onDeleteAccount(deleteForm);
    };

    return (
        <section className="content-grid two-columns">
            <article className="panel">
                <h2>Mon compte</h2>
                <p className="muted small account-helper">
                    Modifie tes informations personnelles. Le changement de mot de passe exige ton mot de passe actuel.
                </p>
                <form className="form-grid" onSubmit={submitProfile}>
                    <label>
                        Nom complet
                        <input
                            value={profileForm.name}
                            onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })}
                            required
                        />
                    </label>
                    <label>
                        Email
                        <input
                            type="email"
                            value={profileForm.email}
                            onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })}
                            required
                        />
                    </label>
                    <label>
                        Mot de passe actuel
                        <input
                            type="password"
                            value={profileForm.current_password}
                            onChange={(event) => setProfileForm({ ...profileForm, current_password: event.target.value })}
                        />
                    </label>
                    <label>
                        Nouveau mot de passe
                        <input
                            type="password"
                            value={profileForm.password}
                            onChange={(event) => setProfileForm({ ...profileForm, password: event.target.value })}
                        />
                    </label>
                    <label className="full">
                        Confirmation nouveau mot de passe
                        <input
                            type="password"
                            value={profileForm.password_confirmation}
                            onChange={(event) => setProfileForm({ ...profileForm, password_confirmation: event.target.value })}
                        />
                    </label>
                    <div className="row actions full">
                        <button className="btn btn-primary" type="submit" disabled={busy}>
                            Enregistrer mes informations
                        </button>
                    </div>
                </form>
            </article>

            <article className="panel account-danger-zone">
                <h2>Suppression du compte</h2>
                <p className="muted small">
                    Toutes tes donnees seront supprimees: ruchers, ruches, releves, interventions et tokens d&apos;acces.
                </p>
                <form className="form-grid" onSubmit={submitDelete}>
                    <label className="full">
                        Mot de passe actuel
                        <input
                            type="password"
                            value={deleteForm.password}
                            onChange={(event) => setDeleteForm({ ...deleteForm, password: event.target.value })}
                            required
                        />
                    </label>
                    <label className="full">
                        Ecris SUPPRIMER pour confirmer
                        <input
                            value={deleteForm.confirmation}
                            onChange={(event) => setDeleteForm({ ...deleteForm, confirmation: event.target.value })}
                            required
                        />
                    </label>
                    <button className="btn btn-danger" type="submit" disabled={busy}>
                        Supprimer definitivement mon compte
                    </button>
                </form>
            </article>
        </section>
    );
}
