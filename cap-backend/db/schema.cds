namespace po;

entity PurchaseOrder {
    key ID          : UUID;
        title       : String;
        description : String;
        createdAt   : Timestamp;
        createdBy   : String;
        status      : String enum {
            PENDING;
            APPROVED;
            ORDERED
        };
        totalAmount : Decimal(15, 2);
        items       : Composition of many PurchaseItem
                          on items.parent = $self;
}

entity PurchaseItem {
    key ID        : UUID;
        parent    : Association to PurchaseOrder;
        product   : String;
        quantity  : Integer;
        unitPrice : Decimal(10, 2);
}
