const AUTH_FEATURES = [
    'Ruchers geolocalises et suivi multi-sites',
    'Historique capteurs et interventions',
    'Meteo contextuelle par zone',
];

const TITLES = {
    login: 'Connexion securisee',
    register: 'Creation de compte',
    forgot: 'Mot de passe oublie',
    reset: 'Reinitialiser le mot de passe',
    'verify-pending': 'Verification de ton email',
};

const DESCRIPTIONS = {
    login: 'Reprends ton suivi des ruchers en quelques secondes.',
    register: 'Demarre ta gestion apicole connectee.',
    forgot: 'On t\'envoie un lien de reinitialisation par email.',
    reset: 'Definis ton nouveau mot de passe pour recuperer ton acces.',
    'verify-pending': 'Un email de confirmation vient d\'etre envoye. Verifie ta boite de reception.',
};

const SUBMIT_LABELS = {
    login: 'Se connecter',
    register: 'Creer mon compte',
    forgot: 'Envoyer le lien de reinitialisation',
    reset: 'Reinitialiser mon mot de passe',
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
    return (
        <div className="auth-shell">
            <section className="panel auth-hero gradient-panel">
                <img
                    className="auth-brand-logo"
                    src="/branding/apiaryhub_logo_complet.png"
                    alt="ApiaryHub"
                />
                <p className="kicker">ApiaryHub Platform</p>
                <h1>Supervise ton activite apicole avec precision.</h1>
                <p className="auth-hero-copy">
                    Centralise tes ruchers, localise chaque ruche et pilote les operations terrain
                    depuis une interface claire, rapide et orientee donnees.
                </p>
                <div className="auth-feature-grid">
                    {AUTH_FEATURES.map((feature) => (
                        <article className="auth-feature-card" key={feature}>
                            <span className="auth-feature-dot" aria-hidden="true" />
                            <p>{feature}</p>
                        </article>
                    ))}
                </div>
            </section>

            <form className="panel auth-card" onSubmit={submitAuth}>
                <header className="auth-card-header">
                    <h2>{TITLES[authMode] || TITLES.login}</h2>
                    <p className="muted small">{DESCRIPTIONS[authMode] || DESCRIPTIONS.login}</p>
                </header>

                {authMode === 'verify-pending' && (
                    <article className="auth-tunnel-card">
                        <h3>Etape suivante</h3>
                        <p className="muted small">
                            Ouvre l&apos;email <strong>{authForm.email}</strong>, clique sur le lien, puis connecte-toi.
                        </p>
                        <div className="row actions auth-links-row">
                            <button
                                type="button"
                                className="btn"
                                onClick={resendVerificationEmail}
                                disabled={busy}
                            >
                                Renvoyer l&apos;email
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setAuthMode('login')}
                                disabled={busy}
                            >
                                Aller a la connexion
                            </button>
                        </div>
                    </article>
                )}

                {authMode !== 'forgot' && authMode !== 'reset' && authMode !== 'verify-pending' && (
                    <div className="form-head auth-switch">
                        <button
                            type="button"
                            className={authMode === 'login' ? 'seg active' : 'seg'}
                            onClick={() => setAuthMode('login')}
                            aria-pressed={authMode === 'login'}
                        >
                            Connexion
                        </button>
                        <button
                            type="button"
                            className={authMode === 'register' ? 'seg active' : 'seg'}
                            onClick={() => setAuthMode('register')}
                            aria-pressed={authMode === 'register'}
                        >
                            Inscription
                        </button>
                    </div>
                )}

                {authMode === 'register' && (
                    <label>
                        Nom
                        <input
                            type="text"
                            value={authForm.name}
                            onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                            autoComplete="name"
                            required
                        />
                    </label>
                )}

                {authMode !== 'verify-pending' && (
                    <label>
                        Email
                        <input
                            type="email"
                            value={authForm.email}
                            onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                            autoComplete="email"
                            required
                        />
                    </label>
                )}

                {authMode !== 'forgot' && authMode !== 'verify-pending' && (
                    <label>
                        {authMode === 'reset' ? 'Nouveau mot de passe' : 'Mot de passe'}
                        <input
                            type="password"
                            value={authForm.password}
                            onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                            autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                            required
                        />
                    </label>
                )}

                {(authMode === 'register' || authMode === 'reset') && (
                    <label>
                        Confirmation mot de passe
                        <input
                            type="password"
                            value={authForm.password_confirmation}
                            onChange={(event) => setAuthForm({ ...authForm, password_confirmation: event.target.value })}
                            autoComplete="new-password"
                            required
                        />
                    </label>
                )}

                {authMode !== 'verify-pending' && (
                    <button className="btn btn-primary auth-submit" type="submit" disabled={busy}>
                        {SUBMIT_LABELS[authMode] || SUBMIT_LABELS.login}
                    </button>
                )}

                {authMode === 'login' && (
                    <div className="row actions auth-links-row">
                        <button
                            type="button"
                            className="btn btn-soft"
                            onClick={() => setAuthMode('forgot')}
                            disabled={busy}
                        >
                            Mot de passe oublie ?
                        </button>
                    </div>
                )}

                {(authMode === 'forgot' || authMode === 'reset') && (
                    <button
                        type="button"
                        className="btn"
                        onClick={() => setAuthMode('login')}
                        disabled={busy}
                    >
                        Retour connexion
                    </button>
                )}

                <p className="muted small">Demo: demo@apiaryhub.local</p>
            </form>
        </div>
    );
}
