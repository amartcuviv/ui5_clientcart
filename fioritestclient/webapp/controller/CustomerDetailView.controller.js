sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library"
], function (Controller, JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("fioriamlclient.fioritestclient.controller.CustomerDetailView", {
        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("customerDetail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const sCustomerId = oEvent.getParameter("arguments").customerId;
            
            // Cargar datos filtrados por el CustomerId
            this._loadCustomerData(sCustomerId);
        },
        

        _loadCustomerData: function (customerId) {
            const oModel = this.getView().getModel();
            this.getView().bindElement({
                path: "/ZFIORI_CLIENTE('" + customerId + "')"
            });
        }
        
    });
});
