'use client';

import Form from 'next/form';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { FaKey } from 'react-icons/fa';
import { MdAlternateEmail } from 'react-icons/md';
import { loginAction } from './loginActions';

export default function LoginForm() {
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(loginAction, null);

    useEffect(() => {
        if (state?.success && state.url) {
            router.push(state.url);
            router.refresh();
        }
    }, [state, router]);

    return (
        <>
            {state?.message && <p className="text-red-500 text-sm py-2">{state.message}</p>}
            <Form
                action={formAction}
                className="h-full flex flex-col justify-center items-center gap-6"
            >
                <div className="w-full">
                    <label className="input w-full">
                        <MdAlternateEmail />
                        <input
                            type="text"
                            name="email"
                            id="email"
                            placeholder="Digite seu Email"
                            required
                            className="w-full"
                        />
                    </label>
                </div>
                <div className="w-full">
                    <label className="input w-full">
                        <FaKey />
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Digite sua senha"
                            required
                            className="w-full"
                        />
                    </label>
                </div>

                {isPending ? (
                    <button type="submit" className="btn btn-primary btn-wide" disabled={true}>
                        Entrando <span className="loading loading-dots loading-xs"></span>
                    </button>
                ) : (
                    <button type="submit" className="btn btn-primary btn-wide">
                        Entrar
                    </button>
                )}
            </Form>
        </>
    );
}
