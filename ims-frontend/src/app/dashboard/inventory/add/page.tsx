import AddInventoryForm from './_components/add-inventory-form';

export default function AddInventoryPage() {
    return (
        <div>
            {/* Header */}
            <header>
                <h1 className="font-semibold">Add New Inventory</h1>
                <p className="text-muted-foreground mt-2">
                    Make changes to your profile here. Click save when you're
                    done.
                </p>
            </header>
            {/* Form Fields */}
            <section className="py-8">
                <AddInventoryForm />
            </section>
        </div>
    );
}
