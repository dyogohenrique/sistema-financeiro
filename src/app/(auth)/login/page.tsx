import Link from 'next/link';
import LoginForm from './login-form';

export default async function LoginPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl text-center font-semibold">Login</h1>
                <div className="text-sm text-center opacity-85">Dados da sessão: </div>
            </div>
            <LoginForm />
            <div className="mt-6">
                <p>
                    Caso não tenha conta se cadastre aqui:{' '}
                    <Link href="/register" className="underline">
                        Registrar
                    </Link>
                </p>
            </div>
        </div>
    );
}
