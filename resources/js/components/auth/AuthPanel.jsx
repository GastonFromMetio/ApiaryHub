const AUTH_FEATURES = [
    'Ruchers geolocalises et suivi multi-sites',
    'Historique capteurs et interventions',
    'Meteo contextuelle par zone',
];

export function AuthPanel({
    authMode,
    setAuthMode,
    authForm,
    setAuthForm,
    submitAuth,
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
                    <h2>{authMode === 'login' ? 'Connexion securisee' : 'Creation de compte'}</h2>
                    <p className="muted small">
                        {authMode === 'login'
                            ? 'Reprends ton suivi des ruchers en quelques secondes.'
                            : 'Demarre ta gestion apicole connectee.'}
                    </p>
                </header>

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

                <label>
                    Mot de passe
                    <input
                        type="password"
                        value={authForm.password}
                        onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                        autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                        required
                    />
                </label>

                {authMode === 'register' && (
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

                <button className="btn btn-primary auth-submit" type="submit" disabled={busy}>
                    {authMode === 'login' ? 'Se connecter' : 'Creer mon compte'}
                </button>
                <p className="muted small">Compte demo: demo@apiaryhub.local / password123</p>
            </form>
        </div>
    );
}
