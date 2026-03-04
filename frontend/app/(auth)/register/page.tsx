'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register(email, password, displayName);
      router.push('/app');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-bg-surface border border-border rounded-card p-8">
      <h1 className="font-heading text-2xl font-bold text-text-primary mb-1">
        Cr&eacute;er un compte
      </h1>
      <p className="text-text-secondary text-sm mb-8">
        Rejoignez-nous pour organiser vos t&acirc;ches.
      </p>

      {error && (
        <div className="bg-priority-high/10 border border-priority-high/20 text-priority-high text-sm rounded-input px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="displayName"
            className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider"
          >
            Nom
          </label>
          <input
            id="displayName"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-bg-surface-alt border border-border rounded-input px-4 py-3 text-text-primary placeholder:text-text-secondary/50 transition-colors focus:border-accent"
            placeholder="Votre nom"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-bg-surface-alt border border-border rounded-input px-4 py-3 text-text-primary placeholder:text-text-secondary/50 transition-colors focus:border-accent"
            placeholder="vous@exemple.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-medium text-text-secondary mb-1.5 uppercase tracking-wider"
          >
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-bg-surface-alt border border-border rounded-input px-4 py-3 text-text-primary placeholder:text-text-secondary/50 transition-colors focus:border-accent"
            placeholder="8 caract\u00e8res minimum"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-accent hover:bg-accent-hover text-white font-medium py-3 rounded-input transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Cr\u00e9ation...' : 'Cr\u00e9er mon compte'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-bg-surface px-3 text-text-secondary">ou</span>
        </div>
      </div>

      <a
        href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`}
        className="w-full flex items-center justify-center gap-3 border border-border rounded-input py-3 text-text-primary hover:bg-bg-surface-alt transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continuer avec Google
      </a>

      <p className="text-center text-sm text-text-secondary mt-6">
        D&eacute;j&agrave; un compte ?{' '}
        <Link
          href="/login"
          className="text-accent hover:text-accent-hover transition-colors"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
