import { redirect } from "next/navigation";
export default async function ProductTagPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    redirect(`/shop?tag=${encodeURIComponent(slug)}`);
}
