import { compareSync } from 'bcrypt-ts';
import { User } from 'next-auth';
import { prisma } from '../prisma';

type AuthUser = User & {
    name: string;
    email: string;
};

export async function findUserByCredentials(
    email: string,
    password: string
): Promise<AuthUser | null> {
    const user = await prisma.user.findFirst({
        where: {
            email: email,
        },
    });

    if (!user) {
        return null;
    }

    if (!user.ativo) {
        return null;
    }

    const passwordsMatch = compareSync(password, user.password);

    if (passwordsMatch) {
        return {
            email: user.email,
            name: user.name,
        }
    }

    return null;
}
