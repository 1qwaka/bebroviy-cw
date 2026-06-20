import { getConfig } from "../config/get-config";

export const Login = () => {
    const handleLogin = () => {
        const { clientId, idpUrl } = getConfig();
        const redirectUri = encodeURIComponent(window.location.origin + '/callback');
        const scope = encodeURIComponent('openid profile email');

        window.location.href = `${idpUrl}/auth/authorize?response_type=code`
                             + `&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50">
            <div className="max-w-sm w-full bg-white border border-zinc-200 p-8">
                <h1 className="text-xl font-semibold mb-6">Вход в систему</h1>
                <button
                    onClick={handleLogin}
                    className="w-full bg-black text-white py-2.5 px-4 text-sm font-medium hover:bg-zinc-800 transition-colors"
                >
                    Войти через IDP
                </button>
            </div>
        </div>
    );
};