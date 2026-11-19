import { Head, router, useForm, usePage } from '@inertiajs/react';
import { KeyRound, Plus, Trash2, Upload, Undo2 } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { BreadcrumbItem } from '@/types';

type Account = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'guru';
    created_at: string;
};

type TrashedAccount = Account & {
    deleted_at: string | null;
};

type Props = {
    accounts: Account[];
    trashed: TrashedAccount[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kelola Akun',
        href: '/admin/akun',
    },
];

const roleLabels: Record<Account['role'], string> = {
    admin: 'Admin',
    guru: 'Guru',
};

const formatDate = (value: string | null) =>
    value
        ? new Date(value).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          })
        : '—';

const formatDateTime = (value: string | null) =>
    value
        ? new Date(value).toLocaleString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : '—';

export default function KelolaAkun({ accounts, trashed }: Props) {
    const {
        auth,
        status,
        import_errors: importErrorsProp,
        errors: pageErrors = {},
    } = usePage().props as {
        auth: { user: { id: number } };
        status?: string;
        import_errors?: string[] | null;
        errors?: Record<string, string | undefined>;
    };
    // default hanya berlaku untuk undefined — server mengirim null
    const importErrors = importErrorsProp ?? [];
    const currentUserId = auth.user.id;
    const trashError = pageErrors.trashed;

    const [view, setView] = useState<'aktif' | 'sampah'>('aktif');
    const [createOpen, setCreateOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [resetTarget, setResetTarget] = useState<Account | null>(null);
    const [confirmTarget, setConfirmTarget] = useState<Account | null>(null);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [permanentTarget, setPermanentTarget] =
        useState<TrashedAccount | null>(null);
    const [selected, setSelected] = useState<number[]>([]);

    const createForm = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'guru',
    });

    const resetForm = useForm({
        password: '',
        password_confirmation: '',
    });

    const importForm = useForm({
        file: null as File | null,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/akun', {
            onSuccess: () => {
                createForm.reset();
                setCreateOpen(false);
            },
        });
    };

    const handleReset = (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetTarget) return;
        resetForm.post(`/admin/akun/${resetTarget.id}/password`, {
            onSuccess: () => {
                resetForm.reset();
                setResetTarget(null);
            },
        });
    };

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!importForm.data.file) return;
        importForm.post('/admin/akun/import', {
            forceFormData: true,
            onSuccess: () => {
                importForm.reset();
                setImportOpen(false);
            },
        });
    };

    const selectable = accounts.filter(
        (account) => account.id !== currentUserId,
    );
    const allSelected =
        selectable.length > 0 && selected.length === selectable.length;

    const toggleSelect = (id: number) =>
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );

    const toggleAll = () =>
        setSelected(allSelected ? [] : selectable.map((account) => account.id));

    const switchView = (next: 'aktif' | 'sampah') => {
        setView(next);
        setSelected([]);
    };

    const handleDelete = (account: Account) => {
        router.delete(`/admin/akun/${account.id}`, {
            onSuccess: () => {
                setConfirmTarget(null);
                setSelected((prev) => prev.filter((id) => id !== account.id));
            },
        });
    };

    const handleBulkDelete = () => {
        router.post(
            '/admin/akun/hapus-massal',
            { ids: selected },
            {
                onSuccess: () => {
                    setBulkOpen(false);
                    setSelected([]);
                },
            },
        );
    };

    const handleRestore = (account: TrashedAccount) => {
        router.patch(`/admin/akun/${account.id}/pulihkan`);
    };

    const handlePermanentDelete = (account: TrashedAccount) => {
        router.delete(`/admin/akun/${account.id}/permanen`, {
            onSuccess: () => setPermanentTarget(null),
        });
    };

    const tabClass = (active: boolean) =>
        `rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
            active
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
        }`;

    return (
        <>
            <Head title="Kelola Akun" />
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Kelola Akun
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Buat akun guru atau admin baru dan kelola aksesnya.
                            Total {accounts.length} akun aktif, {trashed.length}{' '}
                            di sampah.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Dialog open={importOpen} onOpenChange={setImportOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Upload className="h-4 w-4" />
                                    <span>Unggah Data Guru</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Unggah Data Guru</DialogTitle>
                                    <DialogDescription>
                                        Unggah file .csv atau .xlsx berisi kolom
                                        nama, email, tanggal lahir. Akun Guru
                                        dibuat otomatis — password tiap akun =
                                        tanggal lahir format DDMMYYYY (contoh:
                                        17/05/1985 → 17051985).
                                    </DialogDescription>
                                </DialogHeader>
                                <form
                                    onSubmit={handleImport}
                                    className="space-y-4"
                                >
                                    <div className="grid gap-2">
                                        <Label htmlFor="guru-file">
                                            File data guru
                                        </Label>
                                        <input
                                            id="guru-file"
                                            type="file"
                                            accept=".csv,.txt,.xlsx"
                                            onChange={(e) =>
                                                importForm.setData(
                                                    'file',
                                                    e.target.files?.[0] ?? null,
                                                )
                                            }
                                            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
                                        />
                                        <InputError
                                            message={
                                                importForm.errors.file ??
                                                pageErrors.file
                                            }
                                        />
                                    </div>
                                    <div className="rounded-xl border border-dashed bg-muted/40 px-4 py-3 text-sm">
                                        <p className="font-medium">
                                            Belum punya file?
                                        </p>
                                        <p className="mt-0.5 text-muted-foreground">
                                            Isi kolom nama, email, tanggal lahir
                                            — atau unduh template berikut:
                                        </p>
                                        <div className="mt-2 flex gap-2">
                                            <a
                                                href="/admin/akun/template/csv"
                                                download
                                                className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
                                            >
                                                Template CSV
                                            </a>
                                            <a
                                                href="/admin/akun/template/xlsx"
                                                download
                                                className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
                                            >
                                                Template XLSX
                                            </a>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                            >
                                                Batal
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            type="submit"
                                            disabled={
                                                importForm.processing ||
                                                !importForm.data.file
                                            }
                                        >
                                            {importForm.processing && (
                                                <Spinner />
                                            )}
                                            <span>Unggah &amp; Buat Akun</span>
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4" />
                                    <span>Tambah Akun</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Tambah Akun Guru / Admin
                                    </DialogTitle>
                                    <DialogDescription>
                                        Akun langsung aktif dan bisa dipakai
                                        login. Sampaikan password lewat kanal
                                        yang aman.
                                    </DialogDescription>
                                </DialogHeader>
                                <form
                                    onSubmit={handleCreate}
                                    className="space-y-4"
                                >
                                    <div className="grid gap-2">
                                        <Label htmlFor="account-role">
                                            Role
                                        </Label>
                                        <select
                                            id="account-role"
                                            value={createForm.data.role}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    'role',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none"
                                        >
                                            <option value="guru">Guru</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <InputError
                                            message={createForm.errors.role}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="account-name">
                                            Nama
                                        </Label>
                                        <Input
                                            id="account-name"
                                            value={createForm.data.name}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Nama lengkap"
                                            required
                                        />
                                        <InputError
                                            message={createForm.errors.name}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="account-email">
                                            Email
                                        </Label>
                                        <Input
                                            id="account-email"
                                            type="email"
                                            value={createForm.data.email}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    'email',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="nama@sekolah.id"
                                            required
                                        />
                                        <InputError
                                            message={createForm.errors.email}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="account-password">
                                            Password
                                        </Label>
                                        <Input
                                            id="account-password"
                                            type="password"
                                            value={createForm.data.password}
                                            onChange={(e) =>
                                                createForm.setData(
                                                    'password',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Password awal"
                                            required
                                        />
                                        <InputError
                                            message={createForm.errors.password}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="account-password-confirm">
                                            Konfirmasi Password
                                        </Label>
                                        <Input
                                            id="account-password-confirm"
                                            type="password"
                                            value={
                                                createForm.data
                                                    .password_confirmation
                                            }
                                            onChange={(e) =>
                                                createForm.setData(
                                                    'password_confirmation',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Ulangi password"
                                            required
                                        />
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                            >
                                                Batal
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            type="submit"
                                            disabled={createForm.processing}
                                        >
                                            {createForm.processing && (
                                                <Spinner />
                                            )}
                                            <span>Buat Akun</span>
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {typeof status === 'string' && status && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                        {status}
                    </div>
                )}

                {importErrors.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        <p className="font-semibold">
                            {importErrors.length} baris dilewati saat impor:
                        </p>
                        <ul className="mt-1 list-disc space-y-0.5 pl-5">
                            {importErrors.map((message) => (
                                <li key={message}>{message}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {trashError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                        {trashError}
                    </div>
                )}

                <div className="flex w-fit gap-1 rounded-xl bg-muted p-1">
                    <button
                        type="button"
                        onClick={() => switchView('aktif')}
                        aria-pressed={view === 'aktif'}
                        className={tabClass(view === 'aktif')}
                    >
                        Akun Aktif ({accounts.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => switchView('sampah')}
                        aria-pressed={view === 'sampah'}
                        className={tabClass(view === 'sampah')}
                    >
                        Sampah ({trashed.length})
                    </button>
                </div>

                {view === 'aktif' ? (
                    <>
                        {selected.length > 0 && (
                            <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm font-medium text-red-800">
                                    {selected.length} akun dipilih
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelected([])}
                                    >
                                        Batal Pilih
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setBulkOpen(true)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        <span>Hapus Terpilih</span>
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10">
                                            <Checkbox
                                                checked={
                                                    allSelected
                                                        ? true
                                                        : selected.length > 0
                                                          ? 'indeterminate'
                                                          : false
                                                }
                                                onCheckedChange={toggleAll}
                                                aria-label="Pilih semua akun"
                                                disabled={
                                                    selectable.length === 0
                                                }
                                            />
                                        </TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Terdaftar</TableHead>
                                        <TableHead className="text-right">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {accounts.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="py-8 text-center text-sm text-muted-foreground"
                                            >
                                                Belum ada akun guru atau admin.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        accounts.map((account) => {
                                            const deletable =
                                                account.id !== currentUserId;

                                            return (
                                                <TableRow
                                                    key={account.id}
                                                    className={
                                                        selected.includes(
                                                            account.id,
                                                        )
                                                            ? 'bg-muted/50'
                                                            : undefined
                                                    }
                                                >
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selected.includes(
                                                                account.id,
                                                            )}
                                                            onCheckedChange={() =>
                                                                toggleSelect(
                                                                    account.id,
                                                                )
                                                            }
                                                            aria-label={`Pilih ${account.name}`}
                                                            disabled={
                                                                !deletable
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-semibold">
                                                        {account.name}
                                                        {!deletable && (
                                                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                                (Anda)
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {account.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                account.role ===
                                                                'admin'
                                                                    ? 'default'
                                                                    : 'outline'
                                                            }
                                                        >
                                                            {roleLabels[
                                                                account.role
                                                            ] ?? account.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(
                                                            account.created_at,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    resetForm.reset();
                                                                    setResetTarget(
                                                                        account,
                                                                    );
                                                                }}
                                                            >
                                                                <KeyRound className="h-3.5 w-3.5" />
                                                                <span>
                                                                    Reset
                                                                    Password
                                                                </span>
                                                            </Button>
                                                            {deletable && (
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                                                                    title="Pindahkan ke sampah"
                                                                    onClick={() =>
                                                                        setConfirmTarget(
                                                                            account,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                    <span className="sr-only">
                                                                        Hapus{' '}
                                                                        {
                                                                            account.name
                                                                        }
                                                                    </span>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                ) : (
                    <div className="overflow-hidden rounded-2xl border bg-card shadow-xs">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Dihapus</TableHead>
                                    <TableHead className="text-right">
                                        Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {trashed.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="py-8 text-center text-sm text-muted-foreground"
                                        >
                                            Sampah masih kosong.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    trashed.map((account) => (
                                        <TableRow key={account.id}>
                                            <TableCell className="font-semibold">
                                                {account.name}
                                            </TableCell>
                                            <TableCell>
                                                {account.email}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {roleLabels[account.role] ??
                                                        account.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {formatDateTime(
                                                    account.deleted_at,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleRestore(
                                                                account,
                                                            )
                                                        }
                                                    >
                                                        <Undo2 className="h-3.5 w-3.5" />
                                                        <span>Pulihkan</span>
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                                                        onClick={() =>
                                                            setPermanentTarget(
                                                                account,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                        <span>
                                                            Hapus permanen
                                                        </span>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                <Dialog
                    open={resetTarget !== null}
                    onOpenChange={(open) => !open && setResetTarget(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Reset Password</DialogTitle>
                            <DialogDescription>
                                Atur password baru untuk {resetTarget?.email}.
                                Sampaikan password baru lewat kanal yang aman.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleReset} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="reset-password">
                                    Password Baru
                                </Label>
                                <Input
                                    id="reset-password"
                                    type="password"
                                    value={resetForm.data.password}
                                    onChange={(e) =>
                                        resetForm.setData(
                                            'password',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Password baru"
                                    required
                                />
                                <InputError
                                    message={resetForm.errors.password}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="reset-password-confirm">
                                    Konfirmasi Password Baru
                                </Label>
                                <Input
                                    id="reset-password-confirm"
                                    type="password"
                                    value={resetForm.data.password_confirmation}
                                    onChange={(e) =>
                                        resetForm.setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Ulangi password baru"
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="outline">
                                        Batal
                                    </Button>
                                </DialogClose>
                                <Button
                                    type="submit"
                                    disabled={resetForm.processing}
                                >
                                    {resetForm.processing && <Spinner />}
                                    <span>Simpan Password</span>
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={confirmTarget !== null}
                    onOpenChange={(open) => !open && setConfirmTarget(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Pindahkan ke Sampah?</DialogTitle>
                            <DialogDescription>
                                Akun {confirmTarget?.email} tidak bisa dipakai
                                login, tapi masih bisa dipulihkan dari tab
                                Sampah.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </DialogClose>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() =>
                                    confirmTarget && handleDelete(confirmTarget)
                                }
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Hapus</span>
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Pindahkan {selected.length} akun ke Sampah?
                            </DialogTitle>
                            <DialogDescription>
                                Akun terpilih tidak bisa dipakai login dan bisa
                                dipulihkan kembali dari tab Sampah.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </DialogClose>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleBulkDelete}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Hapus {selected.length} Akun</span>
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={permanentTarget !== null}
                    onOpenChange={(open) => !open && setPermanentTarget(null)}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Hapus permanen?</DialogTitle>
                            <DialogDescription>
                                Akun {permanentTarget?.email} dihapus selamanya
                                dan tidak bisa dipulihkan. Akun yang masih
                                memiliki data ujian harus dihapus ujiannya dulu.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </DialogClose>
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={() =>
                                    permanentTarget &&
                                    handlePermanentDelete(permanentTarget)
                                }
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Hapus Permanen</span>
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

KelolaAkun.layout = {
    breadcrumbs,
};
