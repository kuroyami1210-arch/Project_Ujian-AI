<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * @param  string  ...$roles  Allowed role values (e.g. "guru", "siswa").
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! $user->is_active) {
            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => 'Akun Anda telah dinonaktifkan. Hubungi guru/admin.',
            ]);
        }

        $allowed = array_map(function (string $role): string {
            $enum = UserRole::tryFrom($role);

            return $enum === null ? $role : $enum->value;
        }, $roles);

        if (! in_array($user->role->value, $allowed, true)) {
            abort(403, 'Anda tidak memiliki akses ke halaman ini.');
        }

        return $next($request);
    }
}
