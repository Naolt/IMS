import EditInventoryForm from './_components/EditInventoryForm';

export default async function EditProductPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold">Edit Product</h1>
                <p className="text-muted-foreground">
                    Update product information and variants
                </p>
            </div>
            <EditInventoryForm productId={id} />
        </div>
    );
}
