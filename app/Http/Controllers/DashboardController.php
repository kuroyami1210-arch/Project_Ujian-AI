<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;

class DashboardController extends Controller
{
    public function __invoke(): RedirectResponse
    {
        $user = request()->user();

        if ($user->isAdmin()) {
            return redirect()->to('/admin/akun');
        }

        return redirect()->to($user->isGuru() ? '/guru' : '/siswa');
    }
}
