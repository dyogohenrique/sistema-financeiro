import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(amount / 100);
}

export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR').format(date);
}

export function generateId(): string {
    return crypto.randomUUID();
}