import { Inventory } from './columns';

export const inventoryData: Inventory[] = [
    {
        id: '1',
        productCode: 'PRD-001',
        productName: 'T-Shirt',
        productCategory: 'Clothing',
        productBrand: 'Zara',
        size: 'M',
        color: 'Red',
        stockQuantity: 10,
        minStockQuantity: 5,
        buyingPrice: 20,
        sellingPrice: 40,
        imageUrl: 'https://example.com/images/prd-001-red-m.jpg',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15'
    },
    {
        id: '2',
        productCode: 'PRD-001',
        productName: 'T-Shirt',
        productCategory: 'Clothing',
        productBrand: 'Zara',
        size: 'L',
        color: 'Blue',
        stockQuantity: 5,
        minStockQuantity: 3,
        buyingPrice: 20,
        sellingPrice: 40,
        imageUrl: 'https://example.com/images/prd-001-blue-l.jpg',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15'
    },
    {
        id: '3',
        productCode: 'PRD-002',
        productName: 'Running Shoes',
        productCategory: 'Shoes',
        productBrand: 'Nike',
        size: '42',
        color: 'Black',
        stockQuantity: 15,
        minStockQuantity: 5,
        buyingPrice: 50,
        sellingPrice: 80,
        imageUrl: 'https://example.com/images/prd-002-black-42.jpg',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-20'
    },
    {
        id: '4',
        productCode: 'PRD-002',
        productName: 'Running Shoes',
        productCategory: 'Shoes',
        productBrand: 'Nike',
        size: '44',
        color: 'White',
        stockQuantity: 8,
        minStockQuantity: 4,
        buyingPrice: 50,
        sellingPrice: 80,
        imageUrl: 'https://example.com/images/prd-002-white-44.jpg',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-20'
    },
    {
        id: '5',
        productCode: 'PRD-003',
        productName: 'Handbag',
        productCategory: 'Bags',
        productBrand: 'Gucci',
        size: 'One Size',
        color: 'Brown',
        stockQuantity: 12,
        minStockQuantity: 2,
        buyingPrice: 200,
        sellingPrice: 350,
        imageUrl: 'https://example.com/images/prd-003-brown.jpg',
        createdAt: '2024-01-05',
        updatedAt: '2024-01-25'
    },
    {
        id: '6',
        productCode: 'PRD-004',
        productName: 'Sunglasses',
        productCategory: 'Accessories',
        productBrand: 'Ray-Ban',
        size: 'One Size',
        color: 'Black',
        stockQuantity: 20,
        minStockQuantity: 5,
        buyingPrice: 100,
        sellingPrice: 150,
        imageUrl: 'https://example.com/images/prd-004-black.jpg',
        createdAt: '2024-02-01',
        updatedAt: '2024-02-10'
    },
    {
        id: '7',
        productCode: 'PRD-005',
        productName: 'Casual Shirt',
        productCategory: 'Clothing',
        productBrand: 'H&M',
        size: 'S',
        color: 'White',
        stockQuantity: 25,
        minStockQuantity: 10,
        buyingPrice: 15,
        sellingPrice: 30,
        imageUrl: 'https://example.com/images/prd-005-white-s.jpg',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-30'
    },
    {
        id: '8',
        productCode: 'PRD-005',
        productName: 'Casual Shirt',
        productCategory: 'Clothing',
        productBrand: 'H&M',
        size: 'M',
        color: 'Black',
        stockQuantity: 18,
        minStockQuantity: 7,
        buyingPrice: 15,
        sellingPrice: 30,
        imageUrl: 'https://example.com/images/prd-005-black-m.jpg',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-30'
    },
    {
        id: '9',
        productCode: 'PRD-006',
        productName: 'Sneakers',
        productCategory: 'Shoes',
        productBrand: 'Adidas',
        size: '40',
        color: 'Gray',
        stockQuantity: 10,
        minStockQuantity: 3,
        buyingPrice: 60,
        sellingPrice: 90,
        imageUrl: 'https://example.com/images/prd-006-gray-40.jpg',
        createdAt: '2024-01-20',
        updatedAt: '2024-01-28'
    },
    {
        id: '10',
        productCode: 'PRD-007',
        productName: 'Denim Jacket',
        productCategory: 'Clothing',
        productBrand: 'Levi’s',
        size: 'L',
        color: 'Blue',
        stockQuantity: 1,
        minStockQuantity: 2,
        buyingPrice: 35,
        sellingPrice: 60,
        imageUrl: 'https://example.com/images/prd-007-blue-l.jpg',
        createdAt: '2024-02-05',
        updatedAt: '2024-02-10'
    }
];

export const categories = Array.from(
    new Set(inventoryData.map((item) => item.productCategory))
).map((category) => {
    return {
        label: category,
        value: category
    };
});

export const brands = Array.from(
    new Set(inventoryData.map((item) => item.productBrand))
).map((brand) => {
    return {
        label: brand,
        value: brand
    };
});

export const stockOptions = [
    {
        label: 'In Stock',
        value: 'In Stock'
    },
    {
        label: 'Out of Stock',
        value: 'Out of Stock'
    },
    {
        label: 'Low Stock',
        value: 'Low Stock'
    }
];

export const colors = Array.from(
    new Set(inventoryData.map((item) => item.color))
).map((color) => {
    return {
        label: (
            <div className="flex items-center">
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                ></div>
                <span className="ml-2">{color}</span>
            </div>
        ),
        value: color
    };
});

export const sizes = Array.from(
    new Set(inventoryData.map((item) => item.size))
).map((size) => {
    return {
        label: size,
        value: size
    };
});
