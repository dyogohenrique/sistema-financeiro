import Link from 'next/link';
import RegisterForm from './register-form';
import { redirect } from 'next/navigation';
import { auth } from 'auth';

export default async function RegisterPage() {
    return (
        <div>
            <div>
                <h1 className="text-3xl text-center font-semibold">Registrar</h1>
            </div>
            <RegisterForm />
            <div>
                <p>
                    Caso já tenha conta entre aqui:{' '}
                    <Link href="/login" className="underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
