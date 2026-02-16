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
            <div className="hero copy-block panel gradient-panel">
                <p className="kicker">Apiarihub Platform</p>
                <h1>Gestion apicole moderne, connectee en temps reel.</h1>
                <p>
                    Connecte-toi pour piloter tes ruches, suivre les releves capteurs,
                    historiser les interventions et recuperer la meteo de chaque emplacement.
                </p>
            </div>

            <form className="panel form-card" onSubmit={submitAuth}>
                <div className="form-head">
                    <button
                        type="button"
                        className={authMode === 'login' ? 'seg active' : 'seg'}
                        onClick={() => setAuthMode('login')}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        className={authMode === 'register' ? 'seg active' : 'seg'}
                        onClick={() => setAuthMode('register')}
                    >
                        Register
                    </button>
                </div>

                {authMode === 'register' && (
                    <label>
                        Nom
                        <input
                            type="text"
                            value={authForm.name}
                            onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
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
                        required
                    />
                </label>

                <label>
                    Mot de passe
                    <input
                        type="password"
                        value={authForm.password}
                        onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                        required
                    />
                </label>

                {authMode === 'register' && (
                    <label>
                        Confirmation
                        <input
                            type="password"
                            value={authForm.password_confirmation}
                            onChange={(event) => setAuthForm({ ...authForm, password_confirmation: event.target.value })}
                            required
                        />
                    </label>
                )}

                <button className="btn btn-primary" type="submit" disabled={busy}>
                    {authMode === 'login' ? 'Se connecter' : 'Creer un compte'}
                </button>
                <p className="muted small">Compte seed: demo@apiarihub.local / password123</p>
            </form>
        </div>
    );
}
