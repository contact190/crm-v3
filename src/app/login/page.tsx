"use server";

import LoginForm from "./LoginForm";

export default async function LoginPage() {
    return (
        <main className="login-container">
            <style dangerouslySetInnerHTML={{
                __html: `
                .login-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: radial-gradient(circle at top left, #1a1a2e, #16213e);
                    padding: 20px;
                }
                .login-card {
                    width: 400px;
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 24px;
                    padding: 40px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
                .login-header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .login-logo {
                    font-size: 2rem;
                    font-weight: 800;
                    letter-spacing: -1px;
                    background: linear-gradient(to right, #60a5fa, #a855f7);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 10px;
                }
                .login-subtitle {
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 0.9rem;
                }
            `}} />

            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">SINA CRM</div>
                    <div className="login-subtitle">Connectez-vous à votre espace entreprise</div>
                </div>

                <LoginForm />
            </div>
        </main>
    );
}
