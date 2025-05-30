using po from '../db/schema';

@protocol: 'rest'
service PurchaseOrderService {
    entity PurchaseOrder as projection on po.PurchaseOrder;
    entity PurchaseItem  as projection on po.PurchaseItem;
    action   approvePO(ID : UUID);
    action   markAsOrdered(ID : UUID);

    function getKPIs()                           returns {
        totalOrders    : Integer;
        pendingOrders  : Integer;
        approvedOrders : Integer;
        orderedOrders  : Integer;
        totalAmount    : Decimal(15, 2);
    };

    action   generatePDF(ID : UUID)              returns Binary;
    action   emailPDF(ID : UUID, email : String) returns String;
}
