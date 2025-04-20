'use client';

import Form from 'next/form';
import { useActionState, useState } from 'react';

import { FaKey } from 'react-icons/fa';
import { MdAlternateEmail, MdPerson } from 'react-icons/md';

import registerAction from './registerActions';

export default function RegisterForm() {
    const [state, formAction, isPending] = useActionState(registerAction, null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Form
            className="h-full flex flex-col justify-center items-center gap-6 my-10"
            action={formAction}
        >
            <div className="w-full">
                <label className={`input w-full ${state?.name ? 'border-red-500' : ''}`}>
                    <MdPerson />
                    <input
                        type="text"
                        name="name"
                        id="name"
                        placeholder="Digite seu nome"
                        className="w-full"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </label>
                {state?.name && <p className="text-red-500 text-sm">{state.name}</p>}
            </div>
            <div className="w-full">
                <label className={`input w-full ${state?.email ? 'border-red-500' : ''}`}>
                    <MdAlternateEmail />
                    <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Digite seu Email"
                        className="w-full"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </label>
                {state?.email && <p className="text-red-500 text-sm">{state.email}</p>}
            </div>
            <div className="w-full">
                <label className={`input w-full ${state?.password ? 'border-red-500' : ''}`}>
                    <FaKey />
                    <input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Digite sua senha"
                        className="w-full"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </label>
                {state?.password && <p className="text-red-500 text-sm">{state.password}</p>}
            </div>
            <button type="submit" className="btn btn-primary btn-wide" disabled={isPending}>
                {isPending ? 'Registrando...' : 'Registrar'}
            </button>
        </Form>
    );
}
