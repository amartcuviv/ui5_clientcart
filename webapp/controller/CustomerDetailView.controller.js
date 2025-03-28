sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("fioritest.fioritest.controller.CustomerDetailView", {
        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("customerDetail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            const sCustomerId = oEvent.getParameter("arguments").customerId;

            // Now you have the customerId.  Fetch the data:
            this._loadCustomerData(sCustomerId);
        },

        _loadCustomerData: function (customerId) {
            const oModel = this.getOwnerComponent().getModel("CustomerModel"); // Get the main model
            const aCustomers = oModel.getProperty("/Customers");
            const oCustomer = aCustomers.find(customer => customer.CustomerID === customerId);

            if (oCustomer) {
                // Create a local JSON model for the detail view
                const oCustomerModel = new JSONModel(oCustomer);
                this.getView().setModel(oCustomerModel, "customerModel"); //Set model to "customerModel"
            } else {
                console.error("Customer not found with ID:", customerId);
                // Handle the case where the customer isn't found (e.g., display an error message)
            }
        }
    });
});