import { AdminProductEditPage } from '@/app/admin/admin-pages';
export default function ProductEdit({ params }: { params: { slug: string } }) { return <AdminProductEditPage slug={params.slug}/>; }
