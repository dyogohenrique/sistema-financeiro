import { MdAlternateEmail } from "react-icons/md";
import { FaKey } from "react-icons/fa";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div>
        <div>
            <h1 className="text-3xl text-center font-semibold">Login</h1>
            <p className="text-md text-center opacity-85">Utilize seu email e senha cadastrados para entrar</p>
        </div>
        <form className="h-full flex flex-col justify-center items-center gap-6 my-10">
            <div className="w-full">
                <label className='input w-full'>
                    <MdAlternateEmail />
                    <input type="email" name="email" id="email" placeholder="Digite seu Email" required className="w-full"/>
                </label>
            </div>
            <div className="w-full">
                <label className='input w-full'>
                    <FaKey />
                    <input type="password" name="password" id="password" placeholder="Digite sua senha" required className="w-full"/>
                </label>
            </div>
            <button type="submit" className="btn btn-primary btn-wide">Entrar</button>
        </form>
        <div>
            <p>Caso não tenha conta se cadastre aqui: <Link href="/register" className="underline">Registrar</Link></p>
        </div>
    </div>
  )
}
